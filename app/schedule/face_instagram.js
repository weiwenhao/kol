'use strict';

module.exports = app => {
  return {
    schedule: {
      interval: '30d', // 1 分钟间隔
      immediate: true,
      disable: app.config.scheduleDisabled.faceInstagram,
      type: 'worker',
    },
    async task(ctx) {
      ctx.service.instagram.face.run();
    },
  };

};
