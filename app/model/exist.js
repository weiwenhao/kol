'use strict';

module.exports = app => {
  const Sequelize = app.Sequelize;
  const Exists = app.model.define('exists', {
    id: {
      type: Sequelize.STRING,
      primaryKey: true,
    },
  }, {
    timestamps: false,
  });

  return Exists;
};
