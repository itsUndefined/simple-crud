'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return new Promise((resolve, reject) => {
      queryInterface.createTable('Details', {
        clientId: {
          allowNull: false,
          autoIncrement: false,
          primaryKey: true,
          type: Sequelize.INTEGER
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
      }).then(() => {
        queryInterface.addConstraint('Details', ['clientId'], {
          type: 'foreign key',
          references: {
            table: 'Clients',
            field: 'id'
          },
          onDelete: 'CASCADE'
        }).then(() => {
          resolve();
        }).catch((err) => {
          reject(err);
        });
      }).catch((err) => {
        reject(err);
      });
    });
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable('Details');
  }
};
