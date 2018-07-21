aws s3 ls s3://loala-test --profile james_s3_admin
aws s3 sync ~/Dropbox/myproject/koaspace-desktop/app/tests/test2.js s3://loala-test --exclude "*node_modules/*" --exclude "*.git/*" --exclude "env" -- profile james_s3_admin
aws s3 sync ~/Dropbox/myproject/koaspace-desktop s3://loala-test --exclude "*node_modules/*" --exclude "*.git/*" --exclude "env" --delete --profile james_s3_admin
