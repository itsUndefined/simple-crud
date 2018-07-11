'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('Attachments', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      recordId: {
        type: Sequelize.INTEGER,
        references: {
          model: 'TabularWithAttachments',
          key: 'id'
        },
        onDelete: 'CASCADE'
      },
      fileUri: {
        allowNull: false,
        unique: true,
        type: Sequelize.STRING
      },
      type: {
        allowNull: false,
        type: Sequelize.ENUM('attachmentInput1', 'attachmentInput2')
      }
    });
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable('Attachments');
  }
};
