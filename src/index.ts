import "source-map-support/register";

import { app, dialog } from "electron";
import { init as initSocket, socket } from "./managers/socketManager";
import { update as initAutoLaunch } from "./managers/launchManager";
import { TrayManager } from "./managers/trayManager";
import { checkForUpdate } from "./util/updateChecker";

export let trayManager: TrayManager;

//* When app is ready
export let updateCheckerInterval = null;
app.whenReady().then(async () => {
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
