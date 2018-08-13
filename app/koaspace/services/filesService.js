const path = require("path");
const { sequelize } = require("../database/setup");
const { promiseStat } = require("../utils/fsPromisify");
const { Op } = require("sequelize");
const { Files } = require("../models/index");
const { ADMIN_USER_ID } = require("../const");

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
      fullPath: filePath,
      basedir: path.dirname(filePath),
      filename: path.basename(filePath),
      remoteUpdated: 0,
      User_id: ADMIN_USER_ID
    };
    const { size, ctime, mtime } = await promiseStat(filePath);
    expectedStat.size = size;
    // expectedStat.filectime = ctime;
    // expectedStat.filemtime = mtime;
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
 * @return found Files instance from DB or Promise.resovle(false) if not found
 */
async function getOneFileByPath(filePath) {
  try {
    const found = await Files.findOne({
      where: {
        fullPath: filePath
      }
    });
    if (!found) {
      return Promise(false);
    }
    return Promise.resolve(found);
  } catch (err) {
    throw new Error(
      `Error occurs in getOneFileByPath function: ${err.message}`
    );
  }
}

/** deleteOneFileByPath
 * @param filePath: String
 * @return Promise<Boolean>
 * If file is successfully deleted from db, return true
 * If file delete yield result: 0, it means nothing is deleted from DB
 * then yield error
 */
async function deleteOneFileByPath(filePath) {
  const transaction = await sequelize.transaction();
  try {
    const result = await Files.destroy({
      where: {
        fullPath: filePath
      }
    });
    if (!result) {
      throw new Error(
        `Nothing is deleted from DB for filePath: ${filePath}; The filepath should be unique; The transaction is rollback`
      );
    }

    if (result > 1) {
      throw new Error(
        `More than one row has been deleted at filePath: ${filePath} in DB; The filepath should be unique; The transaction is rollback`
      );
    }
    await transaction.commit();
    return Promise.resolve(true);
  } catch (err) {
    await transaction.rollback();
    throw new Error(`Error occurs in deleteOneFileByPath: ${err.message}`);
  }
}

/** updateFileFromDB update existing file's metadata, mainly the counter to DB
 * @param filePath: String
 * @return Promise<[count, row]>
 * Steps
 * 1. Get the file stat based on the filePath
 * 2. Update the file by finding based on the file path
 * 3. Return the updated File instance data from DB
 *  */
async function updateFileFromDB(filePath) {
  const transaction = await sequelize.transaction();
  try {
    const filestat = await getFileStat(filePath);
    const [count, row] = await Files.update(filestat, {
      where: { filePath }
    });

    if (count > 1 && row > 1) {
      throw new Error(
        `More than one row has been updated from db for filePath: ${filePath}. The transaction is rollback`
      );
    }

    await transaction.commit();
    return [count, row];
  } catch (err) {
    await transaction.rollback();
    throw new Error(`Error occurs in updateFileFrom DB: ${err.message}`);
  }
}

module.exports = {
  getFileStat,
  getFileStatList,
  fileBulkDeleteByPathList,
  getOneFileByPath,
  deleteOneFileByPath,
  updateFileFromDB
};
