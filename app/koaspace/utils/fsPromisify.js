const fs = require("fs");
const path = require("path");

/** Promise version of fs.readdir
 * @param filePath: String
 * @param options: Config object for the readdir
 * @prop options.filterDirs: String[]
 * @return Promise<String[filename]>
 */
function promiseReaddir(filePath, options = {}) {
  return new Promise((resolve, reject) => {
    const filterDirs = options.filterDirs || {};
    fs.readdir(filePath, (err, list) => {
      if (err) reject(err);
      /** Step
       * Goal: Filter the directories found in the array
       * 1. Find if list contains items from the filterDirs array
       * 2. If found , remove them before resolve
       */
      let returnList = list;
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
function recurReaddir(dir, options = {}) {
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

/** Promise version of fs.writeFile */
function writeFilePromise(filename, data) {
  return new Promise((resolve, reject) => {
    fs.writeFile(filename, data, err => {
      if (err) {
        reject(err);
      } else {
        resolve(true);
      }
    });
  });
}

/** Promise version of fs.readFile */
function readFilePromise(filename) {
  return new Promise((resolve, reject) => {
    fs.readFile(filename, (err, data) => {
      if (err) {
        reject(err);
      } else {
        resolve(data);
      }
    });
  });
}

/** Promise version of fs.unlink */
function unlinkPromise(filename) {
  return new Promise((resolve, reject) => {
    fs.unlink(filename, err => {
      if (err) {
        reject(err);
      } else {
        resolve(true);
      }
    });
  });
}

module.exports = {
  recurReaddir,
  writeFilePromise,
  readFilePromise,
  unlinkPromise,
  promiseStat
};
