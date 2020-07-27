'use strict';

module.exports = {
  schedule: {
    interval: '30d', // 1 分钟间隔
    immediate: true,
    disable: false,
    type: 'worker',
  },
  async task(ctx) {
    ctx.app.logger.info('[instagram] 任务启动');
    ctx.service.instagram.crawl.run();
  },
};
