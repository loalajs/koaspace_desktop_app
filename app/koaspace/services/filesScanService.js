const { recurReaddir } = require("../utils/fsPromisify");
const { getFileStatList, getFileStat } = require("./filesService");
const { sequelize } = require("../database/setup");
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

    /** Step 3 & 4 */
    await Files.bulkCreate(fileStatList, { transaction });

    await transaction.commit();
    return Promise.resolve(true);
  } catch (err) {
    await transaction.rollback();
    throw new Error(`Error occurs in scanAllToDB : ${err.message}`);
  }
}

/** scanFileToDB scan one file to db
 * @param filePath: Files path that points to the file itself for insert into db
 * @return new Files instance or
 */
async function scanFileToDB(filePath) {
  try {
    /**
     * 1. Get stat from the path
     * 2. Transform the stat to match props for model Files
     * 3. Create and save to DB
     */
    const fileprop = await getFileStat(filePath);
    const createdFile = await Files.create(fileprop);
    if (createdFile) {
      return Promise.resolve(createdFile);
    }
    return Promise.reject("File cannot be created in DB");
  } catch (err) {
    throw new Error(`Error occurs in scanFileToDB: ${err.message}`);
  }
}

module.exports = {
  scanAllToDB,
  scanFileToDB
};
