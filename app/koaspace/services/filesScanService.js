const path = require("path");
const { USER_ADMIN_ID } = require("../const");
const { recurReaddir } = require("../utils/fsPromisify");
const { getFileStatList } = require("./filesService");
const { sequelize } = require("../database/setup");
const { Op } = require("sequelize");
const { Files } = require("../models/index");

/** scanAllToDB should scan all of files in the local source dir to database
 * Step 1. Read files recursively from the current dir using read stream
 * Step 2. Get the file stat for each individual file from Step 1.
 * Step 3. Save all the file metadata to the database in a bulk
 * Step 4. Reject if error is detected from a file during database importing
 * @param rootPath: string
 * @param options: Config object for the readdir
 * @prop options.filterDirs: String[]
 * @return Promise<boolean>
 */
async function scanAllToDB(rootPath, options = {}) {
  const transaction = await sequelize.transaction();
  try {
    /** Step 1 */
    const filePathList = await recurReaddir(rootPath, options);
    /** Step 2 */
    const fileStatList = await getFileStatList(filePathList);

    const filePropsList = fileStatList.map(filestat => ({
      filename: filestat.filename,
      basedir: path.dirname(filestat.filePath),
      counter: filestat.counter,
      remoteUpdated: 0,
      User_id: USER_ADMIN_ID
    }));
    /** Step 3 & 4 */
    await Files.bulkCreate(filePropsList, { transaction });

    /** Verify if data is inserted & Must query again:
     * http://docs.sequelizejs.com/class/lib/model.js~Model.html#static-method-bulkCreate
     */
    const newFiles = await Files.findAll({
      where: {
        fullPath: {
          [Op.in]: fileStatList.map(fileStat => fileStat.filePath)
        }
      },
      transaction
    });

    if (newFiles.length === fileStatList.length) {
      await transaction.commit();
      return Promise.resolve(true);
    }
    throw new Error(
      `Length is not consistent between scanned files and inserted files in DB`
    );
  } catch (err) {
    await transaction.rollback();
    throw new Error(`Error occurs in scanAllToDB : ${err.message}`);
  }
}

module.exports = {
  scanAllToDB
};
