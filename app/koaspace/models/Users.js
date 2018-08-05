const { DataTypes } = require("sequelize");
const { sequelize } = require("../database/setup");

const Users = sequelize.define("Users", {
  id: {
    type: DataTypes.INTEGER(12),
    primaryKey: true,
    autoIncrement: true,
    allowNull: false
  },
  username: {
    type: DataTypes.STRING(25),
    allowNull: false,
    unique: true
  },
  password: {
    type: DataTypes.STRING(255),
    allowNull: true,
    unique: true
  },
  profileId: {
    type: DataTypes.STRING(10),
    allowNull: false,
    unique: true
  },
  email: {
    type: DataTypes.STRING(80),
    unique: true,
    allowNull: true,
    validate: {
      isEmail: true
    }
  },
  displayName: {
    type: DataTypes.STRING(80),
    allowNull: true
  },
  /** Control Users Login Permission */
  profileActive: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false
  },
  /** Control Users Authorization that define functionality available and data visibility  */
  securityGroup: {
    type: DataTypes.STRING(20),
    allowNull: false,
    defaultValue: "Users",
    validate: {
      isIn: [["Users", "Admin"]]
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
});

module.exports = {
  Users
};
