import AutoLaunch from "auto-launch";
import { app } from "electron";
import { settings } from "./settingsManager";

//* Create autoLaunch object
let autoLaunch = new AutoLaunch({
  name: app.name,
  isHidden: true
});

/**
 * Updates autoLaunch
 */
export async function update() {
  //* If app not packaged return
  //* Either enable/disable autolaunch
  if (!app.isPackaged || (app.isPackaged && app.name.includes("Portable"))) {
    //* Return
    console.log(
      (app.isPackaged
        ? "Portable version detected,"
        : "Debug version detected,") + " skipping autoLaunch"
    );
    return;
  }
  if (settings.get("autoLaunch", true))
    //* Enable if not enabled
    autoLaunch.enable();
  //* Disable if enabled
  else autoLaunch.disable();
}
