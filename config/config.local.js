'use strict';

module.exports = {
  sequelize: {
    dialect: 'mysql',
    host: '123.207.65.111',
    // host: '127.0.0.1',
    port: 3306,
    database: 'kol',
    username: 'root',
    password: 'wwh520yys',
  },
  instagram: {
    accounts: [
      {
        username: 'ay1101140857@gmail.com',
        password: 'wwh520yys',
        proxy: 'http://127.0.0.1:1087',
      },
      {
        username: '1101140857@qq.com',
        password: 'wwh520yys',
        proxy: 'http://127.0.0.1:1087',
      },
    ],
  },
  redis: {
    client: {
      port: 6379, // Redis port
      host: '123.207.65.111', // Redis host
      password: 'wwh520yys',
      db: 0,
      weakDependent: true, // this redis instance won't block app start
    },
  },
};
