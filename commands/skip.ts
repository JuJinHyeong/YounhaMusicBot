import { CommandContext, SlashCommand, SlashCreator } from 'slash-create';
import { manager } from '..';

class SkipCommand extends SlashCommand {
    constructor(creator: SlashCreator) {
        super(creator, {
            name: 'skip',
            description: '현재 곡을 스킵합니다.',
            guildIDs: process.env.DISCORD_GUILD_ID ? [ process.env.DISCORD_GUILD_ID ] : undefined
        });
    }

    async run(ctx: CommandContext) {
        await ctx.defer();
        const queue = manager.player.getQueue(ctx.guildID || '');
        if (!queue || !queue.playing) return void ctx.sendFollowUp({ content: '❌ | 현재 곡이 재생되고 있지 않습니다.' });
        const currentTrack = queue.current;
        const success = queue.skip();
        return void ctx.sendFollowUp({
            content: success ? `✅ | **${currentTrack}** 스킵합니다.` : '❌ | 정상적으로 스킵하지 못했습니다.'
        });

    }
};

export default SkipCommand;