import React from "react";
import ReactDOM from "react-dom";

// const path = require("path");

// const appPath = path.resolve(process.cwd(), "app", "koaspace", "index.js");
/** @FIXME: INIT the koaspace in this renderer currently does not work
 *  will fix it later
 */
const electron = window.require("electron");
// const Koaspace = window.require(appPath);
// const { log } = window.require("../../logs/index.js");
const ipcRenderer = electron.ipcRenderer;

ipcRenderer.on("initKoaspace", async (event, Koaspace) => {
  console.log(`App Starts with App instance: ${Koaspace}`);
  event.sender.send("onKoaspace", "Hello from Koaspace");
  // const koaspace = Koaspace();
  // await koaspace.init();
  // await koaspace.sync();
});

const Background = () => <p>Background process running </p>;

ReactDOM.render(<Background />, document.getElementById("index")); // eslint-disable-line no-undef
