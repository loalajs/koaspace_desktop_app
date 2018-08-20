const { findOneAccountByUserId } = require("../services/accountsService");
const { ADMIN_USER_ID, ROOT_PATH, IGNORED_PATH } = require("../const");
const { scanAllToDB } = require("../services/filesScanService");
const { intitalFilesSync } = require("../services/syncService");

/** App run first time
 * 1. Scan all files in local repo
 * 2. Save all files metadata to DB
 * 3. Upload to S3
 */
async function init() {
  try {
    /** Step 1: Check if account's initial flag is true, if it is run the following; If not, return false for now */
    const account = await findOneAccountByUserId(ADMIN_USER_ID);
    if (!account || !account.isInitial) return false;
    /** Step 2: Scan all files to DB  */
    await scanAllToDB(ROOT_PATH, {
      filterDirs: IGNORED_PATH
    });
    /** Step 3: Upload all file to S3 @FIXME: USE OBSERVABLE PATTERN */
    await intitalFilesSync();
    return Promise.resolve(true);
  } catch (err) {
    throw new Error(`Error occurs in controller init: ${err.message}`);
  }
}

module.exports = {
  init
};
