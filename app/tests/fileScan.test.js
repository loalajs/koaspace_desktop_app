const path = require("path");
const {
  writeFilePromise,
  unlinkPromise,
  promiseStat
} = require("../koaspace/utils/fsPromisify");
const {
  watchFileUnlink,
  watchFileChange,
  watchFileCreation,
  scanFileToDB
} = require("../koaspace/services/filesService");

/** Scan file is process that save the file metadata to database before it is sync to s3 */
describe(`[ File Scan Module ]`, () => {
  /** Initial Scan should scan all of files in the local source dir to database  */
  test(`[ Initial Directory Scan - Add all file to database ]`, () => {});

  /** Scan new file to database
   * Step 1: Register the files watcher
   * Step 2: Create a file
   * Step 3: Check if the file has been saved to db
   * Step 4. Delete the file
   * */
  test(`[ Watch Files Changes - Add one to database ]`, async () => {
    // expect.assertions(2);
    const tempFilePath = path.resolve(process.cwd(), "app", "temp.txt");
    /** Step 1: Resgister the file watcher */
    await watchFileCreation();

    /** Create a file */
    await writeFilePromise(tempFilePath, "hello world");
    const fileStat = await promiseStat(tempFilePath);
    /** Should return the filestat that contains properties
     * @prop filePath: string
     * @prop filename: string
     * @prop filesize: number
     * @prop filectime: Date
     * @prop filemtime: Date
     */
    expect(fileStat).toHaveProperty("filepath");
    expect(fileStat).toHaveProperty("filename");
    expect(fileStat).toHaveProperty("filesize");
    expect(fileStat).toHaveProperty("filectime");
    expect(fileStat).toHaveProperty("filemtime");
    /** Step 3: Should return the newly added file */
    await expect(scanFileToDB(fileStat)).resolves.toBeDefined();

    /** Step 4: Delete the temp file */
    await expect(unlinkPromise(tempFilePath).resolves.toBeTruthy());
  });

  /** Update a file from database */
  test(`[ Watch Files Changes - Update one file from database ]`, async () => {
    await watchFileChange();
  });

  /** Delete a file from database */
  test(`[ Watch Files Changes - Delete one file from database ]`, async () => {
    await watchFileUnlink();
  });

  /**  */
});
