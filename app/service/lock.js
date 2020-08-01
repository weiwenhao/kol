'use strict';

const Service = require('egg').Service;
const RedisLock = require('redlock');

class LockService extends Service {
  client() {
    const { redis } = this.app;

    const client = new RedisLock(
      [ redis ],
      {
        // the expected clock drift; for more details
        // see http://redis.io/topics/distlock
        driftFactor: 0.01, // time in ms

        // 一直尝试，直到获取资源
        retryCount: -1,

        // the time in ms between attempts
        retryDelay: 200, // time in ms

        // the max time in ms randomly added to retries
        // to improve performance under high contention
        // see https://www.awsarchitectureblog.com/2015/03/backoff.html
        retryJitter: 200, // time in ms
      }
    );

    return client;
  }
}

module.exports = LockService;
