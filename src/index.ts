import "source-map-support/register";
import * as Sentry from "@sentry/electron";

import { app, dialog, shell } from "electron";
import { init as initSocket, socket } from "./managers/socketManager";
import { update as initAutoLaunch } from "./managers/launchManager";
import { TrayManager } from "./managers/trayManager";
import { settings } from "./managers/settingsManager";
import { checkForUpdate } from "./util/updateChecker";

export let trayManager: TrayManager;

//* Define and set it to null
//* Set AppUserModelId for task manager etc
//* When app is ready
export let updateCheckerInterval = null;
app.whenReady().then(async () => {
  if (settings.get("firstLaunch")) {
    settings.set("firstLaunch", false);
    dialog
      .showMessageBox({
        message: "Welcome to PreMiD!",
        detail:
          "In order to work, the browser extension is also required, would you like to install it now?",
        buttons: ["I already have it", "Show me"],
        type: "question",
        cancelId: 0,
        defaultId: 0,
        checkboxLabel: "Also enable automatic crash reporting",
        checkboxChecked: true
      })
      .then(async value => {
        if (value.checkboxChecked) await initReporter(true);
        switch (value.response) {
          case 1:
            shell.openExternal("https://premid.app/downloads#ext-downloads");
            break;
        }
      });
  } else {
    await initReporter();
  }

  trayManager = new TrayManager();
  await initAutoLaunch();
  await initSocket();

  if (app.isPackaged && app.name.includes("Portable")) {
    await checkForUpdate(true);
    updateCheckerInterval = setInterval(() => {
      checkForUpdate(true);
    }, 15 * 1000 * 60);
  }
});

async function initReporter(firstLaunch: boolean = false) {
  if (firstLaunch) settings.set("improvementProgramme", true);
  if (settings.get("improvementProgramme")) {
    console.log("Initializing Sentry...");
    Sentry.init({
      dsn: process.env.DSN
    });
  }
}

//* If second instance started, close old one
app.on("second-instance", () => app.exit(0));

//* Send errors from app to extension
process.on("unhandledRejection", rejection => {
  console.error(rejection);
  if (socket && socket.connected) socket.emit("unhandledRejection", rejection);
});

// TODO Find better way to log
process.on("uncaughtException", err => {
  dialog.showErrorBox(err.name, err.stack);
  app.exit(0);
});
