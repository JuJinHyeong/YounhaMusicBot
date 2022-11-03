import { SlashCommand, SlashCreator, CommandContext } from "slash-create";
import { deleteMarkChannel } from "../db";
import { client, manager } from '../index';

class MarkCommand extends SlashCommand {
    constructor(creator: SlashCreator) {
        super(creator, {
            name: 'unmark',
            description: 'unmark the channel on which the song will be played.',
            guildIDs: process.env.DISCORD_GUILD_ID ? [process.env.DISCORD_GUILD_ID] : undefined,
        })
    }

    async run(ctx: CommandContext) {
        await ctx.defer();
        const guild = client.guilds.cache.get(ctx.guildID || '');
        if (!guild) return;
        const result = await deleteMarkChannel(guild.id);
        ctx.sendFollowUp({ content: result ? 'unmarked' : 'unmark failed' });
    }
}

export default MarkCommand;