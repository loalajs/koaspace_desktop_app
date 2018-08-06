const { sequelize } = require("../../koaspace/database/setup");
const { Files, Users } = require("../../koaspace/models/index");

describe("DB Moudle", () => {
  /** Testing db connection */
  test("[ DB Setup Connection Test ]", async () => {
    expect.assertions(1);
    await expect(sequelize.authenticate()).resolves.toBeUndefined();
  });

  /** Testing db tables sync */
  test("[ DB Tables Sync Test ]", async () => {
    expect.assertions(2);
    await expect(Users.sync()).resolves.toBeTruthy();
    await expect(Files.sync()).resolves.toBeTruthy();
  });
});
