'use strict';

module.exports = {
  sequelize: {
    dialect: 'mysql',
    host: 'cdb-cpoe5xpr.gz.tencentcdb.com',
    port: 10062,
    database: 'kol',
    username: 'root',
    password: 'wwh520yys',
  },
  instagram: {
    accounts: [
      {
        username: 'ay1101140857@gmail.com',
        password: 'wwh520yys',
        proxy: 'http://127.0.0.1:1085',
      },
      {
        username: '1101140857@qq.com',
        password: 'wwh520yys',
        proxy: 'http://127.0.0.1:1085',
      },
    ],
  },
  proxy: 'http://127.0.0.1:1085',
  isProxy: false,
  faceApi: {
    appId: '21712013',
    apiKey: 'RfjNGxMG8VR6GoTfCpITraL9',
    secretKey: 'vTjTPATbYtuXRjNOfZqUV5gQBV3AxGn9',
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

  scheduleDisabled: {
    crawlInstagram: false,
    faceInstagram: false,
  },
};
