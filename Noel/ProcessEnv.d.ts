declare namespace NodeJS {
	interface ProcessEnv {
		POSTGRES_URI: string;
		DISCORD_TOKEN: string;
		COMMAND_PREFIX: string;
		HASTEBIN_MIRROR?: string;
		DEBUG?: string;
	}
}
