'use strict';

module.exports = {
  schedule: {
    interval: '5m', // 1 分钟间隔
    type: 'all', // 指定所有的 worker 都需要执行
  },
  async task() {
    // console.log('php 是世界上最好的语言');
  },
};
