import { SlashCreator, CommandContext, SlashCommand, CommandOptionType } from "slash-create";
import { client, manager } from "..";
import { CustomTrack } from "../utils/younhaPlayerManager";

class QueueCommand extends SlashCommand {
    constructor(creator: SlashCreator) {
        super(creator, {
            name: 'queue',
            description: '현재 재생목록을 확인합니다.',
            options: [
                {
                    name: 'page',
                    type: CommandOptionType.INTEGER,
                    description: 'Specific page number in queue',
                    required: false
                }
            ],
            // guildIDs: process.env.DISCORD_GUILD_ID ? JSON.parse(process.env.DISCORD_GUILD_ID) : undefined
        });
    }

    async run(ctx: CommandContext) {
        console.log('queue');
        await ctx.defer();
        const queue = manager.player.getQueue(ctx.guildID || '');
        if (!queue || !queue.playing) return void ctx.sendFollowUp({ content: '❌ | 현재 곡이 재생되고 있지 않습니다.' });
        if (!ctx.options.page) ctx.options.page = 1;
        const pageStart = 10 * (ctx.options.page - 1);
        const pageEnd = pageStart + 10;
        const currentTrack = queue.current as CustomTrack;
        const tracks = (queue.tracks as CustomTrack[]).slice(pageStart, pageEnd).map((m, i) => {
            return `${i + pageStart + 1}. **${m.db.title}**`;
        });

        return void ctx.sendFollowUp({
            embeds: [
                {
                    title: '플레이리스트',
                    description: tracks.join('\n'),
                    color: 0xff0000,
                    fields: [{ name: '현재 곡', value: `🎶 | **${currentTrack.db.title}**` }]
                }
            ]
        });

    }
};

export default QueueCommand;