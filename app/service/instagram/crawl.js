'use strict';

const dayjs = require('dayjs');
const _ = require('lodash');
const { Sequelize } = require('sequelize');
const Service = require('egg').Service;

class CrawlService extends Service {
  constructor(ctx) {
    super(ctx);
    this.frequency = 1;
    // init client
    this.client = this.ctx.service.instagram.client;
    // web client
    this.webClient = this.ctx.service.instagram.webClient;
  }
  async run() {
    const { ctx, app } = this;
    const loop = true;
    const awaitSecond = 2;

    while (loop) {
      await ctx.helper.sleep(awaitSecond * 1000);

      // 可用客户端检查
      const select = await this.client.get();
      if (!select) {
        app.logger.warn(`[instagram] 暂无可用客户端,等待 ${awaitSecond} 秒后重试`);
        continue;
      }
      app.logger.info(`[instagram] 客户端选择成功, account: ${select.username}, 抓取用户次数： ${select.count}`);

      // await 单协程填充 queue,防止频率限制 TODO 独立进程
      // queue 长度检查， 队列少于 1000 并且粉丝数量少于 10000 才抓取
      const count = await ctx.model.InstagramQueue.count();
      if (count < 1000) {
        await this.fillQueue();
      }

      // 队列检查
      const item = await ctx.model.InstagramQueue.findOne();
      if (!item) {
        app.logger.warn(`[instagram] instagram queue 为空,等待 ${awaitSecond} 秒后重试`);
        continue;
      }

      // 重复抓取检查
      const { instagramId, username } = item;
      const exits = await ctx.model.User.count({
        where: { username },
      });
      if (exits) {
        await this.popQueue(username);
        continue;
      }

      // 抓取前从队列中删除该元素,防止下一次重复采集
      await this.popQueue(username);

      this.crawlUser(instagramId, username, select);
    }
  }

  async popQueue(username) {
    await this.ctx.model.InstagramQueue.destroy({
      where: {
        username,
      },
    });
  }
  async pushQueue(instagramId, username) {
    await this.ctx.model.InstagramQueue.create({
      instagramId,
      username,
    });
  }

  async fillQueue() {
    const { ctx } = this;
    const Op = Sequelize.Op;
    // 挑选 (未被抓取，并且优先选择喜欢的用户)
    // 先从喜欢的对象入手
    let user = await ctx.model.User.findOne({
      where: {
        following_at: { [Op.is]: null },
        selected_at: { [Op.not]: null },
      },
    });
    if (!user) {
      user = await ctx.model.User.findOne({
        where: {
          following_at: { [Op.is]: null },
          follower_count: {
            [Op.gte]: 500,
            [Op.lt]: 10000,
          },
        },
      });
    }
    // 还是没有就放弃吧
    if (!user) {
      this.app.logger.warn('[instagram] 找不到可以抓取关注列表的 kol');
      return;
    }

    this.app.logger.info(`[instagram] 填充 queue,使用 following, username: ${user.username}`);

    // 如果客户端的 following 被封禁，则跳过, 分开 try catch
    const instagramId = user.origin.pk;
    // 移动 api 抓取关注者
    // const { client, username: account, count } = await this.client.get();
    // this.app.logger.info(`[instagram] client 抓取 following, account: ${account}, 抓取用户次数： ${count}`);
    // const followings = await this.fetchFollowings(client, instagramId);

    // web api 抓取关注者
    const { client: webClient, username: webAccount, count: webCount } = await this.webClient.get();
    this.app.logger.info(`[instagram] web client 抓取 following, account: ${webAccount}, 抓取用户次数： ${webCount}`);
    const followings = await this.fetchWebFollowings(webClient, instagramId);

    for (const item of followings) {
      // 存在于已抓取对象
      let exits = await ctx.model.User.count({
        where: { username: item.username },
      });
      if (exits) {
        continue;
      }

      // 存在于待抓取队列
      exits = await ctx.model.InstagramQueue.count({
        where: { username: item.username },
      });
      if (exits) {
        continue;
      }

      ctx.model.InstagramQueue.create(item);
    }

    // 设置为已抓取关注者
    user.followingAt = dayjs().valueOf();
    await user.save();

    // TODO 推荐人获取
  }

