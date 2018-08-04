const path = require("path");
const { promiseStat } = require("../utils/fsPromisify");

/** getFileStat Should return the filestat that contains properties
 * @param filePath: string
 * @return state object
 * @prop filePath: string
 * @prop filename: string
 * @prop filesize: number
 * @prop counter: number
 * @prop filectime: Date
 * @prop filemtime: Date
 *
 * */
async function getFileStat(filePath) {
  try {
    const expectedStat = {
      counter: 0,
      filePath,
      filename: path.basename(filePath)
    };
    const { size, ctime, mtime } = await promiseStat(filePath);
    expectedStat.filesize = size;
    expectedStat.filectime = ctime;
    expectedStat.filemtime = mtime;
    return expectedStat;
  } catch (err) {
    throw new Error(`Error occurs in getFileStat : ${err.message}`);
  }
}

/** getFileStatList should take an array of file paths and
 *  return the array of the filestat
 * @param filePathList: string[]
 * @return fileStatList: Promise[] <string>
 */
function getFileStatList(filePathList) {
  /**
   * 1. Loop through the filePathList and in each iteration
   * 2. call the getFileStat and gather the promise
   * 3. return the stat list after al promise has resolved
   * 4. throw an error if any
   */
  try {
    const statList = filePathList.map(filePath => getFileStat(filePath));
    return Promise.all(statList);
  } catch (err) {
    throw new Error(`Error occurs in getFileStatList : ${err.message}`);
  }
}

module.exports = {
  getFileStat,
  getFileStatList
};
