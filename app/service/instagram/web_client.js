'use strict';

const Service = require('egg').Service;
const path = require('path');
const Instagram = require('instagram-web-api');
const FileCookieStore = require('tough-cookie-filestore2');
const _ = require('lodash');
const dayjs = require('dayjs');

class WebClientService extends Service {
  constructor(ctx) {
    super(ctx);

    this.pool = [];
  }

  async init() {
    // 获取账号列表
    const accounts = this.ctx.app.config.instagram.accounts;
    const pool = [];

    // 登录
    for (const { username, password, proxy } of accounts) {
      const cookiePath = path.resolve(process.cwd() + `/database/cookies/${username}.json`);
      const cookieStore = new FileCookieStore(cookiePath);
      const options = {};
      if (this.app.config.isProxy) {
        options.proxy = proxy;
      }

      const client = new Instagram({ username, password, cookieStore }, options);
      const profile = await client.getProfile();
      if (!profile) {
        // 登录一下
        await client.login();
        this.app.logger.info(`[instagram] web client 登录成功, username: ${username}`);
      } else {
        this.app.logger.info(`[instagram] web client 加载登录状态成功, username: ${username}`);
      }
      pool.push(this.newPoolItem(username, client));
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

module.exports = WebClientService;
