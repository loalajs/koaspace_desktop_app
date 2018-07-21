const path = require("path");

/** CONST PATH / SHELL SCRIPT OPTIONS */
// const ROOT_PATH = process.cwd();
const ROOT_PATH = path.resolve(__dirname, "..", "..");
const S3_BUCKET = "s3://loala-test";
const S3_SYNC_EXCLUDE = `--exclude "*node_modules/*" --exclude "*.git/*" --exclude "env"`;
// const IGNORED_PATH = /node_modules|\.git|env/;
const IGNORED_PATH = ["node_modules", ".git", "env"];
module.exports = {
  ROOT_PATH,
  S3_BUCKET,
  S3_SYNC_EXCLUDE,
  IGNORED_PATH
};
