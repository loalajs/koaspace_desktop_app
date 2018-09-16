const {
  uploadFileToS3,
  uploadS3,
  uploadS3WithStream
} = require("./services/s3StorageService");
const path = require("path");
const { ROOT_PATH, S3_BUCKET_NAME } = require("./const");
const fs = require("fs");
const { log } = require("../../logs/index");

/**
uploadFileToS3(
  path.resolve(ROOT_PATH, "app", "koaspace", "test.txt"),
  S3_BUCKET_NAME
);
*/
let filePath = path.resolve(ROOT_PATH, "app", "koaspace", "test.js");
filePath = path.relative(ROOT_PATH, filePath);
const rs = fs.createReadStream(filePath);
log.trace({}, `Test Starts`);
rs.pipe(uploadS3WithStream(S3_BUCKET_NAME, filePath));
log.trace({}, `Test Ends`);
