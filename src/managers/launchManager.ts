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
  if (!app.isPackaged || (app.isPackaged && process.env.APPIMAGE !== null)) {
    //* Return
    console.log(
      (app.isPackaged
        ? "Portable version detected,"
        : "Debug version detected,") + " skipping autoLaunch"
    );
    return;
  }
  //* Enable if disabled and vice versa
  settings.get("autoLaunch") ? autoLaunch.enable() : autoLaunch.disable();
}
