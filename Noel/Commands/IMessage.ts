import { Message, Guild, GuildMember, TextChannel, NewsChannel } from "discord.js";
import { Noel } from "../Noel";

export interface IMessage extends Message {
	client: Noel;
}

export interface IGuildMessage extends IMessage {
	guild: Guild;
	member: GuildMember;
	channel: TextChannel | NewsChannel;
}
