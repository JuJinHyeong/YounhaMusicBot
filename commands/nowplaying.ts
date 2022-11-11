import { CommandContext, SlashCreator, SlashCommand } from "slash-create";
import { manager } from '../index';
import { CustomTrack } from "../utils/younhaPlayerManager";

class NowPlayingCommand extends SlashCommand {
    constructor(creator: SlashCreator) {
        super(creator, {
            name: 'np',
            description: '현재 재생중인 곡 정보를 확인합니다.',
        });
    }

    async run(ctx: CommandContext) {
        console.log('np');

        await ctx.defer();

        const queue = manager.player.getQueue(ctx.guildID || '');
        if (!queue || !queue.playing) return void ctx.sendFollowUp({ content: '❌ | 현재 곡이 재생되고 있지 않습니다.' });
        const progress = queue.createProgressBar();
        const perc = queue.getPlayerTimestamp();
        const currentSongData = (queue.current as CustomTrack).db;

        return void ctx.sendFollowUp({
            embeds: [
                {
                    title: '현재 재생중인 곡',
                    description: `🎶 | **${currentSongData.title}**! (\`${perc.progress == Infinity ? 'Live' : perc.progress + '%'}\`)`,
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