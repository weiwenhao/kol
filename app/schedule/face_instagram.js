'use strict';

// 全局变量
let isRun = false;
module.exports = app => {
  return {
    schedule: {
      interval: '1m', // 1 分钟间隔
      immediate: true,
      disable: app.config.scheduleDisabled.faceInstagram,
      type: 'worker',
    },
    async task(ctx) {
      if (isRun === true) {
        return;
      }

      app.logger.info('[instagram-face] 人脸识别程序启动');
      isRun = true;
      ctx.service.instagram.face.run().catch(error => {
        app.logger.error(`[instagram-face] 任务异常,1分钟内重启， ${error}`);
        isRun = false;
      });
    },
  };

};
