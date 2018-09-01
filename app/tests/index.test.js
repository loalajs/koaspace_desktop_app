const { Files } = require("../koaspace/models/index");

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
