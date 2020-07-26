'use strict';

const Controller = require('egg').Controller;

class HomeController extends Controller {
  async index() {
    const { ctx } = this;
    const crawlService = ctx.service.instagram.crawl;
    // const clientService = ctx.service.instagram.client;
    // const ins = await clientService.get();
    // 14583605
    // await crawlService.fetchInfo(ins, 14583605);
    crawlService.run();

    ctx.body = '在抓了，在抓了';
  }
}

module.exports = HomeController;
