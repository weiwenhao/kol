'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('exists', {
      id: {
        type: Sequelize.STRING,
      },
    });

    await queryInterface.addIndex('exists', {
      name: 'id_unique',
      unique: true,
      fields: [ 'id' ],
    });
  },

  down: async queryInterface => {
    await queryInterface.dropTable('exists');
  },
};
