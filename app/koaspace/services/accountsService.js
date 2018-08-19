const { Accounts } = require("../models/Accounts");

async function findOneAccountByUserId(userId) {
  try {
    const account = Accounts.findOne({
      where: {
        user_id: userId
      }
    });

    if (!account)
      return Promise.reject(
        new Error(`Account by user id: ${userId} cannot be found`)
      );
    return Promise.resolve(account);
  } catch (err) {
    throw new Error(`Error occurs in findOneAccountByUserId: ${err.message}`);
  }
}

module.exports = {
  findOneAccountByUserId
};
