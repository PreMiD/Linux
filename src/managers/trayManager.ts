import { Menu, Tray, app, shell } from "electron";
import { join } from "path";
import { checkForUpdate, updateProcess } from "../util/updateChecker";
import { connectionState as socketState } from "./socketManager";
import { connectionState as discordState } from "./discordManager";
import { settings } from "./settingsManager";
import { update as updateAutoLaunch } from "./launchManager";

export class TrayManager {
  tray: Tray;

  constructor() {
    this.tray = new Tray(join(__dirname, "../assets/tray/Icon@2x.png"));
    this.tray.setContextMenu(null);
    this.tray.setToolTip(app.name);

    this.update();
    this.tray.on("click", () => this.update());
    this.tray.on("right-click", () => this.update());
  }

  update() {
    this.tray.setContextMenu(
      Menu.buildFromTemplate([
        {
          label: `${app.name} v${app.getVersion()}`,
          enabled: false
        },
        {
          type: "separator"
        },
        {
          label: `Extension - ${socketState ? socketState : "Connecting"}`,
          enabled: false
        },
        {
          label: `Discord - ${discordState ? socketState : "Disconnected"}`,
          enabled: false
        },
        {
          type: "separator"
        },
        {
          label: "Auto launch",
          type: "checkbox",
          click: () => {
            settings.get("autoLaunch")
              ? settings.set("autoLaunch", false)
              : settings.set("autoLaunch", true);
            updateAutoLaunch();
          },
          checked: settings.get("autoLaunch") == true,
          enabled: app.isPackaged,
          visible: !app.name.includes("Portable")
        },
        {
          label: "Check for updates",
          click: () => checkForUpdate(),
          visible:
            app.isPackaged &&
            app.name.includes("Portable") &&
            (!updateProcess || (updateProcess && updateProcess === "standby"))
        },
        {
          label: "Updating...",
          enabled: false,
          visible:
            app.isPackaged &&
            app.name.includes("Portable") &&
            updateProcess &&
            updateProcess === "installing"
        },
        {
          label: "Checking for updates...",
          enabled: false,
          visible:
            app.isPackaged &&
            app.name.includes("Portable") &&
            updateProcess &&
            updateProcess === "checking"
        },
        {
          type: "separator"
        },
        {
          label: "Presence Store",
          click: () => shell.openExternal("https://premid.app/store")
        },
        {
          label: "Acknowledgments",
          click: () => shell.openExternal("https://premid.app/contributors")
        },
        {
          type: "separator"
        },
        {
          label: `Quit`,
          role: "quit"
        }
      ])
    );
  }
}
