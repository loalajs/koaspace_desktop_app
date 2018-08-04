const { User } = require("../../koaspace/models/index");

describe("[ User Model ]", () => {
  /** Testing adding a dummy user */
  test("[ Add Dummy User ]", async () => {
    expect.assertions(1);
    const userParams = {
      username: "james321",
      password: "james321",
      profileId: "KS00000001",
      email: "james@example.com",
      displayName: "James",
      securityGroup: "Admin"
    };
    const newUser = await User.create(userParams);
    expect(newUser.username).toBe("james321");
  });

  test("[ Add Duplicate Dummy User ]", async () => {
    expect.assertions(1);
    const duplicatedUserParam = {
      username: "james321",
      password: "james321",
      profileId: "KS00000001",
      email: "james@example.com",
      displayName: "James",
      securityGroup: "Admin"
    };
    await expect(User.create(duplicatedUserParam)).rejects.toThrow();
  });

  test("[ Add Invalid Dummy User ]", async () => {
    expect.assertions(1);
    const invalidUser = {
      username: "james123",
      password: "james321",
      profileId: "KS00000001",
      email: "invalidemail",
      displayName: "James",
      securityGroup: "Admin"
    };
    await expect(User.create(invalidUser)).rejects.toThrow();
  });

  test("[ Update Dummy User ]", async () => {
    expect.assertions(1);
    const set = {
      displayName: "James Lo",
      profileActive: true
    };
    const [row] = await User.update(set, {
      where: { username: "james321" }
    });
    expect(row).toBeGreaterThan(0);
  });
  test("[ Get Dummy User ]", async () => {
    expect.assertions(1);
    const user = await User.findOne({ where: { username: "james321" } });
    expect(user.username).toBe("james321");
  });
  test("[ Remove Dummy User ]", async () => {
    expect.assertions(1);
    await expect(
      User.destroy({
        where: {
          username: "james321"
        }
      })
    ).resolves.toBeTruthy();
  });
});
