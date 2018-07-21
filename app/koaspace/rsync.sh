aws s3 ls s3://loala-test
aws s3 sync ~/Dropbox/myproject/koaspace-desktop s3://loala-test --exclude "*node_modules/*" --exclude "*.git/*" --exclude "env"s

