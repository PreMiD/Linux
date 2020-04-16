import { Client } from "discord-rpc";
import { app } from "electron";
import { trayManager } from "..";

//* Import custom types
/* eslint-disable no-unused-vars */
import PresenceData from "../../@types/PreMiD/PresenceData";
/* eslint-enable no-unused-vars */

//* Define Presence array
export let rpcClients: Array<RPCClient> = [];

//* States :
//* - Disconnected
//* - Connected
//* - Connecting
export let connectionState: String = "Connecting";

class RPCClient {
  clientId: string;
  currentPresence: PresenceData;
  client: Client;
  clientReady: boolean = false;

  constructor(clientId: string) {
    rpcClients.push(this);

    this.clientId = clientId;
    this.client = new Client({
      transport: "ipc"
    });

    this.client.once("ready", () => {
      updateTray("Connected");
      this.clientReady = true;
      this.setActivity();
    });

    this.client.once(
      // @ts-ignore
      "disconnected",
      () => {
        updateTray("Disconnected");
        rpcClients = rpcClients.filter(
          (client) => client.clientId !== this.clientId
        );
      }
    );

    this.client.login({ clientId: this.clientId }).catch(() => this.destroy());

    updateTray("Connected");
    console.log(`Create RPC client (${this.clientId})`);
  }

  setActivity(presenceData?: PresenceData) {
    presenceData = presenceData ? presenceData : this.currentPresence;

    if (!this.clientReady || !presenceData) return;

    // Workaround
    if (
      presenceData.presenceData.largeImageText &&
      presenceData.presenceData.largeImageText.includes("PreMiD")
    )
      presenceData.presenceData.largeImageText = `PreMiD 🐧 v${app.getVersion()}`;

    updateTray("Connected");

    this.client
      .setActivity(presenceData.presenceData)
      .catch(() => this.destroy());
  }

  clearActivity() {
    this.currentPresence = null;

    if (!this.clientReady) return;

    this.client.clearActivity().catch(() => this.destroy());
  }

  async destroy() {
    try {
      if (this.clientReady) {
        this.client.clearActivity();
        this.client.destroy();
        console.log(`Destroy RPC client (${this.clientId})`);
      }

      rpcClients = rpcClients.filter(
        (client) => client.clientId !== this.clientId
      );
    } catch (err) {
      console.log(err);
    }
  }
}

/**
 * Sets the user's activity
 * @param presence PresenceData to set activity
 */
export function setActivity(presence: PresenceData) {
  let client = rpcClients.find((c) => c.clientId === presence.clientId);

  if (!client) {
    client = new RPCClient(presence.clientId);
    client.currentPresence = presence;
  } else client.setActivity(presence);
}

/**
 * Clear a user's activity
 * @param clientId clientId of presence to clear
 */
export function clearActivity(clientId: string = undefined) {
  if (clientId) {
    let client = rpcClients.find((c) => c.clientId === clientId);
    console.log("Clear activity");
    client.clearActivity();
  } else {
    rpcClients.forEach((c) => c.clearActivity());
    console.log("Clear all activity");
  }
}

export async function getDiscordUser() {
  updateTray("Connecting");
  return new Promise((resolve, reject) => {
    const c = new Client({ transport: "ipc" });

    c.login({
      clientId: "503557087041683458"
    })
      .then(({ user }) => c.destroy().then(() => resolve(user)))
      .catch(reject);
  });
}

app.once(
  "will-quit",
  async () => await Promise.all(rpcClients.map((c) => c.destroy()))
);

function updateTray(reason: string = "Connecting") {
  if (!connectionState || (connectionState && connectionState !== reason)) {
    connectionState = reason;
    if (trayManager) trayManager.update();
  }
}