  async fetchWebFollowings(client, instagramId) {
    const followings = [];
    let loop = 20;
    let after = null;
    while (loop) {
      const page = await client.getFollowings({ userId: instagramId, first: 50, after }); // 最多 50
      after = page.page_info.end_cursor;
      this.app.logger.info(`[instagram] 抓取关注者成功, instagram id: ${instagramId}, 本次抓取数量: ${page.data.length}, has_next_page: ${page.page_info.has_next_page}`);

      // 如果数据重复，也 break, 罕见情况，需要告警支持
      const exits = followings.find(item => item.instagramId === page.data[0].pk);
      if (exits) {
        this.app.logger.warn(`[instagram] 获取关注者异常，has_next_page true，但是抓取的关注着却重复了！ 抓取 id: ${instagramId}`);
        break;
      }

      for (const user of page.data) {
        followings.push({
          username: user.username,
          instagramId: user.id,
        });
      }

      if (!page.page_info.has_next_page) {
        this.app.logger.info(`[instagram] has_next_page = false，停止抓取关注者, instagram id: ${instagramId}, 抓取关注者数量: ${followings.length}`);
        break;
      }

      loop--;
      if (loop === 0) {
        this.app.logger.info(`[instagram] 本次抓取超过 20 次, 停止抓取, instagram id: ${instagramId}, 抓取关注者数量: ${followings.length}`);
      }

      await this.ctx.helper.sleep(2000);
    }

    return followings;
  }

  // seeder  24761205 tiaa_angeline
  async crawlUser(instagramId, username, select) {
    const { ctx, app } = this;
    const { client, username: account, count } = select;
    app.logger.info(`[instagram] 抓取中，insgram id: ${instagramId}, username: ${username}`);

    try {
      let user = await this.fetchInfo(client, instagramId);
      // 抓取识别跳过(私有客户会存在这种情况)
      if (!user) {
        return;
      }

      await ctx.helper.sleep(1000);
      const posts = await this.fetchPosts(client, instagramId);
      // 从 posts 中挑选出地区信息
      user = { ...user, ...this.parseRegionBy(posts) };
      app.logger.info(`[instagram] 抓取成功，insgram id: ${instagramId}, username: ${username}`);

      // 用户写入
      const { id: userId } = await ctx.model.User.create(user);
      // 帖子写入
      for (const post of posts) {
        post.userId = userId;
        ctx.model.InstagramPost.create(post);
      }

      app.logger.info(`[instagram] 数据写入成功，insgram id: ${instagramId}, username: ${username}`);
    } catch (error) {
      // 抓取失败的放到队列尾部，等待下一次临幸
      await this.pushQueue(instagramId, username);
      const message = error.message;
      const hasWait = message.search('Please wait a few minutes before you try again');
      if (hasWait !== -1) {
        app.logger.warn(`[instagram] 抓取账号限制,禁用 10 分钟, account: ${account}, count: ${count}`);
        await this.client.disableClient(account);
      } else {
        app.logger.warn(`[instagram] 未知错误, ${error}`);
      }
    }
  }

