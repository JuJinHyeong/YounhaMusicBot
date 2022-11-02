import { SlashCreator, CommandContext, SlashCommand, CommandOptionType } from "slash-create";
import { manager } from "..";

class QueueCommand extends SlashCommand {
    constructor(creator: SlashCreator) {
        super(creator, {
            name: 'queue',
            description: 'See the queue',
            options: [
                {
                    name: 'page',
                    type: CommandOptionType.INTEGER,
                    description: 'Specific page number in queue',
                    required: false
                }
            ],

            guildIDs: process.env.DISCORD_GUILD_ID ? [process.env.DISCORD_GUILD_ID] : undefined
        });
    }

    async run(ctx: CommandContext) {

        await ctx.defer();
        const queue = manager.player.getQueue(ctx.guildID || '');
        if (!queue || !queue.playing) return void ctx.sendFollowUp({ content: '❌ | No music is being played!' });
        if (!ctx.options.page) ctx.options.page = 1;
        const pageStart = 10 * (ctx.options.page - 1);
        const pageEnd = pageStart + 10;
        const currentTrack = queue.current;
        const tracks = queue.tracks.slice(pageStart, pageEnd).map((m: any, i: any) => {
            return `${i + pageStart + 1}. **${m.title}** ([link](${m.url}))`;
        });

        return void ctx.sendFollowUp({
            embeds: [
                {
                    title: 'Server Queue',
                    description: `${tracks.join('\n')}${queue.tracks.length > pageEnd
                            ? `\n...${queue.tracks.length - pageEnd} more track(s)`
                            : ''
                        }`,
                    color: 0xff0000,
                    fields: [{ name: 'Now Playing', value: `🎶 | **${currentTrack.title}** ([link](${currentTrack.url}))` }]
                }
            ]
        });

    }
};

export default QueueCommand;