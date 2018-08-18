const { updateFileFromDB } = require("./services/filesService");

async function init() {
  const result = await updateFileFromDB(
    "/Users/jameslo/Dropbox/myproject/koaspace-desktop/app/testwatch1/temp4.txt"
  );

  console.log(result);
}

init();
