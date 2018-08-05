const chokidar = require("chokidar");
const path = require("path");
const { ROOT_PATH, IGNORED_PATH, S3_BUCKET_NAME } = require("../const");
const { syncToBucket } = require("./syncService");
const {
  transformPathsFromArrayToRegexp,
  s3BucketFilePathbuilder
} = require("../utils/helpers");
const { deleteObjects } = require("./s3StorageService");
const { S3_BUCKET_URL } = require("../const");
const { recurReaddir } = require("../utils/fsPromisify");

const IGNORED_PATH_REGEXP = transformPathsFromArrayToRegexp(IGNORED_PATH);

/** registerFileWatcher initial the chokidar watcher and return it
 * @param path: String
 * @param option: <chokidar Config Watcher Object f>
 */
function registerFileWatcher(wachtPath, option) {
  /** Files Registeration
   * TODO 1: Change the file path that is targeted for a watch
   */
  const watcher = chokidar.watch(wachtPath, option);
  return watcher;
}

/** First scan when app is initiating
 * Cannot use the watcher.on("all") becasue it is possible to predict
 * when the event is coming to end; Must use nodejs fs module
 * @param targetPath: String
 * The path the scan to begin with
 * @param option: Object. Default to {}
 * @property filterDirs: string[]
 * The path to filter
 */
async function initialFilesScan(targetPath, option = {}) {
  /**  M2 Save files meta data to database */
  console.log(`Initial files scanning begins`);
  try {
    const filesPath = await recurReaddir(targetPath, option);
    filesPath.forEach(filePath => {
      console.log(`${filePath}`);
    });
  } catch (err) {
    throw new Error(`Error occurs at initialFilesScan: ${err.message}`);
  }
}

/** Watch for Files added */
function watchFileCreation() {
  try {
    const watch = registerFileWatcher(ROOT_PATH, {
      ignored: IGNORED_PATH_REGEXP,
      ignoreInitial: true
    });
    watch.on("ready", () => {
      watch.on("add", filePath => {
        console.log(`Files added at ${filePath}`);
        /** M1: synct the file to the s3 by the filePath */
        const sourceFileDir = path.dirname(filePath);
        const targetFileDir = s3BucketFilePathbuilder(
          S3_BUCKET_URL,
          sourceFileDir
        );
        /** TODO: Refactor syncToBucket to another module */
        syncToBucket(sourceFileDir, targetFileDir);
        /**  M2: save it the database
         */
      });
    });
  } catch (err) {
    throw new Error(`Error occurs in watchFileCreation : ${err.message}`);
  }
}

/** Watch for Files changed & updated */
function watchFileChange() {
  try {
    const watch = registerFileWatcher(ROOT_PATH, {
      ignored: IGNORED_PATH_REGEXP,
      ignoreInitial: true
    });

    watch.on("ready", () => {
      watch.on("change", filePath => {
        console.log(`Files changed at ${filePath}`);
        /** M1: Sync the file to S3 */
        const sourceFileDir = path.dirname(filePath);
        const targetFileDir = s3BucketFilePathbuilder(
          S3_BUCKET_URL,
          sourceFileDir
        );
        /** TODO: Refactor syncToBucket to another module */
        syncToBucket(sourceFileDir, targetFileDir);
        /** M2: save to the database */
      });
    });
  } catch (err) {
    throw new Error(`Error occurs at watchFileChange : ${err.message}`);
  }
}

/** Watch for Remove files */
function watchFileUnlink() {
  const watch = registerFileWatcher(ROOT_PATH, {
    ignored: IGNORED_PATH_REGEXP,
    ignoreInitial: true
  });

  watch.on("ready", () => {
    watch.on("unlink", async filePath => {
      /** M1: Sync the file to S3 */
      try {
        /** TODO: Move following action to another module */
        const targetFilePath = s3BucketFilePathbuilder(S3_BUCKET_URL, filePath);
        const output = await deleteObjects(S3_BUCKET_NAME, [
          { Key: targetFilePath }
        ]);
        console.log(`Files is removed at: ${output}`);
        /** M2: save to the database */
      } catch (err) {
        throw new Error(`Error occurs at watchFileUnlink: ${err.message}`);
      }
    });
  });
}

/** Close the watcher when app terminates */
function closeAllFileWatchers(watchers) {
  watchers.forEach(watch => {
    watch.close();
  });
}

module.exports = {
  initialFilesScan,
  registerFileWatcher,
  closeAllFileWatchers,
  watchFileCreation,
  watchFileChange,
  watchFileUnlink
};
