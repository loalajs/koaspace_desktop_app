const { execPromise } = require("../utils/helpers");

const { S3_SYNC_EXCLUDE, S3_PROFILE } = require("../const");

/** rsync to s3
 * @param sourceDirPath: string
 * sourceDirPath is the directory from source to sync from
 * @param targetPath: String
 * targetPath is the s3 dir path to sync
 * @param option: Object
 *  @prop shouldDelete: boolean / default to false
 *  delete prop control if sync will delete files from target if files are found in source not target
 *  @prop isInitial: boolean / default to false
 *  If isInitial is set to true, the path to target must be set; otherwise if false, target path is set to bucket root
 */
async function syncToBucket(
  sourceDirPath,
  targetPath,
  option = { shouldDelete: false, isInitial: false }
) {
  const deleteOption = option.shouldDelete ? "--delete" : "";
  try {
    const command = `aws s3 sync ${sourceDirPath} ${targetPath} ${S3_SYNC_EXCLUDE} --profile ${S3_PROFILE} ${deleteOption}`;
    const result = await execPromise(command);
    console.log(`aws s3 sync stdout: ${result}`);
  } catch (err) {
    throw new Error(`Error occurs in aws s3 sync: ${err.message}`);
  }
}

module.exports = {
  syncToBucket
};
