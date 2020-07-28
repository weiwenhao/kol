'use strict';

const Controller = require('egg').Controller;

class HomeController extends Controller {
  async index() {
    const { ctx } = this;
    // const crawlService = ctx.service.instagram.crawl;
    // const clientService = ctx.service.instagram.client;
    // const webClientService = ctx.service.instagram.webClient;
    // const ins = await webClientService.get();
    // 14583605
    // const followings = await crawlService.fetchWebFollowings(ins.client, 24761205);
    // crawlService.run();

    // crawlService.fillQueue();

    ctx.body = 'hello world!';
  }
}

module.exports = HomeController;
