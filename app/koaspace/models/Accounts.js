const { DataTypes } = require("sequelize");
const { sequelize } = require("../database/setup");
const { Users } = require("./Users");

const Accounts = sequelize.define("Accounts", {
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
  /** Initial Scan and Upload Files to S3
   * 1 means the scan all and upload should take place when application run
   * 0 means the scan all and upload has done at least once
   */
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
});

module.exports = {
  Accounts
};
