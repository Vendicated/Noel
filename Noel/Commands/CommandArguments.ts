import { Channel, Message, Role, User } from "discord.js";
import validator from "validator";
import { NoelCommand } from "./Command";
import { CommandContext } from "./CommandContext";
import { channelParser, boolParser } from "../Util/parsers";

export async function parseArgs(command: NoelCommand, ctx: CommandContext) {
	const output: CommandArgs = {};

	const requiredArgs = command.args.filter(arg => hasFlag(arg, ArgumentFlags.Optional)).length;
	if (ctx.rawArgs.length < requiredArgs) throw new ArgumentError(`Too little arguments. Expected ${requiredArgs} but only received ${ctx.rawArgs.length}.`);

	for (let i = 0, arg = command.args[i]; i < command.args.length; i++) {
		const add = async (parser: (str: string) => Arg | null | Promise<Arg | null>) => {
			let raw;
			// Remainder
			if (i === command.args.length - 1 && hasFlag(arg, ArgumentFlags.Remainder)) {
				raw = ctx.rawArgs.slice(i).join(" ");
			} else {
				raw = ctx.rawArgs[i];
			}
			try {
				const result = await parser(raw);
				if (result === null || result === undefined) throw void 0;

				output[arg.key] = result;
			} catch (err: unknown) {
				if (err instanceof ArgumentError) throw err;

				throw new ArgumentError(
					`Wrong argument ${raw}. Expected ${arg.explanation || ArgumentTypes[(arg.type as unknown) as keyof typeof ArgumentTypes]}.`
				);
			}
		};
		switch (arg.type) {
			case ArgumentTypes.String:
				add(str => str);
				break;
			case ArgumentTypes.Bool:
				add(boolParser);
				break;
			case ArgumentTypes.Int:
				add(validator.toInt);
				break;
			case ArgumentTypes.Float:
				add(validator.toFloat);
				break;
			case ArgumentTypes.Url:
				add(str => (validator.isURL(str) ? str : null));
				break;
			case ArgumentTypes.Channel:
				add((str: string) => channelParser(ctx.client, str));
				break;
			case ArgumentTypes.Message:
				add((str: string) => channelParser(ctx.client, str));
				break;
			case ArgumentTypes.User:
				add((str: string) => channelParser(ctx.client, str));
				break;
			case ArgumentTypes.Role:
				add((str: string) => channelParser(ctx.client, str));
				break;
		}
	}

	return output;
}

export enum ArgumentTypes {
	String = "text",
	Bool = "boolean",
	Int = "number",
	Float = "number",
	Channel = "channel",
	Message = "message",
	User = "user",
	Role = "role",
	Url = "url"
}

export enum ArgumentFlags {
	Remainder = 0b00000001,
	Optional = 0b00000010
}

interface Argument<T = unknown> {
	key: string;
	default?: T;
	explanation?: string;
	type: ArgumentTypes;
	flags?: number;
	choices?: T[];
}

export type Arguments = Argument[];

type Arg = string | number | boolean | Channel | Message | User | Role;
export type CommandArgs = Record<string, Arg>;

class ArgumentError extends Error {
	constructor(message: string) {
		super(message);
		this.name = "ArgumentError";
	}
}

function hasFlag(arg: Argument, flag: ArgumentFlags) {
	return typeof arg.flags === "number" && Boolean(arg.flags & flag);
}
