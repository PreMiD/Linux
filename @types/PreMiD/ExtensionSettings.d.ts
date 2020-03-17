export default interface ExtensionSettings {
  /**
   * If it's the first run of the app
   */
  firstLaunch: boolean;
  /**
   * If the user approved to use the automatic crash reporter
   */
  improvementProgram: boolean;
  /**
   * If extension is enabled
   */
  enabled: boolean;
  /**
   * Autolaunch enabled
   */
  autoLaunch: boolean;
  /**
   * Media keys enabled
   */
  mediaKeys: boolean;
  /**
   * title menubar (TrayTitle)
   */
  titleMenubar: boolean;
  /**
   * language of extension
   */
  language: string;
}
