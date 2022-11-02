import { SlashCommand, CommandOptionType, SlashCreator, CommandContext } from "slash-create";
import { QueryType } from 'discord-player';
import { client, manager } from '../index';
import { UserResolvable } from "discord.js";

class PlayCommand extends SlashCommand {
    constructor(creator: SlashCreator) {
        super(creator, {
            name: 'play',
            description: 'Play a song from youtube',
            options: [
                {
                    name: 'query',
                    type: CommandOptionType.STRING,
                    description: 'The song you want to play',
                    required: true
                }
            ],
            guildIDs: process.env.DISCORD_GUILD_ID ? [process.env.DISCORD_GUILD_ID] : undefined,
        })
    }

    async run(ctx: CommandContext) {
        await ctx.defer(); if (!ctx.guildID) return;
        const guild = client.guilds.cache.get(ctx.guildID); if (!guild) return;
        const channel = client.guilds.cache.get(ctx.channelID);
        const query = ctx.options.query;
        const searchResult = await manager.player
            .search(query, {
                requestedBy: (ctx.user as unknown) as UserResolvable,
                searchEngine: QueryType.AUTO,
            })
            .catch(() => {
                console.log(`\'${query}\' search error`);
            });

        if (!searchResult || !searchResult.tracks.length) {
            return;
        }

        const queue = await manager.player.createQueue(guild, {
            ytdlOptions: {
                filter: 'audioonly',
                quality: 'highestaudio',
                highWaterMark: 1 << 30,
                dlChunkSize: 0,
            },
            metadata: channel,
        });

        const member = guild.members.cache.get(ctx.user.id) ?? await guild.members.fetch(ctx.user.id);

        try {
            if (!queue.connection && member.voice.channel) await queue.connect(member.voice.channel);
        } catch {
            manager.player.deleteQueue(ctx.guildID);
            return ctx.sendFollowUp({ content: 'Could not join your voice channel!' });
        }

        await ctx.sendFollowUp({ content: `⏱ | Loading your ${searchResult.playlist ? 'playlist' : 'track'}...` });
        searchResult.playlist ? queue.addTracks(searchResult.tracks) : queue.addTrack(searchResult.tracks[0]);
        if (!queue.playing) await queue.play();
    }
}

export default PlayCommand;