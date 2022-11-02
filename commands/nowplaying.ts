import { CommandContext, SlashCreator, SlashCommand } from "slash-create";
import { manager } from '../index';

class NowPlayingCommand extends SlashCommand {
    constructor(creator: SlashCreator) {
        super(creator, {
            name: 'np',
            description: 'See what\'s currently being played',

            guildIDs: process.env.DISCORD_GUILD_ID ? [process.env.DISCORD_GUILD_ID] : undefined
        });
    }

    async run(ctx: CommandContext) {

        await ctx.defer();

        const queue = manager.player.getQueue(ctx.guildID || '');
        if (!queue || !queue.playing) return void ctx.sendFollowUp({ content: '❌ | No music is being played!' });
        const progress = queue.createProgressBar();
        const perc = queue.getPlayerTimestamp();

        return void ctx.sendFollowUp({
            embeds: [
                {
                    title: 'Now Playing',
                    description: `🎶 | **${queue.current.title}**! (\`${perc.progress == Infinity ? 'Live' : perc.progress + '%'}\`)`,
                    fields: [
                        {
                            name: '\u200b',
                            value: progress.replace(/ 0:00/g, ' ◉ LIVE')
                        }
                    ],
                    color: 0xffffff
                }
            ]
        });
    }
};

export default NowPlayingCommand;