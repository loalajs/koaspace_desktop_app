const { Users } = require("../../models/index");
const { DataTypes } = require("sequelize");

module.exports = {
  up: (queryInterface, Sequelize) =>
    queryInterface.createTable("Accounts", {
      id: {
        type: DataTypes.INTEGER(12),
        allowNull: false,
        primaryKey: true,
        autoIncrement: true
      },
      isActive: {
        type: DataTypes.BOOLEAN,
        allowNull: true,
        defaultValue: "1"
      },
      isInitial: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: "1"
      },
      User_id: {
        type: DataTypes.INTEGER,
        reference: {
          model: Users,
          key: "id"
        }
      },
      createdAt: {
        allowNull: false,
        type: DataTypes.DATE
      },
      updatedAt: {
        allowNull: false,
        type: DataTypes.DATE
      }
    }),
  down: (queryInterface, Sequelize) => queryInterface.dropTable("Accounts")
};
