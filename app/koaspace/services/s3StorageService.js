require("dotenv").config();
const AWS = require("aws-sdk");
const { S3_PROFILE, S3_REGION, S3_API_VERSION } = require(".../const");

/** Setup AWS credentials */
const credentials = new AWS.SharedIniFileCredentials({
  profile: S3_PROFILE
});
AWS.config.credentials = credentials;

/** Setup AWS Account Region */
AWS.config.update({
  region: S3_REGION
});

/** Create S3 Service Object */
const s3 = new AWS.S3({
  apiVersion: S3_API_VERSION
});

/** putObject put objects to the AWS s3 service;
 * This is used for string or IO object
 * @param bucketName: String
 * @param fileName: String
 * @param fileBody: String
 */
function putObject(bucketName, fileKey, fileBody) {
  return new Promise((resolve, reject) => {
    s3.putObject(
      { Bucket: bucketName, Key: fileKey, Body: fileBody },
      (err, data) => {
        if (err) {
          reject(err);
        } else {
          resolve(data);
        }
      }
    );
  });
}

/** upload buffer, blob or stream
 * @param bucketName: String
 * @param fileKey: String
 * @param fileBody: Buffer | Stream */
function uploadS3(bucketName, fileKey, fileBody) {
  return new Promise((resolve, reject) => {
    s3.upload(
      { Bucket: bucketName, Key: fileKey, Body: fileBody },
      (err, data) => {
        if (err) {
          reject(err);
        } else {
          resolve(data);
        }
      }
    );
  });
}

/** Delete multiple objects from S3
 * @param bucketName: String
 * @param fileKey: [] { Key: string, VersionId?: string }
 */
function deleteObjects(bucketName, filesKey) {
  return new Promise((resolve, reject) => {
    if (filesKey.length === 0) reject(new Error("The files are not provided"));
    const params = {
      Bucket: bucketName,
      Delete: {
        Objects: filesKey
      }
    };
    s3.deleteObjects(params, (err, data) => {
      if (err) {
        reject(new Error(`Error occurs when delete objects from S3`));
      } else {
        resolve(data);
      }
    });
  });
}

module.exports = {
  putObject,
  uploadS3,
  deleteObjects
};
