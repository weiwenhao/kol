'use strict';

const { Sequelize } = require('sequelize');
const Service = require('egg').Service;
const ApiFaceClient = require('baidu-aip-sdk').face;
const HttpsProxyAgent = require('https-proxy-agent');
const fetch = require('node-fetch');
const dayjs = require('dayjs');

class FaceService extends Service {
  constructor(ctx) {
    super(ctx);

    this.app.logger.info('[instagram-face] 人脸识别程序启动');
    this.client = new ApiFaceClient(...Object.values(this.app.config.faceApi));
    this.proxyClient = new HttpsProxyAgent(this.app.config.proxy);
    this.lockClient = this.ctx.service.lock.client();
  }

  // 不能挂，双进程
  async run() {
    const Op = Sequelize.Op;
    const loop = true;
    const { ctx, app } = this;

    while (loop) {
      const lock = await this.lockClient.lock('locks:face', 10000);
      const start = dayjs().valueOf();
      app.logger.info('[instagram-face] redis-lock success');
      const user = await ctx.model.User.findOne({
      // 美国
        where: {
          country: 'United States',
          // follower_count: {
          //   [Op.gte]: 500,
          //   [Op.lt]: 20000,
          // },
          email: {
            [Op.ne]: '',
          },
          faces_at: { [Op.is]: null }, // 未人脸识别过
        },
      });

      // 不存在 user 则等待
      if (!user) {
        // 释放锁
        lock.unlock().catch(function(err) {
          app.logger.warn(`[instagram-face] 锁释放异常, ${err}`);
        });
        app.logger.warn('[instagram-face] users 已经识别完毕，等待 5 分钟后再次开始');
        await this.ctx.helper.sleep(300 * 1000);
        continue;
      }
      // 更新时间并解锁
      user.facesAt = dayjs().valueOf();
      user.save();
      lock.unlock().catch(function(err) {
        app.logger.warn(`[instagram-face] 锁释放异常, ${err}`);
      });
      const timer = dayjs().valueOf() - start;
      app.logger.info(`[instagram-face] redis-unlock-lock success, 锁定时长: ${timer}ms`);

      let url = user.avatar;
      if (user.origin.hd_profile_pic_versions && user.origin.hd_profile_pic_versions.length > 1) {
        url = user.origin.hd_profile_pic_versions[1].url;
      }
      app.logger.info(`[instagram-face] user_id:${user.id},人脸识别url: ${url}`);
      let face = null;
      try {
        face = await this.face(url);
      } catch (error) {
        this.app.logger.warn(`[instagram-face] 识别异常,等待 10 秒后重试, ${error}`);
        await this.ctx.helper.sleep(10 * 1000);
        // 更新 faces_at = null
        user.facesAt = null;
        user.save();
        continue;
      }

      // 没有识别到人脸
      if (!face) {
        await user.save();
        continue;
      }

      user.age = face.age;
      user.beauty = face.beauty;
      user.gender = face.gender;
      user.race = face.race;
      await user.save();
    }
  }

  async face(url) {
    const { app } = this;
    const options = {};
    if (this.app.config.isProxy) {
      options.agent = this.proxyClient;
    }

    // 图像转 base64
    const response = await fetch(url, options);

    const buffer = await response.buffer();
    const image = buffer.toString('base64');

    // 调用人脸检测
    const result = await this.client.detect(image, 'BASE64', {
      face_field: 'age,beauty,gender,expression,race,emotion',
    });


    if (result.error_code !== 0) {
      app.logger.info(`[instagram-face] 识别异常， error_code: ${result.error_code}, error_msg: ${result.error_msg}`);
      return false;
    }

    const face = result.result.face_list[0];
    app.logger.info(`[instagram-face] 人脸识别成功, 性别: ${face.gender.type}, 年龄：${face.age}, 颜值：${face.beauty}, 人种：${face.race.type}`);

    return {
      age: face.age,
      beauty: face.beauty,
      gender: face.gender.type,
      race: face.race.type,
    };
  }

}

module.exports = FaceService;
