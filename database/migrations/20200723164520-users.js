'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('users', {
      id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
      },
      username: {
        type: Sequelize.STRING,
        unique: 'username_unique',
      },
      nickname: {
        type: Sequelize.STRING,
      },
      email: {
        type: Sequelize.STRING,
      },
      phoneNumber: {
        type: Sequelize.STRING,
        field: 'phone_number',
      },
      description: {
        type: Sequelize.STRING(10000),
      },
      avatar: {
        type: Sequelize.STRING,
      },
      followerCount: {
        defaultValue: 0,
        type: Sequelize.INTEGER().UNSIGNED,
        field: 'follower_count',
      },
      followingCount: {
        defaultValue: 0,
        type: Sequelize.INTEGER().UNSIGNED,
        field: 'following_count',
      },
      postCount: {
        defaultValue: 0,
        type: Sequelize.INTEGER().UNSIGNED,
        field: 'post_count',
      },
      url: {
        type: Sequelize.STRING(1000),
        comment: '主页',
      },
      category: {
        type: Sequelize.STRING,
        comment: '账号分类',
      },

      // 地区
      country: {
        type: Sequelize.STRING,
      },
      state: {
        type: Sequelize.STRING,
      },
      city: {
        type: Sequelize.STRING,
      },

      // 爬虫原始数据
      origin: {
        type: Sequelize.JSON,
      },

      source: {
        type: Sequelize.STRING, // 目前只有 ins
      },


      selectedAt: {
        type: Sequelize.DATE,
        field: 'selected_at',
      },
      viewedAt: {
        type: Sequelize.DATE,
        field: 'viewed_at',
      },

      created_at: {
        type: Sequelize.DATE,
        field: 'created_at',
      },
      updated_at: {
        type: Sequelize.DATE,
        field: 'updated_at',
      },
    });
    await queryInterface.addIndex('users', {
      name: 'username_unique',
      unique: true,
      fields: [ 'username' ],
    });
  },
  down: async queryInterface => {
    await queryInterface.dropTable('users');
  },
};
