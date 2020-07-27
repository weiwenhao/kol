'use strict';

const Controller = require('egg').Controller;

class HomeController extends Controller {
  async index() {
    const { ctx } = this;
    const crawlService = ctx.service.instagram.crawl;
    // const clientService = ctx.service.instagram.client;
    // const webClientService = ctx.service.instagram.webClient;
    // const ins = await clientService.get();
    // 14583605
    // await crawlService.fetchFollowings(ins.client, 39011050604);
    // crawlService.run();

    crawlService.fillQueue('tiaa_angeline');

    ctx.body = '在抓了在抓了';
  }
}

module.exports = HomeController;
