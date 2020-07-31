'use strict';

module.exports = app => {
  return {
    schedule: {
      interval: '30d', // 1 分钟间隔
      immediate: true,
      disable: app.config.scheduleDisabled.crawlInstagram,
      type: 'worker',
    },
    async task(ctx) {
      ctx.service.instagram.crawl.run();
    },
  };

};
