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

    this.pool = [];
  }

  // 不能挂，双进程
  async run() {
    const Op = Sequelize.Op;
    const loop = true;
    const { ctx, app } = this;
    app.logger.info('[instagram-face] 人脸识别程序启动');
    const client = new ApiFaceClient(...Object.values(app.config.faceApi));
    const proxyClient = new HttpsProxyAgent(app.config.proxy);

    while (loop) {
      const user = await ctx.model.User.findOne({
      // 美国
        where: {
          viewed_at: { [Op.is]: null }, // 还未查看
          faces_at: { [Op.is]: null }, // 未人脸识别过
          follower_count: {
            [Op.gte]: 500,
          },
          country: 'United States',
        },
      });

      let url = user.avatar;
      if (user.origin.hd_profile_pic_versions && user.origin.hd_profile_pic_versions.length > 1) {
        url = user.origin.hd_profile_pic_versions[1].url;
      }

      // 图像转 base64
      const response = await fetch(url, {
        agent: proxyClient,
      });
      const buffer = await response.buffer();
      const image = buffer.toString('base64');

      // 调用人脸检测
      const result = await client.detect(image, 'BASE64', {
        face_field: 'age,beauty,gender,expression,race,emotion',
      });

      app.logger.info(`[instagram-face] 人脸识别url: ${url}`);
      if (result.error_code !== 0) {
        console.log(`[instagram] 识别异常，user_id: ${user.id} error_code: ${result.error_code}, error_msg: ${result.error_msg}`);
      } else {
        const face = result.result.face_list[0];
        user.age = face.age;
        user.beauty = face.beauty;
        user.gender = face.gender.type;
        user.race = face.race.type;
        app.logger.info(`[instagram-face] 人脸识别成功, user_id: ${user.id}, 性别: ${face.gender.type}, 年龄：${face.age}, 颜值：${face.beauty}, 人种：${face.race.type}`);
      }

      user.facesAt = dayjs().valueOf();
      await user.save();
    }
  }

}

module.exports = FaceService;
