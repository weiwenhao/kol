'use strict';

module.exports = {
  schedule: {
    interval: '1s', // 1 分钟间隔
    disable: isDisable,
    type: 'all', // 指定所有的 worker 都需要执行
  },
  async task(ctx) {
    const random = Math.random();
    const bool = true;
    while (bool) {
      await ctx.helper.sleep(1000);
      console.log(random);
    }
  },
};
