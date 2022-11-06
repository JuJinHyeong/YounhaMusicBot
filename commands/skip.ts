import { CommandContext, SlashCommand, SlashCreator } from 'slash-create';
import { manager } from '..';

class SkipCommand extends SlashCommand {
    constructor(creator: SlashCreator) {
        super(creator, {
            name: 'skip',
            description: 'Skip to the current song',

            guildIDs: process.env.DISCORD_GUILD_ID ? [ process.env.DISCORD_GUILD_ID ] : undefined
        });
    }

    async run(ctx: CommandContext) {
        await ctx.defer();
        const queue = manager.player.getQueue(ctx.guildID);
        if (!queue || !queue.playing) return void ctx.sendFollowUp({ content: '❌ | No music is being played!' });
        const currentTrack = queue.current;
        const success = queue.skip();
        return void ctx.sendFollowUp({
            content: success ? `✅ | Skipped **${currentTrack}**!` : '❌ | Something went wrong!'
        });

    }
};

export default SkipCommand;