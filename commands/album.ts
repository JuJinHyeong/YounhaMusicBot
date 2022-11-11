import { CommandContext, SlashCreator, SlashCommand, CommandOptionType } from "slash-create";
import album from "../db/models/album";
import escapeRegex from "../utils/escapeRegex";
import moment from 'moment';

class AlbumCommand extends SlashCommand {
    constructor(creator: SlashCreator) {
        super(creator, {
            name: 'album',
            description: '앨범정보를 제목으로 찾습니다.',
            options: [
                {
                    name: 'title',
                    type: CommandOptionType.STRING,
                    description: '앨범 제목',
                    required: true,
                }
            ]
        });
    }

    async run(ctx: CommandContext) {
        await ctx.defer();
        const reg = new RegExp(escapeRegex(ctx.options.title), "g");
        const data = await album.find({title: {$regex: reg}});
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
                        description: data.map((albumData) => `**${albumData.title}**`).join('\n'),
                    }
                ]
            })
        }
        else{
            const albumData = data[0];
            return void ctx.sendFollowUp({
                embeds: [
                    {
                        title: '앨범 정보',
                        description: `${albumData.title}(${albumData.type})\n발매일: ${moment(albumData.release).format("YYYY-MM-DD")}\n`,
                        color: 0xffffff,
                        image: {url: albumData.imgUrl},
                    }
                ]
            });
        }
    }
};

export default AlbumCommand;