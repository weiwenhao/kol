'use strict';

const ChatBot = require('dingtalk-robot-sender');

const Service = require('egg').Service;

class DingdingService extends Service {
  constructor(ctx) {
    super(ctx);
    this.robot = new ChatBot({
      webhook: 'https://oapi.dingtalk.com/robot/send?access_token=da38294185e33993f542abfa7be0250ad5888e345fe9ba877ccfa589edbf57f6',
    });
  }

  send(content) {
    // 发送钉钉消息
    const textContent = {
      msgtype: 'text',
      text: {
        content,
      },
      at: {
        isAtAll: true,
      },
    };

    this.robot.send(textContent);
  }

}

module.exports = DingdingService;
