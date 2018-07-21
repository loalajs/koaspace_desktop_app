const chokidar = require("chokidar");
const fs = require("fs");
const path = require("path");
const { ROOT_PATH } = require("../const");
const { syncToBucket } = require("./syncService");

const IGNORED_PATH = /node_modules|\.git|env/;

/** registerFileWatcher initial the chokidar watcher and return it
 * @param path: String
 * @param option: <chokidar Config Watcher Object f>
 */
function registerFileWatcher(wachtPath, option) {
  /** File Registeration
   * TODO 1: Change the file path that is targeted for a watch
   */
  const watcher = chokidar.watch(wachtPath, option);
  return watcher;
}

/** First scan when app is initiating
 * Cannot use the watcher.on("all") becasue it is possible to predict
 * when the event is coming to end; Must use nodejs fs module
 */
function initialFilesScan() {
  /**  M2 Save files meta data to database */
  console.log(`Initial files scanning begins`);
}

/** When app is initiated,  sync all the files up to S3
 * aws s3 sync will manage the files sync (by file size and timestamp)
 */
function intitalFilesSync() {
  syncToBucket(ROOT_PATH);
}

/** File added */
function watchFileCreation() {
  const watch = registerFileWatcher(ROOT_PATH, {
    ignored: IGNORED_PATH,
    ignoreInitial: true
  });
  watch.on("ready", () => {
    watch.on("add", filePath => {
      console.log(`File added at ${filePath}`);
      /** M1: synct the file to the s3 by the filePath */
      syncToBucket(filePath);
      /**  M2: save it the database
       */
    });
  });
}

/** Files changed & updated */
function watchFileChange() {
  const watch = registerFileWatcher(ROOT_PATH, {
    ignored: IGNORED_PATH,
    ignoreInitial: true
  });

  watch.on("ready", () => {
    watch.on("change", filePath => {
      console.log(`File changed at ${filePath}`);
      /** M1: Sync the file to S3 */
      syncToBucket(filePath);
      /** M2: save to the database */
    });
  });
}

/** Remove files */
function watchFileUnlink() {
  const watch = registerFileWatcher(ROOT_PATH, {
    ignored: IGNORED_PATH,
    ignoreInitial: true
  });

  watch.on("ready", () => {
    watch.on("unlink", filePath => {
      console.log(`File removed at ${filePath}`);
      /** M1: Sync the file to S3 */
      syncToBucket(filePath);
      /** M2: save to the database */
    });
  });
}

function closeAllFileWatchers(watchers) {
  watchers.forEach(watch => {
    watch.close();
  });
}

/** Promise version of fs.readdir
 * @param filePath: String
 * @param options: Config object for the readdir
 * @prop options.filterDirs: String[]
 * @return Promise<String[filename]>
 */
function promiseReaddir(filePath, options = {}) {
  return new Promise((resolve, reject) => {
    const filterDirs = options.filterDirs || {};
    let returnList;
    fs.readdir(filePath, (err, list) => {
      if (err) reject(err);
      /** Step
       * Goal: Filter the directories found in the array
       * 1. Find if list contains items from the filterDirs array
       * 2. If found , remove them before resolve
       */
      if (filterDirs.length > 0) {
        returnList = list.filter(item => filterDirs.indexOf(item) === -1);
      }
      resolve(returnList);
    });
  }).catch(err => {
    throw new Error(`Unexpected error in promiseReaddir: ${err}`);
  });
}

/** Promise version of fs.stat
 * @param filePath:String. The file or dir filePath
 * @returns Promise<String> The stats of the file or dir
 */
function promiseStat(filePath) {
  return new Promise((resolve, reject) => {
    fs.stat(filePath, (err, stats) => {
      if (err) reject(err);
      resolve(stats);
    });
  }).catch(err => {
    throw new Error(`Unexpected error in promiseStat: ${err}`);
  });
}

/** Parallel Loop to read files recursively
 * @param dir string as the target directory
 * @param options: Config object for the readdir
 * @prop options.filterDirs: String[]
 * @return string[] as files path
 */
function recurReaddir(dir, options) {
  return new Promise(async (resolve, reject) => {
    let results = [];
    try {
      const list = await promiseReaddir(dir, options);
      let pending = list.length;
      if (!pending) {
        /** Add empty directory into the results */
        results = results.concat(dir);
        resolve(results);
      }

      list.forEach(async file => {
        const fileFullPath = path.join(dir, file);
        const stats = await promiseStat(fileFullPath);
        if (stats && stats.isDirectory()) {
          const res = await recurReaddir(fileFullPath, options);
          results = results.concat(res);
          pending -= 1;
          if (!pending) resolve(results);
        } else {
          results.push(fileFullPath);
          pending -= 1;
          if (!pending) resolve(results);
        }
      });
    } catch (e) {
      reject(e);
    }
  }).catch(err => {
    throw new Error(`Unexpected error in resurReaddir: ${err}`);
  });
}

module.exports = {
  initialFilesScan,
  registerFileWatcher,
  closeAllFileWatchers,
  watchFileCreation,
  watchFileChange,
  watchFileUnlink,
  intitalFilesSync,
  recurReaddir
};
