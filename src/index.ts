import "source-map-support/register";

import { app, dialog } from "electron";
import { init as initSocket, socket } from "./managers/socketManager";
import { update as initAutoLaunch } from "./managers/launchManager";
import { TrayManager } from "./managers/trayManager";
import { checkForUpdate } from "./util/updateChecker";

let singleInstanceLock: boolean;
//* Attempt locking to a single instance if app is in production
if (app.isPackaged) singleInstanceLock = app.requestSingleInstanceLock();
export let trayManager: TrayManager;

app.on("ready", async () => {
  if (!singleInstanceLock && app.isPackaged) return app.exit();

  trayManager = new TrayManager();

  initAutoLaunch();
  await initSocket();

  if (app.isPackaged && app.name.includes("Portable")) {
    await checkForUpdate(true);
    setInterval(() => {
      checkForUpdate(true);
    }, 15 * 1000 * 60);
  }
});

//* Send errors from app to extension
process.on("unhandledRejection", (rejection) => {
  console.error(rejection);
  if (socket && socket.connected) socket.emit("unhandledRejection", rejection);
});

// TODO Find better way to log
process.on("uncaughtException", (err) => {
  dialog.showErrorBox(err.name, err.stack);
  app.quit();
});
