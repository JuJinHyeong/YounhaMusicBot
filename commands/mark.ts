import { VoiceChannel } from "discord.js";
import { SlashCommand, SlashCreator, CommandContext, CommandOptionType, ChannelType } from "slash-create";
import { client, manager } from '../index';

class MarkCommand extends SlashCommand {
    constructor(creator: SlashCreator) {
        super(creator, {
            name: 'mark',
            description: 'mark the channel on which the song will be played.',
            options: [
                {
                    name: 'channel',
                    type: CommandOptionType.CHANNEL,
                    description: 'mark channel',
                    required: true,
                    channel_types: [ChannelType.GUILD_VOICE],
                }
            ],
            guildIDs: process.env.DISCORD_GUILD_ID ? [process.env.DISCORD_GUILD_ID] : undefined,
        })
    }

    async run(ctx: CommandContext) {
        await ctx.defer();
        const guild = client.guilds.cache.get(ctx.guildID || '');
        if (!guild) return;
        const channel = client.channels.cache.get(ctx.options.channel) as VoiceChannel;
        const result = manager.setMarkedChannel(guild, ctx.options.channel);
        ctx.sendFollowUp({ content: result ? `${channel.name} is marked` : 'mark failed' });
    }
}

export default MarkCommand;