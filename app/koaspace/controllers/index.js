const { findOneAccountByUserId } = require("../services/accountsService");
const { ADMIN_USER_ID } = require("../const");
const { intitalFilesSyncSpawn } = require("../services/syncService");
const { syncFromRemote } = require("../services/syncService");
/** App run first time
 * 1. Scan all files in local repo
 * 2. Save all files metadata to DB
 * 3. Upload to S3
 */
async function appSyncInit() {
  try {
    /** Step 1: Check if account's initial flag is true, if it is run the following; If not, return false for now */
    const account = await findOneAccountByUserId(ADMIN_USER_ID);
    if (!account || !account.isInitial) return Promise.resolve(false);
    await syncFromRemote();
    await intitalFilesSyncSpawn();
    return Promise.resolve(true);
  } catch (err) {
    throw new Error(`Error occurs in controller init: ${err.message}`);
  }
}

module.exports = {
  appSyncInit
};
