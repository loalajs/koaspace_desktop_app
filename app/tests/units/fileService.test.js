const path = require("path");
const {
  getFileStat,
  getFileStatList,
  updateDBFilesFromLocal,
  findRemoteUpdatedFiles,
  fileBulkDeleteByPathList
} = require("../../koaspace/services/filesService");
const { createTestFile, deleteTestDir } = require("../helpers/index");
const { ADMIN_USER_ID } = require("../../koaspace/const");
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
    const testDirName = "test_filesService_getFileStat";
    const createdFilePath = await createTestFile("test.txt", testDirName);
    const testDir = path.dirname(createdFilePath);
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
    const testDirName = "test_filesService_getFileStatList";
    const tempFilePath1 = await createTestFile("test1.txt", testDirName);
    const tempFilePath2 = await createTestFile("test2.txt", testDirName);
    const testDir = path.dirname(tempFilePath1);
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
    const testDirName = "test_findRemoteUpdatedFiles_updateDBFilesFromLocal";
    const filePath1 = await createTestFile("test1.txt", testDirName);
    const filePath2 = await createTestFile("test2.txt", testDirName);
    const testDir = path.dirname(filePath1);

    const files = await Promise.all(
      [filePath1, filePath2].map(filePath => scanFileToDB(filePath))
    );

    expect(files).toHaveLength(2);

    /** Testing updateDBFilesFromLocal */
    const response = await Promise.all(
      files.map(({ fullPath }) => updateDBFilesFromLocal(fullPath))
    );
    expect(response).toBeTruthy();

    /** Update remoteUpdated */
    await Files.update(
      {
        remoteUpdated: "1"
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
    const remoteUpdatedFiles = await findRemoteUpdatedFiles(ADMIN_USER_ID, {
      filePathList: [filePath1, filePath2]
    });
    remoteUpdatedFiles.forEach(file => {
      expect(file.counter).toBeGreaterThanOrEqual(1);
    });

    /** Clean Up */
    await expect(
      fileBulkDeleteByPathList([filePath1, filePath2])
    ).resolves.toBeTruthy();
    await deleteTestDir(testDir);
  });
});
