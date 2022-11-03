import { SlashCommand, SlashCreator, CommandContext } from "slash-create";
import { deleteLyricsChannel } from "../db";
import { client } from '../index';

class UnSetLyricsCommand extends SlashCommand {
    constructor(creator: SlashCreator) {
        super(creator, {
            name: 'unsetlyrics',
            description: 'unset the channel on which the lyrics will be showed.',
            guildIDs: process.env.DISCORD_GUILD_ID ? [process.env.DISCORD_GUILD_ID] : undefined,
        })
    }

    async run(ctx: CommandContext) {
        await ctx.defer();
        const guild = client.guilds.cache.get(ctx.guildID || '');
        if (!guild) return;
        const result = await deleteLyricsChannel(guild.id);
        ctx.sendFollowUp({ content: result ? 'unset lyrics channel' : 'unset lyrics channel failed' });
    }
}

export default UnSetLyricsCommand;