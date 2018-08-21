const { execPromise, spawnObservable } = require("../utils/helpers");
const { sequelize } = require("../database/setup");
const { scanAllToDB } = require("./filesScanService");

const {
  S3_SYNC_EXCLUDE,
  S3_PROFILE,
  ROOT_PATH,
  S3_BUCKET_URL,
  IGNORED_PATH
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
  /** Must eliminate empty args */
  const args = command.split(" ").filter(item => {
    if (item) return true;
    return false;
  });
  const firstCommand = args.shift();
  try {
    return spawnObservable(firstCommand, args);
  } catch (err) {
    throw new Error(`Error occurs in syncToBucketSpawn : ${err.message}`);
  }
}

/** When app is initiated, sync all the files up to S3
 * aws s3 sync will manage the files sync (by file size and timestamp)
 */
async function intitalFilesSyncExec() {
  const transaction = await sequelize.transaction();
  try {
    await scanAllToDB(ROOT_PATH, {
      filterDirs: IGNORED_PATH
    });

    await syncToBucketExec(ROOT_PATH, S3_BUCKET_URL, {
      shouldDelete: true,
      isInitial: true
    });
    await transaction.commit();
    return Promise.resolve(true);
  } catch (err) {
    await transaction.rollback();
    throw new Error(`Error occurs in intitalFilesSyncExec - ${err.message}`);
  }
}

/** intitalFilesSyncSpawn - spawn version of the intitalFilesSync
 * 1. Scan all to the db under transaction from the Root Directory
 * 2. Upload files to S3 from the Root Directory
 * 3. If no error, commit the transaction
 * @return Promise<Boolean>
 */
async function intitalFilesSyncSpawn() {
  const transaction = await sequelize.transaction();
  try {
    /** 1. Scan - save files to DB */
    await scanAllToDB(ROOT_PATH, {
      filterDirs: IGNORED_PATH
    });
    /** 2. Upload to S3 */
    const syncToBucketSpawn$ = syncToBucketSpawn(ROOT_PATH, S3_BUCKET_URL, {
      shouldDelete: true,
      isInitial: true
    });
    syncToBucketSpawn$.subscribe({
      next(data) {
        console.log(`syncToBucketSpawn Next: ${data}`);
      },
      error(err) {
        throw new Error(`Error from observable syncToBucketSpwan: ${err}`);
      },
      async complete(data) {
        console.log(`syncToBucketSpawn Complete: ${data}`);
        await transaction.commit();
        return Promise.resolve(true);
      }
    });
  } catch (err) {
    await transaction.rollback();
    throw new Error(`Error occurs in intitalFilesSyncSpawn: ${err.message}`);
  }
}

module.exports = {
  syncToBucketExec,
  intitalFilesSyncExec,
  syncToBucketSpawn,
  intitalFilesSyncSpawn
};
