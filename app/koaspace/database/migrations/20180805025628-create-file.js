const path = require("path");
const { Users } = require("../../models/index");

module.exports = {
  up: (queryInterface, Sequelize) =>
    queryInterface.createTable("Files", {
      id: {
        type: Sequelize.INTEGER(12),
        allowNull: false,
        primaryKey: true,
        autoIncrement: true
      },
      filename: {
        type: Sequelize.TEXT,
        allowNull: false
      },
      basedir: {
        type: Sequelize.TEXT,
        allowNull: false
      },
      fullPath: {
        type: Sequelize.TEXT,
        allowNull: false,
        get() {
          return path.resolve(
            this.getDataValue("basedir"),
            this.getDataValue("filename")
          );
        }
      },
      size: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      counter: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: "0"
      },
      remoteUpdated: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false
      },
      User_id: {
        type: Sequelize.INTEGER,
        reference: {
          model: Users,
          key: "id"
        }
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    }),
  down: (queryInterface, Sequelize) => queryInterface.dropTable("Files")
};
