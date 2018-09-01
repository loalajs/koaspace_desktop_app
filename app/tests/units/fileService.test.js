const path = require("path");
const {
  getFileStat,
  getFileStatList,
  updateDBFilesFromLocal,
  findRemoteUpdatedFiles,
  fileBulkDeleteByPathList
} = require("../../koaspace/services/filesService");
const { createTestFile, deleteTestDir } = require("../helpers/index");
const { ROOT_PATH, ADMIN_USER_ID } = require("../../koaspace/const");
const { scanFileToDB } = require("../../koaspace/services/filesScanService");
const { Files } = require("../../koaspace/models/index");
const { Op } = require("sequelize");

describe("[ Files Service Unit Tests ]", () => {
  /** *
   * Steps
   * 1. Create temp file
   * 2. use getFileStat to get the expected result
   */
  test("[ getFileStat ]", async () => {
    const testDir = "test_filesService_getFileStat";
    const createdFilePath = await createTestFile("test.txt", testDir);
    const received = await getFileStat(createdFilePath);
    expect(received).toBeTruthy();
    expect(received).toHaveProperty("fullPath", createdFilePath);
    expect(received).toHaveProperty("filename", "test.txt");
    expect(received).toHaveProperty("size");
    expect(received).toHaveProperty("basedir");
    expect(received).toHaveProperty("counter", 0);
    await expect(deleteTestDir(testDir)).resolves.toBeTruthy();
  });

  /** Steps
   * 1. Create two test files with two files path
   * 2. Get file stats from two files
   * 3. Test if received is an array and length is 2
   * 4. Test if object in an array is expected FileStat object
   * */
  test("[ getFileStatList ]", async () => {
    const testDir = "test_filesService_getFileStatList";
    const tempFilePath1 = await createTestFile("test1.txt", testDir);
    const tempFilePath2 = await createTestFile("test2.txt", testDir);
    const fileStatList = await getFileStatList([tempFilePath1, tempFilePath2]);
    expect(fileStatList).toBeTruthy();

    expect(fileStatList).toHaveLength(2);

    fileStatList.forEach(filestat => {
      expect(filestat).toHaveProperty("fullPath");
      expect(filestat).toHaveProperty("filename");
      expect(filestat).toHaveProperty("size");
      expect(filestat).toHaveProperty("counter", 0);
    });
    await expect(deleteTestDir(testDir)).resolves.toBeTruthy();
  });

  /** findRemoteUpdatedFiles return all the files with remoteUpdated flag = 1
   * 1. Update some files' remoteUpdated to 1 in DB
   * 2. Call the  findRemoteUpdatedFiles and verify if getting the array of file paths
   * 3. Restore the file' remoteUpodated back to 0 in DB
   */
  test(" [ findRemoteUpdatedFiles & updateDBFilesFromLocal ] ", async () => {
    /** Target two files and scan to DB  */
    const filePath1 = path.resolve(ROOT_PATH, "client", "src", "index.jsx");
    const filePath2 = path.resolve(ROOT_PATH, "client", "src", "index.scss");

    const files = await Promise.all(
      [filePath1, filePath2].map(filePath => scanFileToDB(filePath))
    );

    expect(files).toHaveLength(2);

    /** Testing updateDBFilesFromLocal */
    const response = await Promise.all(
      files.map(file => updateDBFilesFromLocal(file.fullPath))
    );
    expect(response).toBeTruthy();

    /** Update remoteUpdated */
    await Files.update(
      {
        remoteUpdated: 1
      },
      {
        where: {
          fullPath: {
            [Op.in]: [filePath1, filePath2]
          }
        }
      }
    );

    /** Test findRemoteUpdatedFiles */
    const remoteUpdatedFiles = await findRemoteUpdatedFiles(ADMIN_USER_ID);
    expect(remoteUpdatedFiles).toHaveLength(2);
    remoteUpdatedFiles.forEach(file => {
      expect(file.counter).toBeGreaterThanOrEqual(1);
    });

    /** Clean Up */
    await expect(
      fileBulkDeleteByPathList([filePath1, filePath2])
    ).resolves.toBeTruthy();
  });
});
