const Path = require('path')
var MenuBar = require('menubar')
const {app, Menu, MenuItem} = require('electron')
var main = require("../main.js")
var constants = require("../constants.js")

constants.menuBar = MenuBar({
  preloadWindow: true,
  icon: "./menuBar/YT-Presence-Icon.png",
  tooltip: "YouTube Presence",
})

constants.menuBar.on('ready', function() {
  constants.menuBar.tray.setTitle(" Connecting...")
  var menu = new Menu();
  menu.append(new MenuItem({
    label: "Show Panel",
    click: function (menuItem, browserWindow, event) {
      constants.win.show()
    }
  }))
  menu.append(new MenuItem({
    type: "separator"
  }))
  menu.append(new MenuItem({
    label: "Check for Updates"
  }))
  menu.append(new MenuItem({
    label: "About"
  }))
  menu.append(new MenuItem({
    type: "separator"
  }))
  menu.append(new MenuItem({
    label: "Quit",
    role: "quit"
  }))
  constants.menuBar.tray.setContextMenu(menu)
})