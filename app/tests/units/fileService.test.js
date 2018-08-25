const {
  getFileStat,
  getFileStatList
} = require("../../koaspace/services/filesService");
const { createTestFile, deleteTestFile } = require("../helpers/index");

describe("[ Files Service Unit Tests ]", () => {
  /** *
   * Steps
   * 1. Create temp file
   * 2. use getFileStat to get the expected result
   */
  test("[ getFileStat ]", async () => {
    const createdFilePath = await createTestFile("test.txt");
    const received = await getFileStat(createdFilePath);
    expect(received).toBeTruthy();
    expect(received).toHaveProperty("fullPath", createdFilePath);
    expect(received).toHaveProperty("filename", "test.txt");
    expect(received).toHaveProperty("size");
    expect(received).toHaveProperty("basedir");
    expect(received).toHaveProperty("counter", 0);
    await expect(deleteTestFile("test.txt")).resolves.toBeTruthy();
  });

  /** Steps
   * 1. Create two test files with two files path
   * 2. Get file stats from two files
   * 3. Test if received is an array and length is 2
   * 4. Test if object in an array is expected FileStat object
   * */
  test("[ getFileStatList ]", async () => {
    const tempFilePath1 = await createTestFile("test1.txt");
    const tempFilePath2 = await createTestFile("test2.txt");
    const fileStatList = await getFileStatList([tempFilePath1, tempFilePath2]);
    expect(fileStatList).toBeTruthy();

    expect(fileStatList).toHaveLength(2);

    fileStatList.forEach(filestat => {
      expect(filestat).toHaveProperty("fullPath");
      expect(filestat).toHaveProperty("filename");
      expect(filestat).toHaveProperty("size");
      expect(filestat).toHaveProperty("counter", 0);
      // expect(filestat).toHaveProperty("filectime");
      // expect(filestat).toHaveProperty("filemtime");
    });
    await expect(deleteTestFile("test1.txt")).resolves.toBeTruthy();
    await expect(deleteTestFile("test2.txt")).resolves.toBeTruthy();
  });
});
