import { NoelCommand } from "../Command";
import { Arguments, ArgumentTypes, ArgumentFlags } from "../CommandArguments";
import { CommandContext } from "../CommandContext";
import { Stopwatch } from "@klasa/stopwatch";
import { inspect } from "util";
import { haste } from "../../Util/helpers";
import { MessageEmbed, MessageOptions } from "discord.js";

export class Command extends NoelCommand {
	public name = "eval";
	public description = "Evaluate js code";
	public args: Arguments = [{ key: "script", type: ArgumentTypes.String, flags: ArgumentFlags.Remainder }];
	public aliases = ["debug", "e"];
	public ownerOnly = true;
	public guildOnly = false;
	public nsfw = false;
	public userPermissions = [];
	public clientPermissions = [];

	public async callback(ctx: CommandContext, { script }: { script: string }) {
		// Shortcuts for use in eval command
		// eslint-disable-next-line @typescript-eslint/no-unused-vars
		const { client, channel, msg, rawArgs: args } = ctx;

		script = script.trim();

		// Remove codeblocks
		if (script.startsWith("```") && script.endsWith("```")) {
			script = script.substring(3, script.length - 3);
			if (script.startsWith("js") || script.startsWith("ts")) script = script.substr(2);
		}

		// Create a dummy console for use in eval command
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		const console: any = {
			_lines: [],
			_logger(...things: string[]) {
				this._lines.push(...things.join(" ").split("\n"));
			},
			_formatLines() {
				return this._lines.join("\n");
			}
		};
		console.log = console.error = console.warn = console.info = console._logger.bind(console);

		const stopwatch = new Stopwatch();
		let result, syncTime, asyncTime, promise;

		try {
			result = eval(script);
			syncTime = stopwatch.toString();

			// Is promise?
			if (result && typeof result.then === "function") {
				promise = true;
				stopwatch.restart();
				result = await result;
				asyncTime = stopwatch.toString();
			}
		} catch (err) {
			if (!syncTime) syncTime = stopwatch.toString();
			if (promise && !asyncTime) asyncTime = stopwatch.toString();
			result = err;
		}

		stopwatch.stop();

		const messageOptions: MessageOptions = { disableMentions: "all", files: [] };

		async function formatOutput(rawContent: unknown, limit: number, altFilename: string) {
			if (typeof rawContent !== "string") {
				rawContent = inspect(rawContent);
			}

			let content = rawContent as string;

			if (content.length > limit) {
				try {
					content = await haste(content);
				} catch {
					const attachment = Buffer.from(content, "utf-8");
					messageOptions.files!.push({ name: altFilename, attachment });
					content = "Failed to create haste, so I attached the output as file instead. Consider changing hastebin mirror.";
				}
			} else {
				content = `\`\`\`js\n${content}\n\`\`\``;
			}

			return content;
		}

		result = await formatOutput(result, 2000, "NoelEvalOutput.txt");
		const consoleOutput = await formatOutput(console._formatLines(), 400, "NoelEvalConsole.txt");

		const time = asyncTime ? `⏱ ${asyncTime}<${syncTime}>` : `⏱ ${syncTime}`;

		messageOptions.embed = new MessageEmbed()
			.setAuthor("Noel Eval", client.user.displayAvatarURL())
			.addFields([
				{ name: "Result", value: result },
				{ name: "Console", value: consoleOutput }
			])
			.setFooter(time);

		ctx.reply(void 0, messageOptions);
	}
}
