'use strict';

const Service = require('egg').Service;

// 使用 instagram web api 填充 queue 队列
class QueueService extends Service {
  constructor(ctx) {
    super(ctx);
    this.pool = [];
  }
}

module.exports = QueueService;
