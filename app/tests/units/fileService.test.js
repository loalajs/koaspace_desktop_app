const path = require("path");
const { getFileStat } = require("../../koaspace/services/filesService");
const { promiseStat } = require("../../koaspace/services/filesService");

describe("[ File Service Unit Tests ]", () => {
  /** Should return the filestat that contains properties
   * @prop filePath: string
   * @prop filename: string
   * @prop filesize: number
   * @prop counter: number
   * @prop filectime: Date
   * @prop filemtime: Date
   */
  test("[ getFileStat ]", async () => {
    const tempFilePath = path(process.cwd(), "app", "test3");
    const expectedResult = {
      filePath: "",
      filename: "",
      filesize: "",
      counter: 0,
      filectime: "",
      filemtime: ""
    };
    const receivedRaw = await promiseStat();
  });
});
