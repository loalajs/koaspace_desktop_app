aws s3 ls s3://loala-test
aws s3 sync ~/Dropbox/myproject/koaspace-desktop/app/tests/test2.js s3://loala-test --exclude "*node_modules/*" --exclude "*.git/*" --exclude "env"
aws s3 sync ~/Dropbox/myproject/koaspace-desktop s3://loala-test --exclude "*node_modules/*" --exclude "*.git/*" --exclude "env" --delete
