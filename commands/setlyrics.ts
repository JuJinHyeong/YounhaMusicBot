import { TextChannel } from "discord.js";
import { SlashCommand, SlashCreator, CommandContext, CommandOptionType, ChannelType } from "slash-create";
import { upsertLyricsChannel } from "../db";
import { client, manager } from '../index';

class LyricsCommand extends SlashCommand {
    constructor(creator: SlashCreator) {
        super(creator, {
            name: 'setlyrics',
            description: '가사가 보일 채팅채널을 선택합니다.',
            options: [
                {
                    name: 'channel',
                    type: CommandOptionType.CHANNEL,
                    description: '가사가 보일 채널',
                    required: true,
                    channel_types: [ChannelType.GUILD_TEXT],
                }
            ],
            guildIDs: process.env.DISCORD_GUILD_ID ? JSON.parse(process.env.DISCORD_GUILD_ID) : undefined,
        })
    }

    async run(ctx: CommandContext) {
        await ctx.defer();
        const guild = client.guilds.cache.get(ctx.guildID || '');
        if (!guild) return;
        const channel = client.channels.cache.get(ctx.options.channel) as TextChannel;
        const message = await channel.send("Lyrics...");
        const result = await upsertLyricsChannel(guild.id, channel.id, message.id);
        ctx.sendFollowUp({ content: result ? `${channel.name} 이 가사채널로 선택됐습니다.` : '가사 채널을 선택하는데 문제가 있습니다.' });
    }
}

export default LyricsCommand;