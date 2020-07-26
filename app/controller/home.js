'use strict';

const Controller = require('egg').Controller;

class HomeController extends Controller {
  async index() {
    const { ctx } = this;
    // const crawlService = ctx.service.instagram.crawl;
    const clientService = ctx.service.instagram.client;
    const ins = await clientService.get();
    // 14583605
    // await crawlService.fetchPosts(ins.client, 46955788);
    // crawlService.run();


    ctx.body = '在抓了在抓了';
  }
}

module.exports = HomeController;
