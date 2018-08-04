const { getFileStat } = require("../../koaspace/services/filesService");
// const { promiseStat } = require("../../koaspace/utils/fsPromisify");
const { createTestFile } = require("../helpers/index");

describe("[ File Service Unit Tests ]", () => {
  /** getFileStat Should return the filestat that contains properties
   * @prop filePath: string
   * @prop filename: string
   * @prop filesize: number
   * @prop counter: number
   * @prop filectime: Date
   * @prop filemtime: Date
   *
   * Steps
   * 1. Create temp file
   * 2. use getFileStat to get the expected result
   */
  test("[ getFileStat ]", async () => {
    expect.assertions(7);
    const createdFilePath = await createTestFile("test.txt");
    const received = await getFileStat(createdFilePath);
    expect(received).toBeTruthy();
    expect(received).toHaveProperty("filePath", createdFilePath);
    expect(received).toHaveProperty("filename", "test.txt");
    expect(received).toHaveProperty("filesize");
    expect(received).toHaveProperty("counter", 0);
    expect(received).toHaveProperty("filectime");
    expect(received).toHaveProperty("filemtime");
  });
});
