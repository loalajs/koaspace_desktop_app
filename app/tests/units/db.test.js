const { sequelize } = require("../../koaspace/database/setup");
const { Files, Users } = require("../../koaspace/models/index");
const { createSeedUser } = require("../../koaspace/database/seed");

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

  /** Find seedUser and if not exist create one in development mode */
  test("[ DB Import Seed Users if not existed ]", async () => {
    expect.assertions(1);
    await createSeedUser();
    const user = await Users.findOne({ where: { username: "james.lo" } });
    expect(user.username).toBe("james.lo");
  });
});
