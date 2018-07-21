const { ROOT_PATH } = require("./const");

// const { listFilesFromBucket, syncToBucket } = require("./services/syncService");
const {
  initialFilesScan,
  watchFileChange,
  watchFileCreation,
  watchFileUnlink
} = require("./services/filesService");
const { IGNORED_PATH } = require("./const");
// listFilesFromBucket();
// syncToBucket();

/** Testing Scanning Files */
initialFilesScan(ROOT_PATH, { filterDirs: IGNORED_PATH });

/** Testting watch files - unlink, add and change */
watchFileChange();
watchFileCreation();
watchFileUnlink();

/**  this is for Electron app
async function init() {
  console.log(`App Setup`);
  // const fileMetadata = await initialSyncAll();
  // await initialUploadAll(fileMetadata);
}

module.exports = {
  init
};
*/
