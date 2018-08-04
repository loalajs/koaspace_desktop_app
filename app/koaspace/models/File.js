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
      fullLocalFilePath() {
        const basedir = this.getDataValue("basedir");
        const filename = this.getDataValue("filename");
        return `${basedir}/${filename}}`;
      },
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
