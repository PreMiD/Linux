import * as Discord from "@xhayper/discord-rpc";

export default interface Presence {
  /**
   * Client ID of presence
   */
  clientId: string;
  /**
   * Rich Procedual call connection
   */
  rpc: Discord.Client;
  /**
   * Connection ready?
   */
  ready: Boolean;
}
