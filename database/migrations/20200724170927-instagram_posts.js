'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('instagram_posts', {
      id: {
        type: Sequelize.INTEGER().UNSIGNED,
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
      },
      userId: {
        type: Sequelize.INTEGER().UNSIGNED,
        field: 'user_id',
      },
      image: {
        type: Sequelize.STRING(1000),
      },
      content: {
        type: Sequelize.TEXT,
      },
      likeCount: {
        type: Sequelize.INTEGER().UNSIGNED,
        field: 'like_count',
      },
      commentCount: {
        type: Sequelize.INTEGER().UNSIGNED,
        field: 'comment_count',
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
      longitude: {
        type: Sequelize.INTEGER,
        allowNull: true,
        comment: '经度',
      },
      latitude: {
        type: Sequelize.INTEGER,
        allowNull: true,
        comment: '纬度',
      },

      origin: {
        type: Sequelize.JSON,
        allowNull: true,
        comment: '原始数据',
      },

      // 帖子发布时间
      publishedAt: {
        type: Sequelize.DATE,
        field: 'published_at',
      },

      createdAt: {
        type: Sequelize.DATE,
        field: 'created_at',
      },
      updatedAt: {
        type: Sequelize.DATE,
        field: 'updated_at',
      },
    });
  },
  down: async queryInterface => {
    await queryInterface.dropTable('instagram_posts');
  },
};
