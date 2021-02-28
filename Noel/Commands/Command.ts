import { CommandContext } from "./CommandContext";
import { CommandArgs, Arguments, ArgumentFlags, ArgumentTypes, parseArgs } from "./CommandArguments";
import { PermissionString } from "discord.js";

export abstract class Command {
	public abstract name: string;
	public abstract description: string;
	public abstract args: Arguments;
	public abstract aliases: string[];
	public abstract ownerOnly: boolean;
	public abstract guildOnly: boolean;
	public abstract nsfw: boolean;
	public abstract userPermissions: PermissionString[];
	public abstract clientPermissions: PermissionString[];

	public abstract callback: (ctx: CommandContext, args: CommandArgs) => Promise<void>;

	public parseArgs(ctx: CommandContext) {
		return parseArgs(this, ctx);
	}

	/**
	 * Formats this commands usage: commandName <required arg> [optional arg]
	 */
	public formatUsage() {
		const args = this.args.map(arg => {
			const explanation = arg.explanation || ArgumentTypes[(arg.type as unknown) as keyof typeof ArgumentTypes];
			return arg.flags && arg.flags & ArgumentFlags.Optional ? `[${explanation}]` : `<${explanation}>`;
		});

		return `${this.name} ${args.join(" ")}`;
	}
}
