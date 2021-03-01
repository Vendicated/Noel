import { Client, ClientUser, ClientEvents } from "discord.js";
import { CommandManager } from "./Commands/CommandManager";
import { IMessage } from "./Commands/IMessage";

interface NoelEvents extends ClientEvents {
	message: [IMessage];
	messageUpdate: [IMessage, IMessage];
}

export class Noel extends Client {
	// Type ClientUser as not null to avoid a lot of annoyance
	public readonly user!: ClientUser;

	// Add typing for own Events
	public readonly on!: <Event extends keyof NoelEvents>(event: Event, listener: (...args: NoelEvents[Event]) => void) => this;
	public readonly emit!: <Event extends keyof NoelEvents>(event: Event, ...args: NoelEvents[Event]) => boolean;

	public readonly commands = new CommandManager();

	public run() {
		this.login(process.env.DISCORD_TOKEN);
		return this;
	}
}
