'use strict';

const Service = require('egg').Service;
const { IgApiClient } = require('instagram-private-api');
const _ = require('lodash');
const dayjs = require('dayjs');

class ClientService extends Service {
  constructor(ctx) {
    super(ctx);

    this.redisStateKey = 'instagram_accounts_states:{username}';
    /**
     * {
     *    "disabled_at": now(), // 禁用到什么时候，用该字段限制
     *    "client": object, // ins 可用客户端对象
     * }
     */
    this.pool = [];
  }

  async init() {
    // 获取账号列表
    const accounts = this.ctx.app.config.instagram.accounts;
    const { redis } = this.app;
    const pool = [];

    // 登录
    for (const { username, password, proxy } of accounts) {
      const key = this.redisStateKey.replace('{username}', username);
      const ins = new IgApiClient();
      ins.state.generateDevice(username);
      ins.state.proxyUrl = proxy;

      let serialized = await redis.get(key);
      if (!serialized) {
        // TODO catch error
        await ins.account.login(username, password);
        this.app.logger.info(`[instagram] 登录成功, username: ${username}`);

        // 序列化登录状态
        serialized = await ins.state.serialize();
        delete serialized.constants; // this deletes the version info, so you'll always use the version provided by the library

        serialized = JSON.stringify(serialized);
        // 存储到 redis
        redis.set(key, serialized);
      }

      await ins.state.deserialize(JSON.parse(serialized));
      pool.push(this.newPoolItem(username, ins));
      this.app.logger.info(`[instagram] 加载登录状态成功, username: ${username}`);
    }

    return pool;
  }

  newPoolItem(username, client) {
    return {
      username,
      client,
      disabled_at: null,
      count: 0,
    };
  }

  disableClient(username) {
    const item = this.pool.find(item => item.username === username);
    item.disabled_at = dayjs().unix() + 600;
  }

  /**
   * 获取一个可用的客户端
   */
  async get() {
    // 判定初始化
    if (_.isEmpty(this.pool)) {
      this.pool = await this.init();
    }

    // 未禁用，并且 count 最少
    const select = _(this.pool).sortBy('count')
      .filter(item => {
        return item.disabled_at < dayjs().unix();
      })
      .first();

    if (!select) {
      return null;
    }

    select.count++;
    return select;
  }
}

module.exports = ClientService;
