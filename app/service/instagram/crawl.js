'use strict';

const dayjs = require('dayjs');
const _ = require('lodash');
const Service = require('egg').Service;

class CrawlService extends Service {
  constructor(ctx) {
    super(ctx);
    this.frequency = 1;
    // init client
    this.client = this.ctx.service.instagram.client;
  }
  async run() {
    const { ctx, app } = this;
    const loop = true;
    const awaitSecond = 2;

    while (loop) {
      await ctx.helper.sleep(awaitSecond * 1000);

      // 队列检查
      const item = await ctx.model.InstagramQueue.findOne();
      if (!item) {
        app.logger.warn(`[instagram] instagram queue 为空,等待 ${awaitSecond} 秒后重试`);
        continue;
      }

      // 可用客户端检查
      const select = await this.client.get();
      if (!select) {
        app.logger.warn(`[instagram] 暂无可用客户端,等待 ${awaitSecond} 秒后重试`);
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

  // seeder  24761205 tiaa_angeline
  async crawlUser(instagramId, username, select) {
    const { ctx, app } = this;
    const { client, username: account, count } = select;
    app.logger.info(`[instagram] 客户端选择成功, account: ${account}, 抓取用户次数： ${count}`);
    app.logger.info(`[instagram] 抓取中，insgram id: ${instagramId}, username: ${username}`);

    try {
      let user = await this.fetchInfo(client, instagramId);
      if (!user) {
        return;
      }
      await ctx.helper.sleep(1000);
      const posts = await this.fetchPosts(client, instagramId);
      const followings = [];

      // 如果客户端的 following 被封禁，则跳过, 分开 try catch
      // queue 长度检查， 队列少于 1000 并且粉丝数量少于 10000 才抓取
      // const count = await ctx.model.InstagramQueue.count();
      // if (count < 1000 && user.followerCount < 10000) {
      //   await ctx.helper.sleep(1000);
      //   followings = await this.fetchFollowings(client, instagramId);
      // }

      // 推荐人获取 instagram queue

      // web api 获取 instagram queue
      app.logger.info(`[instagram] 抓取成功，insgram id: ${instagramId}, username: ${username}`);

      // 从 posts 中挑选出地区信息
      user = { ...user, ...this.parseRegionBy(posts) };

      // 数据插入
      const { id: userId } = await ctx.model.User.create(user);
      for (const item of followings) {
        // 存在于待抓取队列
        let exits = await ctx.model.InstagramQueue.count({
          where: { username: item.username },
        });
        if (exits) {
          continue;
        }
        // 存在于已抓取对象
        exits = await ctx.model.User.count({
          where: { username: item.username },
        });
        if (exits) {
          continue;
        }
        ctx.model.InstagramQueue.create(item);
      }

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
        console.log(`[instagram] 未知错误, ${error}`);
      }
    }
  }

  async fetchInfo(client, instagramId) {
    const user = await client.user.info(instagramId);
    if (user.is_private) {
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
    const gen = await client.feed.accountFollowing(instagramId);

    const { users } = await gen.request();
    const followings = [];
    for (const user of users) {
      if (user.is_private) {
        continue;
      }
      followings.push({
        username: user.username,
        instagramId: user.pk,
      });
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
