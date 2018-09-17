const {
  findOneAccountByUserId,
  updateAccountByUserId
} = require("../services/accountsService");
const { ADMIN_USER_ID } = require("../const");
const { intitalFilesSyncSpawn } = require("../services/syncService");
const { syncFromRemote } = require("../services/syncService");
const { observeFileChange } = require("../services/filesWatchService");
const { scanFileToDB } = require("../services/filesScanService");
const {
  uploadS3WithStream,
  deleteObjects
} = require("../services/s3StorageService");
const {
  updateDBFilesFromLocal,
  deleteOneFileByPath
} = require("../services/filesService");
const { log } = require("../../../logs/index");
const { ROOT_PATH, S3_BUCKET_NAME, IGNORED_PATH } = require("../const");
const {
  transformPathsFromArrayToRegexp,
  getS3FileKey
} = require("../utils/helpers");

const IGNORED_PATH_REGEXP = transformPathsFromArrayToRegexp(IGNORED_PATH);
/** App run first time
 * 1. Scan all files in local repo
 * 2. Save all files metadata to DB
 * 3. Upload to S3
 */
async function appInit() {
  try {
    log.info({}, "To appInit");
    /** Step 1: Check if account's initial flag is true, if it is run the following; If not, return false for now */
    const account = await findOneAccountByUserId(ADMIN_USER_ID);
    if (!account || account.isInitial === "0") {
      log.info({}, "Has appInit");
      return Promise.resolve(false);
    }
    const hasSync = await intitalFilesSyncSpawn();
    if (hasSync) await updateAccountByUserId(ADMIN_USER_ID, { isInitial: "0" });
    log.info({}, "Has appInit");
    return Promise.resolve(true);
  } catch (err) {
    throw new Error(`Error occurs in controller init: ${err.message}`);
  }
}
// const transaction = await sequelize.transaction();

/** appSync Watch files change , Scan to DB and Upload to S3 */
async function appSync() {
  try {
    /** Sync from remote updated first to get the latest state of synchronization
     * @TODO: can consider simply use aws s3 sync for this operation
     * @TODO: Trigger Lambda from Upload / Delete on the S3 to update the database
     */
    log.trace({ adminUser: ADMIN_USER_ID }, `appSync starts`);
    const hasSyncFrom = await syncFromRemote();
    if (!hasSyncFrom) throw new Error(`syncFromRemote return false`);

    observeFileChange(ROOT_PATH, {
      ignored: IGNORED_PATH_REGEXP,
      ignoreInitial: true
    }).subscribe({
      async next({ event, filePath }) {
        if (event === "ready") {
          log.info(
            { event, filePath },
            `File System Watch has began operation from root dir: ${ROOT_PATH}`
          );
        } else if (event === "add") {
          log.info(
            { event, filePath },
            `File System has detected ${event} event at ${filePath}`
          );
          /** Upload to S3 */
          const hasUpload = await uploadS3WithStream(S3_BUCKET_NAME, filePath);
          /** Scan / Save to DB = */
          if (hasUpload) {
            await scanFileToDB(filePath);
          } else {
            log.error({ filePath, hasUpload }, `File fails to upload`);
          }
        } else if (event === "change") {
          log.info(
            { event, filePath },
            `File System has detected ${event} event at ${filePath}`
          );
          /** Upload to S3 */
          const hasUpload = await uploadS3WithStream(S3_BUCKET_NAME, filePath);
          if (hasUpload) {
            log.info(
              { hasUpload },
              `${filePath} has uploaded to S3. now begin the updateDBFilesFromLocal`
            );
            /** Update db after upload
             * @FIXME: it does not increment
             */
            await updateDBFilesFromLocal(filePath);
          } else {
            log.error({ filePath, hasUpload }, `File fails to upload to S3`);
          }
        } else if (event === "unlink") {
          log.info(
            { event, filePath },
            `File System has detected ${event} event at ${filePath}`
          );
          /** Delete object from S3 and update in DB */
          const s3FileKey = getS3FileKey(filePath);
          const deleteResponse = await deleteObjects(S3_BUCKET_NAME, [
            { Key: s3FileKey }
          ]);
          if (deleteResponse) {
            await deleteOneFileByPath(filePath);
          } else {
            log.error(
              { filePath, deleteResponse },
              `File fails to delete from S3`
            );
          }
        } else {
          throw new Error(`Unrecognise event value: ${event}`);
        }
      },
      error(err) {
        throw new Error(`Error occurs in observeFileCreation: ${err.message} `);
      }
    });
  } catch (err) {
    throw new Error(`Error occurs in controller appSync: ${err.message}`);
  }
}

module.exports = {
  appInit,
  appSync
};
