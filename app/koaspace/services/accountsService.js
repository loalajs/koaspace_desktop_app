const { Accounts } = require("../models/Accounts");
const { log } = require("../../../logs/index");

async function findOneAccountByUserId(userId) {
  try {
    const account = Accounts.findOne({
      where: {
        User_id: userId
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

/** updateAccountByUserId update account by userId with partial of account properties
 * @param userId: String
 * @param partial: Account
 * @return Promise<[number]>
 */
async function updateAccountByUserId(userId, partial) {
  try {
    if (typeof userId !== "string")
      throw new Error(`userId - ${userId} is not a string`);

    log.info({ partial, userId }, "To exec updateAccountByUserId");
    const [number] = await Accounts.update(partial, {
      where: {
        User_id: userId
      }
    });
    log.info({ partial, userId, number }, "Has exec updateAccountByUserId");
    return Promise.resolve(number);
  } catch (err) {
    throw new Error(`Error occurs in updateAccountByUserId: ${err.message}`);
  }
}

module.exports = {
  findOneAccountByUserId,
  updateAccountByUserId
};
