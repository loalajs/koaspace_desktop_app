const { sequelize, Sequelize } = require("../database/setup");

const User = sequelize.define("User", {
  id: {
    type: Sequelize.INTEGER(12),
    primaryKey: true,
    autoIncrement: true
  },
  username: {
    type: Sequelize.String(25),
    allowNull: false,
    unique: true
  },
  password: {
    type: Sequelize.String(255),
    allowNull: true,
    unique: true
  },
  profileId: {
    type: Sequelize.String(10),
    allowNull: false,
    unique: true
  },
  email: {
    type: Sequelize.String(80),
    unique: true,
    allowNull: true,
    validate: {
      isEmail: true
    }
  },
  displayName: {
    type: Sequelize.String(80),
    allowNull: true
  },
  /** Control User Login Permission */
  profileActive: {
    type: Sequelize.BOOLEAN,
    allowNull: false,
    defaultValue: false
  },
  /** Control User Authorization that define functionality available and data visibility  */
  securityGroup: {
    type: Sequelize.String(20),
    allowNull: false,
    defaultValue: "User",
    validate: {
      isIn: [["User", "Admin"]]
    }
  },
  createdAt: Sequelize.DATE,
  updatedAt: Sequelize.DATE
});

module.exports = {
  User
};
