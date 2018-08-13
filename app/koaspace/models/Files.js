const path = require("path");
const { DataTypes } = require("sequelize");
const { sequelize } = require("../database/setup");
const { Users } = require("./Users");
const { s3BucketFilePathbuilder } = require("../utils/helpers");
const { S3_BUCKET_URL } = require("../const");

/** TODO: Added props
 * filesize: int
 * filectime: Date
 * filemtime: Date
 */
const Files = sequelize.define(
  "Files",
  {
    id: {
      type: DataTypes.INTEGER(12),
      allowNull: false,
      primaryKey: true,
      autoIncrement: true
    },
    filename: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    basedir: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    size: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    fullPath: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    counter: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: "0"
    },
    remoteUpdated: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false
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
  },
  {
    getterMethods: {
      fullS3FilePath: () =>
        s3BucketFilePathbuilder(S3_BUCKET_URL, this.fullPath)
    }
  }
);

module.exports = {
  Files
};
