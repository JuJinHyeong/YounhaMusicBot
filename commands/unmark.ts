import { SlashCommand, SlashCreator, CommandContext } from "slash-create";
import { deleteMarkChannel } from "../db";
import { client, manager } from '../index';

class MarkCommand extends SlashCommand {
    constructor(creator: SlashCreator) {
        super(creator, {
            name: 'unmark',
            description: '곡이 재생될 음성채널을 초기화합니다.',
            guildIDs: process.env.DISCORD_GUILD_ID ? JSON.parse(process.env.DISCORD_GUILD_ID) : undefined,
            // requiredPermissions: ['관리자']
        })
    }

    async run(ctx: CommandContext) {
        await ctx.defer();
        const guild = client.guilds.cache.get(ctx.guildID || '');
        if (!guild) return;
        const result = await deleteMarkChannel(guild.id);
        ctx.sendFollowUp({ content: result ? '초기화했습니다.' : '초기화 실패했습니다.' });
    }
}

export default MarkCommand;