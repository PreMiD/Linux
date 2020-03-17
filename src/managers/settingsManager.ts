import ElectronStore from "electron-store";
import { update as updateAutoLaunch } from "./launchManager";

//* Import custom types
import ExtensionSettings from "../../@types/PreMiD/ExtensionSettings";

//* Export and set default settings
export let settings = new ElectronStore({
  defaults: {
    firstLaunch: true,
    autoLaunch: true,
    improvementProgram: false
  }
});

/**
 * Update settings of app
 * @param extensionSettings Settings from extension
 */
export function update(extensionSettings: ExtensionSettings) {
  //* Update autolaunch if updated
  //* Save Settings
  if (settings.get("autoLaunch") != extensionSettings.autoLaunch) {
    settings.set("autoLaunch", extensionSettings.autoLaunch);
    updateAutoLaunch();
    console.log("Updated settings");
  }
}
