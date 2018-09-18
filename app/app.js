import { app, BrowserWindow, ipcMain } from "electron";

const path = require("path");
const { Koaspace } = require("./koaspace/index.js");
const { log } = require("../logs/index");

const mainHtmlFileDirPath = path.resolve(
  process.cwd(),
  "client",
  "dist",
  "renderer"
);
const backgroundHtmlFileDirPath = path.resolve(
  process.cwd(),
  "client",
  "dist",
  "background"
);
const squirrel = require("electron-squirrel-startup");

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (squirrel) {
  // eslint-disable-line global-require
  app.quit();
}

/** Keep a global reference of the window object, if you don't, the window will
 * be closed automatically when the JavaScript object is garbage collected. */
let mainWindow;
let backgroundWindow;

function onClosed() {
  /** dereference the window */
  mainWindow = null;
  backgroundWindow = null;
}

const createMainWindow = () => {
  const win = new BrowserWindow({
    width: 800,
    height: 600
  });
  /** Load html file */
  win.loadURL(`file://${mainHtmlFileDirPath}/index.html`);
  /** Emitted when the window is closed.
   Dereference the window object, usually you would store windows
   in an array if your app supports multi windows, this is the time
   when you should delete the corresponding element */
  win.on("closed", onClosed);
  return win;
};

const createBackgroundWindow = () => {
  const win = new BrowserWindow({
    show: false
  });
  /** Load html file */
  win.loadURL(`file://${backgroundHtmlFileDirPath}/index.html`);
  /** Emitted when the window is closed.
   Dereference the window object, usually you would store windows
   in an array if your app supports multi windows, this is the time
   when you should delete the corresponding element */
  win.on("closed", onClosed);
  return win;
};

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on("ready", () => {
  mainWindow = createMainWindow();
});

// Quit when all windows are closed.
app.on("window-all-closed", () => {
  // On OS X it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("activate", async () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  log.info({}, `App Starts`);
  if (mainWindow === null) {
    mainWindow = createMainWindow();
  }
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and import them here.
ipcMain.on("asynchronous-message", (event, arg) => {
  console.log(arg); // prints "ping"
  event.sender.send("asynchronous-reply", "pong");
});
