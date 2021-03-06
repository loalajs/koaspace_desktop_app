const AWS = require("aws-sdk");
const fs = require("fs");
const path = require("path");
const {
  S3_PROFILE,
  S3_REGION,
  S3_API_VERSION,
  ROOT_PATH
} = require("../const");
const { writeFilePromise, mkdirp, checkDir } = require("../utils/fsPromisify");
const { getS3FileKey } = require("../utils/helpers");
const { log } = require("../../../logs/index");
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

/** @TEST: s3upload */
const { PassThrough } = require("stream");

/** putObject put objects to the AWS s3 service;
 * This is used for string or IO object
 * @param bucketName: String
 * @param fileName: String
 * @param fileBody: String
 */
function putObject(bucketName, fileName, fileBody) {
  const fileKey = path.relative(ROOT_PATH, fileName);
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
function uploadS3(bucketName, fileName, fileBody) {
  log.trace({ bucketName, fileName, fileBody }, `has began uploadS3`);
  const fileKey = path.relative(ROOT_PATH, fileName);
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

/** uploadS3WithStream upload file to S3 with Stream
 * @param buckeName: String.
 * @param fileName: String. Absolute file Path
 * @return Promise<Boolean>
 */
function uploadS3WithStream(buckeName, fileName) {
  log.trace({ buckeName, fileName }, `uploadS3WithStream starts`);
  return new Promise((resolve, reject) => {
    const fileKey = getS3FileKey(fileName);
    const rs = fs.createReadStream(fileName);
    const pass = new PassThrough();
    rs.pipe(pass);

    const params = { Bucket: buckeName, Key: fileKey, Body: pass };
    s3.upload(params, (err, data) => {
      if (err) reject(err);
      log.trace({ err, data }, `uploadS3WithStream has uploaded`);
      resolve(true);
    });
  });
}

/** Delete multiple objects from S3
 * @param bucketName: String
 * @param fileKey: Files[] { Key: string, VersionId?: string }
 */
function deleteObjects(bucketName, filesKey) {
  return new Promise((resolve, reject) => {
    if (!Array.isArray(filesKey) || filesKey.length === 0) {
      log.error(
        { filesKey },
        `deleteObjects function's param filesKey is not array or is an empty array`
      );
      reject(
        new Error(
          `The files are not provided or filesKey : ${filesKey} - is not array`
        )
      );
    }
    const params = {
      Bucket: bucketName,
      Delete: {
        Objects: filesKey
      }
    };
    s3.deleteObjects(params, (err, data) => {
      if (err) {
        reject(
          new Error(`Error occurs when delete objects from S3: ${err.message}`)
        );
      } else {
        resolve(data);
      }
    });
  });
}

/** getS3Object calls AWS S3 SDK to get data from S3
 * @param buckeName: String
 * @param fileName : String. It is same as the local file full path
 * @return filedata buffer
 */
function getS3Object(buckeName, fileName) {
  const fileKey = path.relative(ROOT_PATH, fileName);
  const getParam = {
    Bucket: buckeName,
    Key: fileKey
  };
  return new Promise((resolve, reject) => {
    s3.getObject(getParam, (err, data) => {
      if (err) reject(`Error occurs in the s3 getObject: ${err.message}`);
      console.log(data);
      resolve(data);
    });
  });
}

/** downloadOneFromS3 should download one file from S3 and save it to the local
 * @param bucketName : String
 * @param downloadPath : String (Local file path is the key to the S3 object)
 * Use absolute path
 * @return filedata : Buffer
 * Steps
 * 1. Get the data using the getObject function from S3 SDK
 * 2. Write the file buffer to the target file path
 * 2.1 Check if directory existed, if exists , write file
 * 2.2 If dir not existed, create dir and write file
 */
async function downloadOneFromS3(bucketName, downloadPath) {
  try {
    /** 1. get data */
    const filedata = await getS3Object(bucketName, downloadPath);
    if (!filedata)
      throw new Error(`Error occurs: S3 getObject does not return file data`);

    /** 2. check dir */
    if (!(await checkDir("d", downloadPath)))
      await mkdirp(path.dirname(downloadPath));

    /** 3. Write file
     * @TODO: USE STREAM version of write file
     */
    await writeFilePromise(downloadPath, filedata.Body.toString("utf-8"));
    return Promise.resolve(true);
  } catch (err) {
    throw new Error(`Error occurs in downloadOneFromS3: ${err.message}`);
  }
}

/** downloadMultipleFromS3 download multiple files from S3 to a given local directory
 * @param buckeName: String
 * @param filePaths: String[]
 * @return Promise<Boolean>
 */
async function downloadMultipleFromS3(buckeName, filePaths) {
  /** Steps
   * 1. Iiterate filePaths array
   * 2. In each iteration, call the function downloadOneFromS3
   */
  try {
    if (!Array.isArray(filePaths))
      throw new Error(`filePaths - ${filePaths} is not an array.`);
    const results = filePaths.map(filePath =>
      downloadOneFromS3(buckeName, filePath)
    );
    return Promise.all(results);
  } catch (err) {
    throw new Error(
      `Error occurs in the downloadMultipleFromS3 : ${err.message}`
    );
  }
}

module.exports = {
  putObject,
  uploadS3,
  deleteObjects,
  downloadMultipleFromS3,
  downloadOneFromS3,
  uploadS3WithStream
};
