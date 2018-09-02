const path = require("path");
const { sequelize } = require("../database/setup");
const { promiseStat } = require("../utils/fsPromisify");
const { Op } = require("sequelize");
const { Files } = require("../models/index");
const { ADMIN_USER_ID } = require("../const");

/** getOneFile get the file from db table Files
 * @param filePath: string
 * @return found Files instance from DB or Promise.resovle(false) if not found
 */
async function getOneFileByPath(filePath) {
  try {
    if (typeof filePath !== "string")
      throw new Error(`filePath: ${filePath} is not a string.`);
    const found = await Files.findOne({
      where: {
        fullPath: filePath
      }
    });
    if (!found) {
      return Promise.resolve(false);
    }
    return Promise.resolve(found);
  } catch (err) {
    throw new Error(
      `Error occurs in getOneFileByPath function: ${err.message}`
    );
  }
}

/** getFilesByPathList
 * @param filePathList: String[]
 * @return Files[]
 */
async function getFilesByPathList(filePathList) {
  try {
    if (!Array.isArray(filePathList))
      throw new Error(`filePathList - ${filePathList} is not an array`);
    const found = await Files.findAll({
      where: {
        fullPath: {
          [Op.in]: filePathList
        }
      }
    });
    return Promise.resolve(found);
  } catch (err) {
    throw new Error(`Error occurs in getFilesByPathList: ${err.message}`);
  }
}

/** getFileStat Should return the filestat that contains properties
 * @param filePath: string
 * @return state object
 * @prop filePath: string
 * @prop filename: string
 * @prop filesize: number
 * @prop counter: number
 * @prop filectime: Date
 * @prop filemtime: Date
 */
async function getFileStat(filePath) {
  try {
    if (typeof filePath !== "string")
      throw new Error(`filePath: ${filePath} is not a string.`);
    const found = await getOneFileByPath(filePath);
    let counter = 0;
    let remoteUpdated = "0";
    if (found && found.counter && found.remoteUpdated) {
      counter = found.counter;
      remoteUpdated = found.remoteUpdated;
    }

    const expectedStat = {
      counter,
      fullPath: filePath,
      basedir: path.dirname(filePath),
      filename: path.basename(filePath),
      remoteUpdated,
      User_id: ADMIN_USER_ID
    };
    const { size } = await promiseStat(filePath);
    expectedStat.size = size;
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
    if (!Array.isArray(filePathList))
      throw new Error(`filePathList - ${filePathList} is not an array`);
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
  if (!Array.isArray(filePathList))
    throw new Error(`filePathList - ${filePathList} is not an array`);
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

/** deleteOneFileByPath
 * @param filePath: String
 * @return Promise<Boolean>
 * If file is successfully deleted from db, return true
 * If file delete yield result: 0, it means nothing is deleted from DB
 * then yield error
 */
async function deleteOneFileByPath(filePath) {
  if (typeof filePath !== "string")
    throw new Error(`filePath: ${filePath} is not a string.`);
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

/** updateDBFilesFromLocal update existing file's metadata, mainly the counter to DB
 * @param filePath: String
 * @return Promise<[count, row]>
 * Steps
 * 1. Get the file stat based on the filePath
 * 2. Update the file by finding based on the file path
 * 3. Return the updated File instance data from DB
 *  */
async function updateDBFilesFromLocal(filePath) {
  if (typeof filePath !== "string")
    throw new Error(`filePath: ${filePath} is not a string.`);
  const transaction = await sequelize.transaction();
  try {
    const {
      filename,
      basedir,
      size,
      counter,
      fullPath,
      User_id
    } = await getFileStat(filePath);
    const result = Files.update(
      {
        filename,
        basedir,
        size,
        counter: counter + 1,
        fullPath,
        remoteUpdated: "0",
        User_id
      },
      {
        where: {
          fullPath
        }
      }
    );

    await transaction.commit();
    return result;
  } catch (err) {
    await transaction.rollback();
    throw new Error(`Error occurs in updateDBFilesFromLocal: ${err.message}`);
  }
}

/** findRemoteUpdatedFiles return remote updated files by user
 * @param userId int
 * @param whereOption default to {}
 * @prop filePathList: string[]
 * @return file object []
 * @prop filepath: string
 * @prop fileid: int
 */
async function findRemoteUpdatedFiles(userId, whereOption = {}) {
  try {
    const { filePathList } = whereOption;
    let whereParam;
    if (
      filePathList &&
      Array.isArray(filePathList) &&
      filePathList.length > 0
    ) {
      whereParam = {
        where: {
          User_id: userId,
          remoteUpdated: "1",
          fullPath: {
            [Op.in]: filePathList
          }
        }
      };
    } else {
      whereParam = {
        where: {
          User_id: userId,
          remoteUpdated: "1"
        }
      };
    }

    let files = await Files.findAll(whereParam);

    if (files.length === 0) return Promise.resolve(false);
    files = files.map(({ id, fullPath, counter }) => ({
      id,
      fullPath,
      counter
    }));
    return Promise.resolve(files);
  } catch (err) {
    throw new Error(`error occurs in findRemoteUpdatedFiles: ${err.message}`);
  }
}

/** toggleFilesRemoteUpdatedFlag toggle remoteUpdated flag from the file in DB
 * @param filePath: String.
 * @return Promise<Boolean>
 * Note that it would throw error if the file cannot be found
 * If affected rows is larger than 0, then return Promise true
 * Otherwise return promise false
 */
async function toggleOneFileRemoteUpdatedFlag(filePath) {
  try {
    if (typeof filePath !== "string")
      throw new Error(`filePath: ${filePath} is not a string.`);
    const found = await getOneFileByPath(filePath);
    if (!found) throw new Error(`Files not found.`);
    const flag = found.remoteUpdated === "1" ? "0" : "1";
    const [number] = await Files.update(
      {
        remoteUpdated: flag
      },
      {
        where: {
          id: found.id
        }
      }
    );
    if (number > 0) {
      return Promise.resolve(true);
    }
    return Promise.resolve(false);
  } catch (err) {
    throw new Error(
      `Error occurs in toggleFilesRemoteUpdatedFlag: ${err.message}`
    );
  }
}

/** function toggleFilesRemoteUpdatedFlag toggle multiple files' remoteUpdated falg
 * @param filePathList
 * @return Promise<Boolean>
 */
async function toggleFilesRemoteUpdatedFlag(filePathList) {
  const transaction = await sequelize.transaction();
  try {
    if (!Array.isArray(filePathList))
      throw new Error(`filePathList - ${filePathList} is not an array`);
    const foundFiles = await getFilesByPathList(filePathList);

    /** @NOTE Cannot use update tableName set from tableName (Unless use raw query)
     * so here need to send multiple update request to DB.
     */
    const numbers = await Promise.all(
      foundFiles.map(({ fullPath }) => toggleOneFileRemoteUpdatedFlag(fullPath))
    );
    if (numbers.length === filePathList.length) {
      await transaction.commit();
      return Promise.resolve(true);
    }
    await transaction.rollback();
    return Promise.resolve(false);
  } catch (err) {
    await transaction.rollback();
    throw new Error(
      `Error occurs in toggleFilesRemoteUpdatedFlag: ${err.message}`
    );
  }
}

module.exports = {
  getFileStat,
  getFileStatList,
  fileBulkDeleteByPathList,
  getOneFileByPath,
  deleteOneFileByPath,
  updateDBFilesFromLocal,
  findRemoteUpdatedFiles,
  toggleOneFileRemoteUpdatedFlag,
  toggleFilesRemoteUpdatedFlag,
  getFilesByPathList
};
