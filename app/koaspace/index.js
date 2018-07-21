// const chokidar = require("chokidar");
// const { ROOT_PATH } = require("./const");

// const { listFilesFromBucket, syncToBucket } = require("./services/syncService");
const { initialFilesScan } = require("./services/filesService");

// listFilesFromBucket();
// syncToBucket();

/** Testing */
initialFilesScan();

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
