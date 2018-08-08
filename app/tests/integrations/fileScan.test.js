const path = require("path");
const { ROOT_PATH, IGNORED_PATH } = require("../../koaspace/const");
const {
  writeFilePromise,
  unlinkPromise,
  recurReaddir,
  ifFileExisted
} = require("../../koaspace/utils/fsPromisify");
const {
  watchFileUnlink,
  watchFileChange,
  watchFileCreation
} = require("../../koaspace/services/filesWatchService");

const { appendTestContents } = require("../helpers/index");

const {
  getFileStat,
  fileBulkDeleteByPathList
} = require("../../koaspace/services/filesService");

const {
  scanAllToDB,
  scanFileToDB
} = require("../../koaspace/services/filesScanService");
const { Files } = require("../../koaspace/models/index");
// const { sequelize } = require("../../koaspace/database/setup");
// const { Op } = require("sequelize");

/** TODO:
 * Create a function helper for creating a temp file and save the file meta data to the db
 * Use test database
 * */
/** Scan file is process that save the file metadata to database before it is sync to s3 */
describe(`[ Files Scan Module ]`, () => {
  /** Initial Scan should scan all of files in the local source dir to database
   * Step 1. Scan all files to DB
   * Step 2. Delete all files from database
   */
  test(`[ Initial Directory Scan - Add all file to database ]`, async () => {
    /** Scan all the db */
    await expect(
      scanAllToDB(ROOT_PATH, {
        filterDirs: IGNORED_PATH
      })
    ).resolves.toBeTruthy();

    /** Clearup test data in DB */
    const filePathList = await recurReaddir(ROOT_PATH, {
      filterDirs: IGNORED_PATH
    });
    await expect(fileBulkDeleteByPathList(filePathList)).resolves.toBeTruthy();
  });
  /** Scan new file to database
   * Step 1: Register the files watcher
   * Step 2: Create a file
   * Step 3: Check if the file has been saved to db
   * Step 4. Delete the file
   * FIXME: watchFileCreation MUST BE MODIFIED TO ABLE TO PASS A PROMISE FILE PATH
   * */
  test(`[ Watch Files Changes - Add one to database ]`, async () => {
    const tempFilePath = path.resolve(process.cwd(), "app", "temp.txt");
    /** Step 1: Resgister the file watcher */
    await watchFileCreation();

    /** Create a file */
    await writeFilePromise(tempFilePath, "hello world");

    /** Step 3: Should return the newly added file
     * @TODO: Before running scanFileToDB, the file should be searched
     * @TODO: Should refactor the watchFileCreation so program can catch newly created path
     * and if not found, then exec scanFileToDB which save the file metadata to DB
     */
    await expect(scanFileToDB(tempFilePath)).resolves.toBeDefined();

    /** Step 4: Delete the temp file */
    await expect(unlinkPromise(tempFilePath).resolves.toBeTruthy());
  });

  /** Update a file from database
   * 1. Create a temp file and save it to the database
   * 2. Step - Register for file watcher
   * 3. Append some contents to a temp file
   * 4. Get the temp file path from the file watcher
   * 5. Update the temp file counter in the database
   * 6. Delete the temp file
   */
  test(`[ Watch Files Changes - Update one file from database ]`, async () => {
    /** FIXME: watchFileChange should be modified to be able to pass a promise file path */
    /** 1.1 Create temp file */
    const tempFilePath = path.resolve(process.cwd(), "app", "temp1.txt");
    await writeFilePromise(tempFilePath, "Hello World");

    /** 1.2 Save temp file to db
     * TODO: Modify the DB Schema
     */
    const tempFileStat = await getFileStat(tempFilePath);

    const fileCurrentCounter = tempFileStat.counter;
    expect(fileCurrentCounter).toBeGreaterThanOrEqual(0);

    await expect(Files.create(tempFileStat)).resolves.toBeTruthy();

    /** 2. FIXME: Files change implementation */
    await watchFileChange();

    /** 3. Append some contents to temp file */
    await expect(
      appendTestContents(tempFilePath, "Newly append contents")
    ).resolves.toBeTruthy();

    /** 4.1 at this moment the file has been updated in database */
    const updatedFilePath = await waitForFileChange();
    expect(updatedFilePath).toBeTruthy();
    expect(updatedFilePath).toBe(tempFilePath);
    await expect(ifFileExisted(updatedFilePath)).resolves.toBeTruthy();

    /** 5. Find the file by updatedFilePath and update its counter */
    const updatedFileCounter = await getOneFile(updatedFilePath);
    expect(updatedFileCounter).toBeGreaterThanOrEqual(1);
    expect(updatedFileCounter - fileCurrentCounter).toBe(1);
  });

  /** Delete a file from database
   * 1. Listen for file unlink event
   * 2. After unlink occurs, get the deleted file path
   * @FIXME: Update waitForFileUnlink function
   */
  test(`[ Watch Files Changes - Delete one file from database ]`, async () => {
    /** Start Listening */
    await watchFileUnlink();

    /** Get the temp file path before unlink */
    const tempFilePath = path.resolve(process.cwd(), "app", "temp1.txt");

    /** Perform actual unlink */
    await expect(unlinkPromise(tempFilePath)).resolves.toBeTruthy();
    const deletedFilePath = await waitForFileUnlink();
    expect(deletedFilePath).toBeTruthy();
    expect(deletedFilePath).toBe(tempFilePath);
    await expect(deleteOneFile(deletedFilePath)).resolves.toBeTruthy();
  });
});
