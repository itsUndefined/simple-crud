'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('Details', {
      clientId: {
        allowNull: false,
        primaryKey: true,
        type: Sequelize.INTEGER,
        references: { model: 'clients' }
      },
      identification: Sequelize.INTEGER,
      input1: Sequelize.STRING,
      input2: Sequelize.STRING,
      input3: Sequelize.STRING,
      input4: Sequelize.STRING,
      input5: Sequelize.STRING,
      input6: Sequelize.STRING,
      input7: Sequelize.STRING,
      input8: Sequelize.STRING,
      input9: Sequelize.STRING,
      input10: Sequelize.STRING,
      input11: Sequelize.STRING,
      input12: Sequelize.STRING
    });
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable('Details');
  }
};
