import moment from "moment";
import { CommandContext, SlashCreator, SlashCommand, CommandOptionType } from "slash-create";
import song from '../db/models/song';
import escapeRegex from "../utils/escapeRegex";

class SongCommand extends SlashCommand {
    constructor(creator: SlashCreator) {
        super(creator, {
            name: 'song',
            description: '곡 정보를 제목으로 찾습니다.',
            options: [
                {
                    name: 'title',
                    type: CommandOptionType.STRING,
                    description: 'song title',
                    required: true,
                }
            ]
        });
    }

    async run(ctx: CommandContext) {
        console.log('song');
        await ctx.defer();
        const reg = new RegExp(escapeRegex(ctx.options.title), "g");
        const data = await song.find({title: {$regex: reg}}).populate('album');
        if(data.length === 0) {
            return ctx.sendFollowUp({
                embeds: [
                    {
                        title: '검색 결과',
                        description: '검색된 곡이 없습니다.',
                    }
                ]
            })
        }
        else if(data.length > 1) {
            return ctx.sendFollowUp({
                embeds: [
                    {
                        title: '검색 결과',
                        description: data.map((songData) => `**${songData.title}**`).join('\n'),
                    }
                ]
            })
        }
        else{
            const songData = data[0];
            const information = [
                `제목: ${songData.title}`,
                `작곡가: ${songData.composer.join(', ')}`,
                `작사가: ${songData.author.join(', ')}`,
                `편곡: ${songData.arranger.join(', ')}`,
                `발매일: ${moment(songData.release).format("YYYY-MM-DD")}`
            ]
            return void ctx.sendFollowUp({
                embeds: [
                    {
                        title: '곡 정보',
                        description: information.join('\n'),
                        color: 0xffffff
                    }
                ]
            });
        }
    }
};

export default SongCommand;