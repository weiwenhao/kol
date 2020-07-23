'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const { INTEGER, DATE, STRING, BOOLEAN } = Sequelize;
    await queryInterface.createTable('users', {
      id: { type: INTEGER, primaryKey: true, autoIncrement: true },
      username: STRING(30),
      avatar: STRING(255),
      email: STRING(255),
      phone_number: STRING(255),
      follower_count: INTEGER.UNSIGNED,
      following_count: INTEGER.UNSIGNED,
      seleted: BOOLEAN,
      viewed_at: DATE,
      created_at: DATE,
      updated_at: DATE,
    });
  },

  down: async queryInterface => {
    await queryInterface.dropTable('users');
  },
};
