const path = require("path");
const { DataTypes } = require("sequelize");
const { sequelize } = require("../database/setup");
const { User } = require("./User");
const { s3BucketFilePathbuilder } = require("../utils/helpers");
const { S3_BUCKET_URL } = require("../const");

/** TODO: Added props
 * filesize: int
 * filectime: Date
 * filemtime: Date
 */
const File = sequelize.define(
  "File",
  {
    id: {
      type: DataTypes.INTEGER(12),
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
    fullPath: {
      type: DataTypes.TEXT,
      allowNull: false,
      get() {
        return path.resolve(
          this.getDataValue("basedir"),
          this.getDataValue("filename")
        );
      }
    },
    size: {
      type: DataTypes.INTEGER,
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
        model: User,
        key: "id"
      }
    },
    createdAt: DataTypes.DATE,
    updatedAt: DataTypes.DATE
  },
  {
    getterMethods: {
      fullS3FilePath() {
        const fullPath = this.fullLocalFilePath();
        return s3BucketFilePathbuilder(S3_BUCKET_URL, fullPath);
      }
    }
  }
);

module.exports = {
  File
};
