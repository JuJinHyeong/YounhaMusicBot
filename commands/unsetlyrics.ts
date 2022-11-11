import { SlashCommand, SlashCreator, CommandContext } from "slash-create";
import { deleteLyricsChannel } from "../db";
import { client } from '../index';

class UnSetLyricsCommand extends SlashCommand {
    constructor(creator: SlashCreator) {
        super(creator, {
            name: 'unsetlyrics',
            description: '가사가 보이는 채팅채널을 초기화 합니다.',
            guildIDs: process.env.DISCORD_GUILD_ID ? JSON.parse(process.env.DISCORD_GUILD_ID) : undefined,
            // requiredPermissions: ['관리자']
        })
    }

    async run(ctx: CommandContext) {
        await ctx.defer();
        const guild = client.guilds.cache.get(ctx.guildID || '');
        if (!guild) return;
        const result = await deleteLyricsChannel(guild.id);
        ctx.sendFollowUp({ content: result ? '초기화되었습니다.' : '초기화 실패하였습니다.' });
    }
}

export default UnSetLyricsCommand;