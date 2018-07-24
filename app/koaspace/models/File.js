const { sequelize, Sequelize } = require("../database/setup");
const { User } = require("./User");
const { s3BucketFilePathbuilder } = require("../utils/helpers");
const { S3_BUCKET_URL } = require("../const");

const File = sequelize.define(
  "File",
  {
    id: {
      type: Sequelize.INTEGER(12),
      primaryKey: true,
      autoIncrement: true
    },
    filename: {
      type: Sequelize.String,
      allowNull: false
    },
    basedir: {
      type: Sequelize.String,
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
        model: User,
        key: "id"
      }
    },
    createdAt: Sequelize.DATE,
    updatedAt: Sequelize.DATE
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
