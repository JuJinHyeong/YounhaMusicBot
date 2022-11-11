import { CommandContext, SlashCommand, SlashCreator } from 'slash-create';
import { manager } from '..';

class StopCommand extends SlashCommand {
    constructor(creator: SlashCreator) {
        super(creator, {
            name: 'stop',
            description: 'Stop the player',

            guildIDs: process.env.DISCORD_GUILD_ID ? JSON.parse(process.env.DISCORD_GUILD_ID) : undefined
        });
    }

    async run(ctx: CommandContext) {
        await ctx.defer();
        const queue = manager.player.getQueue(ctx.guildID || '');
        if (!queue || !queue.playing) return void ctx.sendFollowUp({ content: '❌ | 음악이 재생되고 있지 않습니다.' });
        queue.destroy();
        return void ctx.sendFollowUp({ content: '🛑 | 곡이 멈췄습니다.' });

    }
};
export default StopCommand;