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
  }

  // 不能挂，双进程
  async run() {
    const Op = Sequelize.Op;
    const loop = true;
    const { ctx, app } = this;

    while (loop) {
      const user = await ctx.model.User.findOne({
      // 美国
        where: {
          viewed_at: { [Op.is]: null }, // 还未查看
          faces_at: { [Op.is]: null }, // 未人脸识别过
          follower_count: {
            [Op.gte]: 500,
            [Op.lt]: 50000,
          },
          email: {
            [Op.not]: null,
            [Op.ne]: '',
          },
          country: 'United States',
        },
      });

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
        continue;
      }


      user.facesAt = dayjs().valueOf();
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
    // 图像转 base64
    const response = await fetch(url, {
      agent: this.proxyClient,
    });

    const buffer = await response.buffer();
    const image = buffer.toString('base64');

    // 调用人脸检测
    const result = await this.client.detect(image, 'BASE64', {
      face_field: 'age,beauty,gender,expression,race,emotion',
    });


    if (result.error_code !== 0) {
      app.logger.info(`[instagram] 识别异常， error_code: ${result.error_code}, error_msg: ${result.error_msg}`);
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
