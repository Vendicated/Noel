import { Collection } from "discord.js";
import fs from "fs/promises";
import path from "path";
import { NoelCommand } from "./Command";

/** @augments Collection */
export class CommandManager {
	private readonly commands = new Collection<string, NoelCommand>();

	private async register(path: string) {
		const commandImport = await import(path);

		const command: NoelCommand = new commandImport.Command();

		this.commands.set(command.name, command);

		// Delete require cache since import statement transpiles to require statement
		delete require.cache[path];
	}

	public async registerAll(directory = __dirname, ignoreFiles = true) {
		for await (const filename of await fs.readdir(directory)) {
			const filepath = path.join(directory, filename);
			const stats = await fs.stat(filepath);
			if (stats.isDirectory()) {
				this.registerAll(filepath, false);
			} else if (!ignoreFiles) {
				this.register(filepath);
			}
		}
	}

	public get(name: string) {
		name = name.toLowerCase();
		return this.commands.get(name) || this.commands.find(cmd => cmd.aliases.includes(name));
	}

	public search(name: string) {
		name = name.toLowerCase();
		return this.commands.filter(cmd => cmd.name.includes(name) || cmd.aliases.some(alias => alias.includes(name)));
	}

	public delete(name: string) {
		return this.commands.delete(name);
	}

	public set(name: string, command: NoelCommand) {
		return this.commands.set(name, command);
	}

	public has(name: string) {
		return this.commands.has(name);
	}
}
