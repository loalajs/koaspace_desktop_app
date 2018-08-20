const { execPromise, spawnObservable } = require("../utils/helpers");

const {
  S3_SYNC_EXCLUDE,
  S3_PROFILE,
  ROOT_PATH,
  S3_BUCKET_URL
} = require("../const");

/** rsync to s3 @TODO: Use Observable patterns to handle multiple events
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
async function syncToBucketExec(
  sourceDirPath,
  targetPath,
  option = { shouldDelete: false, isInitial: false }
) {
  const deleteOption = option.shouldDelete ? "--delete" : "";
  try {
    const command = `aws s3 sync ${sourceDirPath} ${targetPath} ${S3_SYNC_EXCLUDE} --profile ${S3_PROFILE} ${deleteOption}`;
    const result = await execPromise(command);
    console.log(`aws s3 sync stdout: ${result}`);
    return result;
  } catch (err) {
    throw new Error(`Error occurs in syncToBucketExec: ${err.message}`);
  }
}
/** rsync to s3 in observable & child_process.spawn version
 * @param sourceDirPath: string
 * sourceDirPath is the directory from source to sync from
 * @param targetPath: String
 * targetPath is the s3 dir path to sync
 * @param option: Object
 *  @prop shouldDelete: boolean / default to false
 *  delete prop control if sync will delete files from target if files are found in source not target
 *  @prop isInitial: boolean / default to false
 *  If isInitial is set to true, the path to target must be set; otherwise if false, target path is set to bucket root
 *  @return Observale
 */
function syncToBucketSpawn(
  sourceDirPath,
  targetPath,
  option = { shouldDelete: false, isInitial: false }
) {
  const deleteOption = option.shouldDelete ? "--delete" : "";
  const command = `aws s3 sync ${sourceDirPath} ${targetPath} ${S3_SYNC_EXCLUDE} --profile ${S3_PROFILE} ${deleteOption}`;
  try {
    return spawnObservable(command);
  } catch (err) {
    throw new Error(`Error occurs in syncToBucketSpawn : ${err.message}`);
  }
}

/** When app is initiated, sync all the files up to S3
 * aws s3 sync will manage the files sync (by file size and timestamp)
 */
async function intitalFilesSync() {
  await syncToBucketExec(ROOT_PATH, S3_BUCKET_URL, {
    shouldDelete: true,
    isInitial: true
  });
  return Promise.resolve(true);
}

module.exports = {
  syncToBucketExec,
  intitalFilesSync,
  syncToBucketSpawn
};
