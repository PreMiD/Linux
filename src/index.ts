import "source-map-support/register";
import * as Sentry from "@sentry/electron";

import { app, dialog, shell } from "electron";
import { init as initSocket, socket } from "./managers/socketManager";
import { update as initAutoLaunch } from "./managers/launchManager";
import { TrayManager } from "./managers/trayManager";
import { settings } from "./managers/settingsManager";
import { checkForUpdate } from "./util/updateChecker";

export let trayManager: TrayManager;

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
  if (firstLaunch) settings.set("improvementProgram", true);
  if (settings.get("improvementProgram")) {
    console.log("Initializing Sentry...");
    Sentry.init({
      // definitely not exposed
      dsn: "https://1c767d1b03fd4f548df470a514af80e1@sentry.io/5022280"
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
