/** CONST PATH / SHELL SCRIPT OPTIONS */
const ROOT_PATH = process.cwd();
const S3_BUCKET = "s3://loala-test";
const S3_SYNC_EXCLUDE = `--exclude "*node_modules/*" --exclude "*.git/*" --exclude "env"`;

module.exports = {
  ROOT_PATH,
  S3_BUCKET,
  S3_SYNC_EXCLUDE
};
