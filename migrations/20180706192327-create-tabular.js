'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('Tabular', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      clientId: {
        type: Sequelize.INTEGER,
        references: {
          model: 'Clients',
          key: 'id'
        },
        onDelete: 'CASCADE'
      },
      date: Sequelize.DATEONLY,
      tabularInput1: Sequelize.STRING,
      tabularInput2: Sequelize.STRING,
      tabularInput3: Sequelize.STRING,
      tabularInput4: Sequelize.STRING,
      tabularInput5: Sequelize.STRING,
      tabularInput6: Sequelize.STRING,
      tabularInput7: Sequelize.STRING,
      tabularInput8: Sequelize.STRING,
      tabularInput9: Sequelize.STRING,
      tabularInput10: Sequelize.STRING,
      tabularInput11: Sequelize.STRING,
    });
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable('Tabular');
  }
};
