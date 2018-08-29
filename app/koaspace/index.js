// const { appSyncInit } = require("./controllers/index");
const { getOneFileByPath } = require("./services/filesService");
const path = require("path");
// appSyncInit();

const filePath = path.resolve(process.cwd(), "app", "koaspace", "const.js");
async function init() {
  const file = await getOneFileByPath(filePath);
  console.log(file);
}

init();
