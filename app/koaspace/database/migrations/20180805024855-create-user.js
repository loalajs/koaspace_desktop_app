module.exports = {
  up: (queryInterface, Sequelize) =>
    queryInterface.createTable("Users", {
      id: {
        type: Sequelize.INTEGER(12),
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
      },
      username: {
        type: Sequelize.STRING(25),
        allowNull: false,
        unique: true
      },
      password: {
        type: Sequelize.STRING(255),
        allowNull: true,
        unique: true
      },
      profileId: {
        type: Sequelize.STRING(10),
        allowNull: false,
        unique: true
      },
      email: {
        type: Sequelize.STRING(80),
        unique: true,
        allowNull: true,
        validate: {
          isEmail: true
        }
      },
      displayName: {
        type: Sequelize.STRING(80),
        allowNull: true
      },
      /** Control Users Login Permission */
      profileActive: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false
      },
      /** Control Users Authorization that define functionality available and data visibility  */
      securityGroup: {
        type: Sequelize.STRING(20),
        allowNull: false,
        defaultValue: "Users",
        validate: {
          isIn: [["Users", "Admin"]]
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
  down: (queryInterface, Sequelize) => queryInterface.dropTable("Users")
};
