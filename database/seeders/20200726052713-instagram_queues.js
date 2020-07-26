'use strict';

module.exports = {
  up: async queryInterface => {
    return queryInterface.bulkInsert(
      'instagram_queues',
      [
        {
          instagram_id: 24761205,
          username: 'tiaa_angeline',
          created_at: new Date(),
          updated_at: new Date(),
        },
      ],
      {}
    );
  },

  down: async queryInterface => {
    return queryInterface.bulkDelete('instagram_queues', { username: 'tiaa_angeline' }, {});
  },
};
