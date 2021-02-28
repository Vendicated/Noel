import { Client, Message, MessageOptions } from "discord.js";

export class CommandContext {
	public readonly msg: Message;
	public readonly channel: Message["channel"];
	public readonly client: Client;
	/**
	 * The prefix this command was invoked with
	 */
	public readonly prefix: string;
	public readonly commandName: string;
	public readonly rawArgs: string[];

	public constructor(msg: Message, prefix: string, commandName: string, args: string[]) {
		this.msg = msg;
		this.channel = msg.channel;
		this.client = msg.client;
		this.prefix = prefix;
		this.commandName = commandName;
		this.rawArgs = args;
	}

	/**
	 * Create a CommandContext object from a message
	 * @param msg
	 */
	public static parse(msg: Message) {
		const prefixes = ["DUMMY"]; // FIXME replace with db query
		const regex = new RegExp(
			`^(<@!?${msg.client.user!.id}>|${prefixes
				// Sanitise prefixes https://discordjs.guide/popular-topics/faq.html#how-do-i-add-a-mention-prefix-to-my-bot
				.map(p => p.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"))
				.join("|")})\\s*`
		);

		let prefix = regex.exec(msg.content)?.[0];
		if (prefix === undefined && msg.guild) return null;
		else prefix = "";

		const args = msg.content.slice(prefix.length).trim().split(/ +/);

		const commandName = args.shift();
		if (!commandName) return null;

		return new this(msg, prefix, commandName, args);
	}

	private get filter() {
		return (msg: Message) => msg.author.id === this.msg.author.id;
	}

	/**
	 * Helper function to send reply. This will update the old reply if this command was triggered by a message edit
	 * @param content
	 * @param options
	 */
	public async reply(content: string, mention = false, options: MessageOptions) {
		// TODO implement
	}

	/**
	 * Get additional input from the user
	 * @param question The question that will be asked
	 * @param time Prompt timeout in seconds
	 */
	public async awaitMessage(question: string, time = 30) {
		const msg = await this.msg.reply(question);
		try {
			const input = await this.channel.awaitMessages(this.filter, {
				time,
				max: 1,
				errors: ["time"]
			});

			const choice = input.first();
			if (!choice) throw void 0;

			return choice;
		} catch {
			this.msg.reply("The prompt has timed out. Please run the command again");
		} finally {
			if (msg.deletable) void msg.delete().catch(() => void 0);
			msg.delete();
		}
	}
}
