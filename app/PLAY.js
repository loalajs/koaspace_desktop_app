const {
  mkdirp,
  writeFilePromise,
  readFilePromise
} = require("./koaspace/utils/fsPromisify");
const { putObject } = require("./koaspace/services/s3StorageService");
const path = require("path");
const { S3_BUCKET_NAME, ROOT_PATH } = require("./koaspace/const");

const filepath = path.resolve(ROOT_PATH, "app", "tests3", "middle", "test.txt");

async function test() {
  await mkdirp(path.dirname(filepath));
  await writeFilePromise(filepath, "Hello");
  const data = await readFilePromise(filepath);
  const s3key = path.relative(ROOT_PATH, filepath);
  console.log(`path for source ${filepath} and s3 key ${s3key}`);
  const res = await putObject(S3_BUCKET_NAME, s3key, data);
  console.log(res);
  console.log(data);
}

test();
