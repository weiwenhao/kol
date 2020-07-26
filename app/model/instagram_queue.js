'use strict';

module.exports = app => {
  const Sequelize = app.Sequelize;
  const InstagramQueue = app.model.define('instagram_queue', {
    id: {
      type: Sequelize.INTEGER().UNSIGNED,
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
    },
    username: {
      type: Sequelize.STRING,
    },
    instagramId: {
      type: Sequelize.STRING,
      comment: 'ins id',
      field: 'instagram_id',
    },
    createdAt: {
      type: Sequelize.DATE,
      field: 'created_at',
    },
    updatedAt: {
      type: Sequelize.DATE,
      field: 'updated_at',
    },
  }, {
    underscored: false,
  });

  return InstagramQueue;
};
