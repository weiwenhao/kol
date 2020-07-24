'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('users', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
      },

      // 
      username: {
        type: Sequelize.STRING
      },
      nickname: {
        type: Sequelize.STRING
      },
      email: {
        type: Sequelize.STRING
      },
      phone_number: {
        type: Sequelize.STRING
      },
      description: {
        type: Sequelize.STRING(10000)
      },
      avatar: {
        type: Sequelize.STRING
      },
      follower_count: {
        defaultValue: 0,
        type: Sequelize.INTEGER.UNSIGEN
      },
      following_count: {
        defaultValue: 0,
        type: Sequelize.INTEGER.UNSIGEN
      },
      post_count: {
        defaultValue: 0,
        type: Sequelize.INTEGER.UNSIGEN
      },
      url: {
        type: Sequelize.STRING,
        comment: "主页",
      },
      
      // 地区
      country: {
        type: Sequelize.STRING
      },
      province: {
        type: Sequelize.STRING
      },
      city: {
        type: Sequelize.STRING
      },

      // rest
      rest: {
        type: Sequelize.JSONE,
        allowNull: true,
      },

      source: {
        type: Sequelize.STRING // 目前只有 ins
      },


      selected_at: {
        allowNull: true,
        type: Sequelize.DATE
      },
      viewed_at: {
        allowNull: true,
        type: Sequelize.DATE
      },

      created_at: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updated_at: {
        allowNull: false,
        type: Sequelize.DATE
      },
    });
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('users');
  }
};