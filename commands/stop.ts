import { CommandContext, SlashCommand, SlashCreator } from 'slash-create';
import { manager } from '..';

class StopCommand extends SlashCommand {
    constructor(creator: SlashCreator) {
        super(creator, {
            name: 'stop',
            description: 'Stop the player',

            guildIDs: process.env.DISCORD_GUILD_ID ? [process.env.DISCORD_GUILD_ID] : undefined
        });
    }

    async run(ctx: CommandContext) {
        await ctx.defer();
        const queue = manager.player.getQueue(ctx.guildID || '');
        if (!queue || !queue.playing) return void ctx.sendFollowUp({ content: '❌ | No music is being played!' });
        queue.destroy();
        return void ctx.sendFollowUp({ content: '🛑 | Stopped the player!' });

    }
};
export default StopCommand;