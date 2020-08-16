'use strict';

const Controller = require('egg').Controller;

class HomeController extends Controller {
  async index() {
    const { ctx } = this;
    // const crawlService = ctx.service.instagram.crawl;
    // const clientService = ctx.service.instagram.client;
    // const faceService = ctx.service.instagram.face;
    // const webClientService = ctx.service.instagram.webClient;
    // const dingdingService = ctx.service.dingding;
    // dingdingService.send('[instagram] 账号异常，需要解封或者重试修改密码，username: 1101140857@qq.com');
    // const ins = await webClientService.get();
    // 14583605
    // const followings = await crawlService.fetchWebFollowings(ins.client, 24761205);
    // crawlService.run();

    // crawlService.fillQueue();
    // faceService.run();

    ctx.body = 'hello world!';
  }
}

module.exports = HomeController;