  async fetchInfo(client, instagramId) {
    const user = await client.user.info(instagramId);
    if (user.is_private) {
      this.app.logger.warn(`[instagram] username:${user.username} 私人账号跳过`);
      return false;
    }

    let avatar = user.profile_pic_url;
    if (user.hd_profile_pic_versions && user.hd_profile_pic_versions[0]) {
      avatar = user.hd_profile_pic_versions[0].url;
    }
    return {
      username: user.username,
      nickname: user.full_name,
      email: user.public_email,
      phoneNumber: user.public_phone_number,
      description: user.biography,
      avatar,
      followerCount: user.follower_count,
      followingCount: user.following_count,
      postCount: user.media_count,
      category: user.category,
      url: user.external_url,
      origin: user,
      source: 'instagram',
    };
  }
  async fetchFollowings(client, instagramId) {
    // TODO accountFollowing  accountFollowers(粉丝)
    const gen = await client.feed.accountFollowing(instagramId);

    let loop = 10;
    const followings = [];
    let privateCount = 0;
    while (loop) {
      const { users, next_max_id } = await gen.request();

      this.app.logger.info(`[instagram] 抓取关注者成功, instagram id: ${instagramId}, 本次抓取数量: ${users.length}, next_max_id: ${next_max_id}`);
      // 如果数据重复，也 break, 罕见情况，需要告警支持
      const exits = followings.find(item => item.instagramId === users[0].pk);
      if (exits) {
        this.app.logger.warn(`[instagram] 获取关注者异常，next_max_id 不为空，但是抓取的关注者却重复了！ 抓取 id: ${instagramId}`);
        break;
      }

      // 数据处理(包括私有账号处理)
      for (const user of users) {
        if (user.is_private) {
          privateCount++;
          continue;
        }
        followings.push({
          username: user.username,
          instagramId: user.pk,
        });
      }

      if (!next_max_id) {
        this.app.logger.info(`[instagram] next_max_id 为空，停止抓取关注者, instagram id: ${instagramId}, 抓取非私人关注者数量: ${followings.length}, 私人账号数量：${privateCount}`);
        break;
      }

      // sleep 1秒,再抓下一页
      await this.ctx.helper.sleep(1000);
      loop--;
      if (loop === 0) {
        this.app.logger.info(`[instagram] 本次抓取超过 10 次, 停止抓取, instagram id: ${instagramId}, 抓取非私人在行号数量: ${followings.length}, 私人账号数量：${privateCount}`);
      }
    }

    return followings;
  }
  async fetchPosts(client, instagramId) {
    const gen = await client.feed.user(instagramId);
    const originPosts = await gen.items();

    const posts = [];
    for (const item of originPosts) {
      let image = null;
      let hdImage = null;
      // 单图
      if (item.image_versions2) {
        image = item.image_versions2.candidates[1].url;
        hdImage = item.image_versions2.candidates[0].url;
      }
      // 多图
      if (item.carousel_media) {
        hdImage = item.carousel_media[0].image_versions2.candidates[0].url;
        image = item.carousel_media[0].image_versions2.candidates[1].url;
      }

      let country = null;
      let state = null;
      let city = null;
      let longitude = null;
      let latitude = null;
      if (item.location) {
        longitude = item.location.lng;
        latitude = item.location.lat;
        city = item.location.short_name;
        const temp = item.location.name.split(', ');
        state = temp[1] || null;
        if (state) {
          country = this.ctx.service.region.findCountry(state);
        }
      }

      let text = null;
      if (item.caption) {
        text = item.caption.text;
      }

      posts.push({
        image,
        content: text,
        likeCount: item.like_count,
        commentCount: item.comment_count,
        longitude,
        latitude,
        country,
        state,
        city,
        origin: {
          id: item.id,
          pk: item.pk,
          hd_image: hdImage,
        },
        publishedAt: dayjs.unix(item.taken_at).format('YYYY-MM-DD HH:mm:ss'),
      });
    }

    return posts;
  }

  parseRegionBy(posts) {
    // 获取出现次数最多的国家
    const countries = _(posts).map('country').filter()
      .value();
    // 如果国家为空，直接返回空对象
    if (_.isEmpty(countries)) {
      return null;
    }

    let max = 0;
    let mostCountry = null;
    countries.reduce((temp, country) => {
      temp[country] ? temp[country]++ : temp[country] = 1;

      if (temp[country] > max) {
        max = temp[country];
        mostCountry = country;
      }
      return temp;
    }, {});

    const { country, state, city } = posts.find(item => item.country === mostCountry);
    return {
      country,
      state,
      city,
    };
  }

}

module.exports = CrawlService;
