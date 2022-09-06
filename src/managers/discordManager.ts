import { Client } from "@xhayper/discord-rpc";
import { app } from "electron";

import PresenceData from "../../@types/PreMiD/PresenceData";

//* Import custom types

//* Define Presence array
export let rpcClients: Array<RPCClient> = [];

class RPCClient {
	clientId: string;
	currentPresence: PresenceData;
	client: Client;
	clientReady: boolean = false;

	constructor(clientId: string) {
		rpcClients.push(this);

		this.clientId = clientId;
		this.client = new Client({
			clientId
		});

		this.client.once("ready", () => {
			this.clientReady = true;
			this.setActivity();
		});

		this.client.once(
			// @ts-ignore
			"disconnected",
			() =>
				(rpcClients = rpcClients.filter(
					client => client.clientId !== this.clientId
				))
		);

		this.client.login().catch(() => this.destroy());

		console.log(`Create RPC client (${this.clientId})`);
	}

	setActivity(presenceData?: PresenceData) {
		presenceData = presenceData ? presenceData : this.currentPresence;

		if (!this.clientReady || !presenceData) return;

		this.client
			.user?.setActivity(presenceData.presenceData)
			.catch(() => this.destroy());
	}

	clearActivity() {
		this.currentPresence = null;

		if (!this.clientReady) return;

		this.client.user?.clearActivity().catch(() => this.destroy());
	}

	async destroy() {
		try {
			console.log(`Destroy RPC client (${this.clientId})`);
			this.client.user?.clearActivity();
			this.client.destroy();

			rpcClients = rpcClients.filter(
				client => client.clientId !== this.clientId
			);
		} catch (err) {}
	}
}

/**
 * Sets the user's activity
 * @param presence PresenceData to set activity
 */
export function setActivity(presence: PresenceData) {
	let client = rpcClients.find(c => c.clientId === presence.clientId);

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
		let client = rpcClients.find(c => c.clientId === clientId);
		console.log("Clear activity");
		client.clearActivity();
	} else {
		rpcClients.forEach(c => c.clearActivity());
		console.log("Clear all activity");
	}
}

export async function getDiscordUser() {
	const user = new Client({ clientId: "503557087041683458" });
	await user.login();
	return user.user;
}

app.once(
	"will-quit",
	async () => await Promise.all(rpcClients.map(c => c.destroy()))
);
