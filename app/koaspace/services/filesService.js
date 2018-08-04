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

module.exports = {
  getFileStat
};
