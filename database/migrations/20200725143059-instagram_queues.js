'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('instagram_queues', {
      id: {
        type: Sequelize.INTEGER().UNSIGNED,
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
      },
      username: {
        unique: 'username_unique',
        type: Sequelize.STRING,
      },
      instagramId: {
        unique: 'instagram_id_unique',
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
    });

    await queryInterface.addIndex('instagram_queues', {
      name: 'username_unique',
      unique: true,
      fields: [ 'username' ],
    });
  },

  down: async queryInterface => {
    await queryInterface.dropTable('instagram_queues');
  },
};
