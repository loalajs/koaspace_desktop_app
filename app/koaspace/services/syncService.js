const { execPromise, spawnObservable } = require("../utils/helpers");
const { sequelize } = require("../database/setup");
const { scanAllToDB } = require("./filesScanService");
const { findRemoteUpdatedFiles } = require("./filesService");
const { downloadMultipleFromS3 } = require("./s3StorageService");

const {
  S3_SYNC_EXCLUDE,
  S3_PROFILE,
  ROOT_PATH,
  S3_BUCKET_URL,
  IGNORED_PATH,
  ADMIN_USER_ID
} = require("../const");

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
    /** Update to DB first */
    await scanAllToDB(ROOT_PATH, {
      filterDirs: IGNORED_PATH
    });

    /** Upload to S3 */
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

/** syncFromRemote donwload remote updated files to local repository and
 * update the database files remoteUpdated flag back to 0
 * 1. get remoteUpdated files
 * 2. donwload file from S3 with the s3 file path to local dirname of the file path
 * @return Promise<Boolean>
 * @TODO: Add test
 */
async function syncFromRemote() {
  try {
    /** 1. Get remote updated files */
    const files = findRemoteUpdatedFiles(ADMIN_USER_ID);
    if (!files) return Promise.resolve(true);

    /** 3. download the files */
    await downloadMultipleFromS3(files.map(({ fullPath }) => fullPath));
    return Promise.resolve(true);
  } catch (err) {
    throw new Error(`Error occurs in syncFromRemote: ${err.message}`);
  }
}

module.exports = {
  syncToBucketExec,
  intitalFilesSyncExec,
  syncToBucketSpawn,
  intitalFilesSyncSpawn,
  syncFromRemote
};
