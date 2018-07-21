const { execPromise } = require("../utils/helpers");

const { S3_BUCKET, S3_SYNC_EXCLUDE } = require("../const");

/** ls / dir in S3 bucket */
async function listFilesFromBucket() {
  try {
    const command = "aws s3 ls s3://loala-test/app/koaspace/";
    const result = await execPromise(command);
    console.log(`aws s3 ls stdout: ${result}`);
  } catch (err) {
    throw new Error(`Error occurs in aws s3 ls: ${err.message}`);
  }
}

/** rsync to s3 */
async function syncToBucket(pathFrom) {
  try {
    const command = `aws s3 sync ${pathFrom} ${S3_BUCKET} ${S3_SYNC_EXCLUDE}`;
    const result = await execPromise(command);
    console.log(`aws s3 sync stdout: ${result}`);
  } catch (err) {
    throw new Error(`Error occurs in aws s3 sync: ${err.message}`);
  }
}

module.exports = {
  listFilesFromBucket,
  syncToBucket
};
