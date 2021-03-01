import { config } from "dotenv";
import { Noel } from "./Noel";
import { CommandContext } from "./Commands/CommandContext";

config();

// FIXME REMOVE DUMMY CODE FOR TESTING
const client = new Noel().run();

client.commands.registerAll();

client.on("message", async msg => {
	if (msg.author.bot) return;

	const ctx = CommandContext.parse(msg);
	if (!ctx) return;

	const command = client.commands.get(ctx.commandName);

	if (!command) return;

	command.callback(ctx, await command.parseArgs(ctx));
});

client.once("ready", () => console.log("Ready"));
