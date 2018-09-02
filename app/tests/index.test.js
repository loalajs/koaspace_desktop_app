const { Files } = require("../koaspace/models/index");

/** @FIXME: MOVE WATCH FILES TEST TO AFTERALL HANDLER */
describe("[ Index Module ]", () => {
  beforeAll(async () => {
    await Files.destroy({
      where: {},
      truncate: true
    });
  });
  test("[ Index ]", () => {
    expect(true).toBeTruthy();
  });
});
