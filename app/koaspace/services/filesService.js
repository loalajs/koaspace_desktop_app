const path = require("path");
const { sequelize } = require("../database/setup");
const { promiseStat } = require("../utils/fsPromisify");
const { Op } = require("sequelize");
const { Files } = require("../models/index");

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
 * @TODO: Sperate logic of finding the file */
async function getFileStat(filePath) {
  try {
    let counter = await Files.findOne({ where: { fullPath: filePath } })
      .counter;
    if (!counter) {
      counter = 0;
    }

    const expectedStat = {
      counter,
      filePath,
      basedir: path.dirname(filePath),
      filename: path.basename(filePath)
    };
    const { size, ctime, mtime } = await promiseStat(filePath);
    expectedStat.filesize = size;
    expectedStat.filectime = ctime;
    expectedStat.filemtime = mtime;
    return Promise.resolve(expectedStat);
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

/** fileBulkDeleteByPathList take array of file path and
 * delete those files record in bulk from database
 * @param filePathList: string[]
 * @param Promise<boolean>
 */
async function fileBulkDeleteByPathList(filePathList) {
  const transaction = await sequelize.transaction();
  try {
    await sequelize.getQueryInterface().bulkDelete("Files", {
      fullPath: {
        [Op.in]: filePathList
      }
    });
    await transaction.commit();
    return Promise.resolve(true);
  } catch (err) {
    await transaction.rollback();
    throw new Error(`Error occurs in fileBulkDeleteByPathList: ${err.message}`);
  }
}

/** getOneFile get the file from db table Files
 * @param filePath: string
 * @return found Files instance from DB or Promise.resovle(false)
 */
async function getOneFileByPath(filePath) {}

/**  */

module.exports = {
  getFileStat,
  getFileStatList,
  fileBulkDeleteByPathList,
  getOneFileByPath
};
