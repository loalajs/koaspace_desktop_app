const { Users } = require("../../models/index");

const userParams = {
  username: "james.lo",
  password: "jameslo",
  profileId: "KS00000002",
  email: "james@koaspace.com",
  displayName: "James",
  securityGroup: "Admin"
};
Users.findOrCreate({
  where: {
    username: "james.lo"
  },
  defaults: userParams
});

module.exports = {
  up: (queryInterface, Sequelize) =>
    Users.findOrCreate({
      where: {
        username: "james.lo"
      },
      defaults: userParams
    }),

  down: (queryInterface, Sequelize) =>
    Users.destroy({
      where: {
        username: "james.lo"
      }
    })
};
