import socketIo from "socket.io";
/* eslint-disable no-unused-vars */
import { createServer, Server } from "http";
/* eslint-enable no-unused-vars */
import { app, dialog } from "electron";
import { update as updateSettings } from "./settingsManager";
import { openFileDialog } from "./presenceDevManager";
import {
  rpcClients,
  setActivity,
  clearActivity,
  getDiscordUser
} from "./discordManager";
import { trayManager } from "..";

export let io: socketIo.Server;
export let socket: socketIo.Socket;
export let server: Server;
export let connected: boolean = false;

export function init() {
  return new Promise((resolve) => {
    //* Create server
    //* create SocketIo server, don't serve the client
    //* Try to listen to port 3020
    //* If that fails/some other error happens run socketError
    //* If someone connects to socket socketConnection
    server = createServer();
    io = socketIo(server, { serveClient: false });
    server.listen(3020, () => {
      //* Resolve promise
      console.log("Opened socket");
      resolve();
    });
    server.on("error", socketError);
    io.on("connection", socketConnection);
  });
}

function socketConnection(cSocket: socketIo.Socket) {
  //* Set exported socket letiable to current socket
  //* Handle setActivity event
  //* Handle clearActivity event
  //* Handle settingsUpdate
  //* Handle presenceDev
  //* Handle version request
  //* Once socket user disconnects run cleanup
  console.log("Socket connection");
  socket = cSocket;
  getDiscordUser()
    .then((user) => socket.emit("discordUser", user))
    .catch(() => socket.emit("discordUser", null));
  socket.on("setActivity", setActivity);
  socket.on("clearActivity", clearActivity);
  socket.on("settingUpdate", updateSettings);
  socket.on("selectLocalPresence", openFileDialog);
  socket.on("getVersion", () =>
    socket.emit("receiveVersion", app.getVersion().replace(/[\D]/g, ""))
  );
  socket.once("disconnect", () => {
    connected = false;
    if(trayManager && trayManager.tray) trayManager.update();
    //* Destroy all open RPC connections
    console.log("Socket disconnected.");
    rpcClients.forEach((c) => c.destroy());
  });
  connected = true;
  if(trayManager && trayManager.tray) trayManager.update();
}

app.on("quit", () => {
  if (socket && socket.connected) server.close();
});

//* Runs on socket errors
async function socketError(e: any) {
  //* If port in use
  if (e.code === "EADDRINUSE") {
    //* Focus app
    //* Show error dialog
    //* Exit app afterwards
    app.focus();
    dialog.showErrorBox(
      "Oh noes! Port error...",
      `${app.name} could not bind to port ${e.port}.\nIs ${app.name} running already?`
    );
    app.exit();
  } else {
    console.log(`Socket error :\n${e.message}`);
  }
}
