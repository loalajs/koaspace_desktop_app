aws s3 ls s3://loala-test --profile james_s3_admin
aws s3 sync ~/Dropbox/myproject/koaspace-desktop/app/tests/test2.js s3://loala-test --exclude "*node_modules/*" --exclude "*.git/*" --exclude "*env" --profile james_s3_admin
aws s3 sync ~/Dropbox/myproject/koaspace-desktop s3://loala-test --exclude "*node_modules/*" --exclude "*.git/*" --exclude "*env" --delete --profile james_s3_admin
aws s3 rm s3://loala-test --recursive --profile james_s3_admin
aws s3 ls s3://loala-test --profile james_s3_admin
aws s3api delete-bucket --bucket elasticbeanstalk-us-west-2-923256500007 --region us-east-1 --profile james_s3_admin
