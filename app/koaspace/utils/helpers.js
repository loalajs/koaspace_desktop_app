const exec = require("child_process").exec;

function execPromise(command) {
  return new Promise((resolve, reject) => {
    exec(command, (error, stdout, stderr) => {
      if (error) {
        reject(error);
        return;
      }
      /** Just testing what is output */
      if (stderr) console.log(`stderr: ${stderr.trim()}`);
      resolve(stdout.trim());
    });
  });
}

module.exports = {
  execPromise
};
