'use strict';

// 全局变量
let isRun = false;
module.exports = app => {
  return {
    schedule: {
      interval: '1m', // 1 分钟间隔
      immediate: true,
      disable: app.config.scheduleDisabled.crawlInstagram,
      type: 'worker',
    },
    async task(ctx) {
      if (isRun === true) {
        return;
      }
      isRun = true;
      ctx.service.instagram.crawl.run().catch(error => {
        app.logger.error(`[instagram] 任务异常,1分钟内重启， ${error}`);
        isRun = false;
      });
    },
  };

};
