import { TextChannel } from "discord.js";
import { SlashCommand, SlashCreator, CommandContext, CommandOptionType, ChannelType } from "slash-create";
import { client, manager } from '../index';

class LyricsCommand extends SlashCommand {
    constructor(creator: SlashCreator) {
        super(creator, {
            name: 'lyrics',
            description: 'set the channel on which the lyrics will be showed.',
            options: [
                {
                    name: 'channel',
                    type: CommandOptionType.CHANNEL,
                    description: 'lyrics channel',
                    required: true,
                    channel_types: [ChannelType.GUILD_TEXT],
                }
            ],
            guildIDs: process.env.DISCORD_GUILD_ID ? [process.env.DISCORD_GUILD_ID] : undefined,
        })
    }

    async run(ctx: CommandContext) {
        await ctx.defer();
        const guild = client.guilds.cache.get(ctx.guildID || '');
        if (!guild) return;
        const channel = client.channels.cache.get(ctx.options.channel) as TextChannel;
        const result = manager.setLyricsChannel(guild, ctx.options.channel);
        ctx.sendFollowUp({ content: result ? `${channel.name} is set to lyrics Channel` : 'lyrics channel set failed' });
    }
}

export default LyricsCommand;