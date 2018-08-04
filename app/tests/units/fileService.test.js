const { getFileStat } = require("../../koaspace/services/filesService");
const { createTestFile, deleteTestFile } = require("../helpers/index");

describe("[ File Service Unit Tests ]", () => {
  /** *
   * Steps
   * 1. Create temp file
   * 2. use getFileStat to get the expected result
   */
  test("[ getFileStat ]", async () => {
    expect.assertions(8);
    const createdFilePath = await createTestFile("test.txt");
    const received = await getFileStat(createdFilePath);
    expect(received).toBeTruthy();
    expect(received).toHaveProperty("filePath", createdFilePath);
    expect(received).toHaveProperty("filename", "test.txt");
    expect(received).toHaveProperty("filesize");
    expect(received).toHaveProperty("counter", 0);
    expect(received).toHaveProperty("filectime");
    expect(received).toHaveProperty("filemtime");
    await expect(deleteTestFile("test.txt")).resolves.toBeTruthy();
  });
});
