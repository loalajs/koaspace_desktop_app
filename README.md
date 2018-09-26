# Koaspace Desktop App
![alt text](https://s3-ap-southeast-1.amazonaws.com/loala-image/koaspace001.png =400x300)
Koaspace Desktop synchronizes files in the personal computer over the cloud like Dropbox using Amazon Web Services' on-demand pricing model.

  - ElectronJS Desktop App that allows building app for multiple platforms from MacOS to Window
  - Webpack 4 as frontend build tool that enables code splitting and lazy loading
  - React and React-Router 4.0 for Single Page Application structuring
  - Heavy use in Promise and Async & Await for asynchronous tasks in NodeJs
  - Sequelize as ORM between application layer and database layer
  - Test Driven Development using Jest
  - AWS S3 Object Storage services and heavy use of NodeJS child processes to run AWS CLI

# In Progress

  - User Management
  - Dynamic synchronizing directory
  - Docker configuration
  - Export cmd Package in MacOS and exe in Window


## Installation in Development

This app requires [Node.js](https://nodejs.org/) v8+ to run for native async & await asynchronous tasks.
Please also make sure the latest version of [NPM](https://www.npmjs.com) v6+ is installed.
You can optionally install the package using [Yarn](https://yarnpkg.com/en/)
Note. This app may not be stable in Window.

Install the NPM dependencies and devDependencies. You need to install your preferred SQL database such as MySql and PostgreSQL. Once you install the database, you need to create a database with the name you specify in the env file. Upon app initialization, Koaspace will hautomatically create tables for you.

```sh
$ npm install or yarn install
$ brew install mysql
```
Edit the env file to configure environment variables at directory mainly for database.
You may find env.example for the reference.
```
/path/to/koaspace-desktop/app/env
```


You also need to manually import seed data to your database. You can reference here
```
/path/to/koaspace-desktop/app/koaspace/database/seeders
```

### Build from Source in Development & Production
Koaspace uses Webpack to build frontend react app. So before you run the app you need to build the frontend first
Open your terminal, navigate to the root of diretory that contains package.json file and execute following commands,
```sh
$ npm run webpack:build
$ npm run start
```
or you may like to constantly build client upon changes
```sh
$ npm run webpack:watch
```

License
----

MIT

