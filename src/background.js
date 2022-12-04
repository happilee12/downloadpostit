import { app, protocol, BrowserWindow, ipcMain } from "electron";
import { createProtocol } from "vue-cli-plugin-electron-builder/lib";
import installExtension, { VUEJS_DEVTOOLS } from "electron-devtools-installer";
const isDevelopment = process.env.NODE_ENV !== "production";
var path = require("path");
const fs = require("fs");

// Load Data from Local File System
const datapath = app.getPath("userData") + "/data.json"; // /Users/sktelecom/Library/Application Support/postit/data.json

let appData;
try {
  appData = JSON.parse(fs.readFileSync(datapath));
} catch (err) {
  const emptyFileContent = JSON.stringify({
    todo: [],
    deleted: [],
    completed: [],
  });
  fs.writeFileSync(datapath, emptyFileContent, { flag: "wx" });
  appData = JSON.parse(fs.readFileSync(datapath));
}

// Scheme must be registered before the app is ready
protocol.registerSchemesAsPrivileged([
  { scheme: "app", privileges: { secure: true, standard: true } },
]);

async function createWindow() {
  // Create the browser window.
  const win = new BrowserWindow({
    width: 1000,
    height: 1400,
    icon: __dirname + "icon.png",
    webPreferences: {
      // Use pluginOptions.nodeIntegration, leave this alone
      // See nklayman.github.io/vue-cli-plugin-electron-builder/guide/security.html#node-integration for more info
      nodeIntegration: process.env.ELECTRON_NODE_INTEGRATION,
      contextIsolation: !process.env.ELECTRON_NODE_INTEGRATION,
      enableRemoteModule: true,
    },
  });

  win.webContents.on("did-finish-load", (evt) => {
    // onWebcontentsValue 이벤트 송신
    win.webContents.send("todoBoard", appData.todo);
    win.webContents.send("deletedBoard", appData.deleted);
    win.webContents.send("allBoard", appData.completed);
  });

  if (process.env.WEBPACK_DEV_SERVER_URL) {
    // Load the url of the dev server if in development mode
    await win.loadURL(process.env.WEBPACK_DEV_SERVER_URL);
    if (!process.env.IS_TEST) win.webContents.openDevTools();
  } else {
    createProtocol("app");
    // Load the index.html when not in development
    win.loadURL("app://./index.html");
  }

  // set postit data
  ipcMain.on("setTodoBoard", (event) => {
    win.webContents.send("todoBoard", appData.todo);
  });
  ipcMain.on("setAllBoard", (event) => {
    console.log("appData.completed", appData.completed);
    win.webContents.send("allBoard", {
      completed: appData.completed,
      todo: appData.todo,
    });
  });
  ipcMain.on("setDeletedBoard", (event) => {
    win.webContents.send("deletedBoard", appData.deleted);
  });
  // ipcMain.on("setAll", (event) => {
  //   win.webContents.send("all", appData);
  // });

  /** 카테고리 데이터 전체 업데이트 */
  ipcMain.on("saveTodos", (event, todoPostitList) => {
    appData.todo = todoPostitList;
    fs.writeFileSync(datapath, JSON.stringify(appData));
  });
  ipcMain.on("saveCompleted", (event, completedPostitList) => {
    appData.completed = completedPostitList;
    fs.writeFileSync(datapath, JSON.stringify(appData));
  });
  ipcMain.on("saveDeleted", (event, deletedPostitList) => {
    appData.deleted = deletedPostitList;
    fs.writeFileSync(datapath, JSON.stringify(appData));
  });

  /** 카테고리에 데이터 추가 */
  ipcMain.on("addToTodosAndSave", (event, id, memoObject) => {
    appData.todo[id] = memoObject;
    fs.writeFileSync(datapath, JSON.stringify(appData));
  });
  ipcMain.on("addToDeletedAndSave", (event, id, memoObject) => {
    appData.deleted[id] = memoObject;
    fs.writeFileSync(datapath, JSON.stringify(appData));
  });
  ipcMain.on("addToCompletedAndSave", (event, id, memoObject) => {
    appData.completed[id] = memoObject;
    fs.writeFileSync(datapath, JSON.stringify(appData));
  });

  /** 카테고리에 데이터 삭제 */
  ipcMain.on("deleteFromTodos", (event, id) => {
    delete appData.todo[id];
    fs.writeFileSync(datapath, JSON.stringify(appData));
  });
  ipcMain.on("deleteFromCompleted", (event, id) => {
    delete appData.completed[id];
    fs.writeFileSync(datapath, JSON.stringify(appData));
  });
  ipcMain.on("deleteFromDeleted", (event, id) => {
    delete appData.deleted[id];
    fs.writeFileSync(datapath, JSON.stringify(appData));
  });
}

// Quit when all windows are closed.
app.on("window-all-closed", () => {
  // On macOS it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("activate", () => {
  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) createWindow();
});

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on("ready", async () => {
  if (isDevelopment && !process.env.IS_TEST) {
    // Install Vue Devtools
    try {
      await installExtension(VUEJS_DEVTOOLS);
    } catch (e) {
      console.error("Vue Devtools failed to install:", e.toString());
    }
  }
  createWindow();
});

// Exit cleanly on request from parent process in development mode.
if (isDevelopment) {
  if (process.platform === "win32") {
    process.on("message", (data) => {
      if (data === "graceful-exit") {
        app.quit();
      }
    });
  } else {
    process.on("SIGTERM", () => {
      app.quit();
    });
  }
}
