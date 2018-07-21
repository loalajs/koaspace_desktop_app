const { execPromise } = require("../utils/helpers");

const { S3_BUCKET_URL, S3_SYNC_EXCLUDE, S3_PROFILE } = require("../const");

/** rsync to s3
 * FIXME: Need to
 * @param sourcePath: string
 * sourcePath is the directory from source to sync from
 * @param option: Object
 *  @prop shouldDelete: boolean / default to false
 *  delete prop control if sync will delete files from target if files are found in source not target
 *  @prop isInitial: boolean / default to false
 *  If isInitial is set to true, the path to target must be set; otherwise if false, target path is set to bucket root
 */
async function syncToBucket(
  sourcePath,
  option = { shouldDelete: false, isInitial: false }
) {
  const deleteOption = option.shouldDelete ? "--delete" : "";
  try {
    const command = `aws s3 sync ${sourcePath} ${S3_BUCKET_URL} ${S3_SYNC_EXCLUDE} --profile ${S3_PROFILE} ${deleteOption}`;
    const result = await execPromise(command);
    console.log(`aws s3 sync stdout: ${result}`);
  } catch (err) {
    throw new Error(`Error occurs in aws s3 sync: ${err.message}`);
  }
}

module.exports = {
  syncToBucket
};
