const { Users } = require("../../koaspace/models/index");

describe("[ Users Model ]", () => {
  /** Testing adding a dummy user */
  test("[ Add Dummy Users ]", async () => {
    expect.assertions(1);
    const userParams = {
      username: "james321",
      password: "james321",
      profileId: "KS00000001",
      email: "james@example.com",
      displayName: "James",
      securityGroup: "Admin"
    };
    const newUser = await Users.create(userParams);
    expect(newUser.username).toBe("james321");
  });

  test("[ Add Duplicate Dummy Users ]", async () => {
    expect.assertions(1);
    const duplicatedUserParam = {
      username: "james321",
      password: "james321",
      profileId: "KS00000001",
      email: "james@example.com",
      displayName: "James",
      securityGroup: "Admin"
    };
    await expect(Users.create(duplicatedUserParam)).rejects.toThrow();
  });

  test("[ Add Invalid Dummy Users ]", async () => {
    expect.assertions(1);
    const invalidUser = {
      username: "james123",
      password: "james321",
      profileId: "KS00000001",
      email: "invalidemail",
      displayName: "James",
      securityGroup: "Admin"
    };
    await expect(Users.create(invalidUser)).rejects.toThrow();
  });

  test("[ Update Dummy Users ]", async () => {
    expect.assertions(1);
    const set = {
      displayName: "James Lo",
      profileActive: true
    };
    const [row] = await Users.update(set, {
      where: { username: "james321" }
    });
    expect(row).toBeGreaterThan(0);
  });
  test("[ Get Dummy Users ]", async () => {
    expect.assertions(1);
    const user = await Users.findOne({ where: { username: "james321" } });
    expect(user.username).toBe("james321");
  });
  test("[ Remove Dummy Users ]", async () => {
    expect.assertions(1);
    await expect(
      Users.destroy({
        where: {
          username: "james321"
        }
      })
    ).resolves.toBeTruthy();
  });
});
