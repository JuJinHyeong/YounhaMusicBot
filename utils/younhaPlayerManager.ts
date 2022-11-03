import { Player, PlayerSearchResult, QueryType } from "discord-player";
import { ClientUser, Guild, TextChannel, VoiceBasedChannel } from "discord.js";
import { shuffle } from "./shuffle";
import { client } from "..";
import { deleteMarkChannel, getLyrcisChannel, getMarkChannel, upsertLyricsChannel } from "../db";

class YounhaPlayerManager {
    younhaPlayList: PlayerSearchResult;
    player: Player;

    constructor(player: Player) {
        this.player = player;
        this.younhaPlayList = {
            playlist: null,
            tracks: [],
        }
    }

    init = async (user: ClientUser) => {
        const searchResult = await this.player.search(process.env.YOUNHA_PLAYLIST || '', {
            requestedBy: user,
            searchEngine: QueryType.AUTO,
        })
            .catch(() => {
                console.log(`search error`);
            });

        if (!searchResult || !searchResult.tracks.length) {
            return {
                playlist: null,
                tracks: [],
            };
        }
        this.younhaPlayList = searchResult;
    }
    isPaused = (guild: Guild) => {
        const queue = this.player.getQueue(guild);
        return queue ? queue.current && !queue.playing : false;
    }
    isPlaying = (guild: Guild) => {
        const queue = this.player.getQueue(guild);
        return queue ? queue.playing : false;
    }
    play = async (guild: Guild, channel: VoiceBasedChannel) => {
        const queue = await this.player.createQueue(guild, {
            ytdlOptions: {
                filter: 'audioonly',
                quality: 'highestaudio',
                highWaterMark: 1 << 30,
                dlChunkSize: 0,
            },
            metadata: channel,
        });
        if (!queue.connection && channel?.members) {
            await queue.connect(channel);
        }

        const shuffledTracks = shuffle(this.younhaPlayList.tracks);
        queue.addTracks(shuffledTracks);
        await queue.play();
        await this.showLyrics(guild);
    }
    pause = (guild: Guild) => {
        const queue = this.player.getQueue(guild);
        if (queue) queue.setPaused(true);
    }
    resume = (guild: Guild) => {
        const queue = this.player.getQueue(guild);
        if (queue) queue.setPaused(false);
    }
    stop = (guild: Guild) => {
        const queue = this.player.getQueue(guild);
        if (!queue || !queue.playing) return console.log('❌ | No music is being played!');
        queue.destroy();
    }

    isMarkedChannel = async (guildId: string, channelId: string) => {
        const markChannel = await getMarkChannel(guildId);
        if (!markChannel) return false;
        return markChannel.channelId === channelId;
    }

    showLyrics = async (guild: Guild) => {
        const lyricsData = await getLyrcisChannel(guild.id);
        if (lyricsData && lyricsData.channelId && lyricsData.messageId) {
            const channelId = lyricsData.channelId;
            const messageId = lyricsData.messageId;
            const channel = client.channels.cache.get(channelId) as TextChannel;
            const message = await channel.messages.fetch(messageId);
            const existed = Object.keys(message).length;

            if (existed) {
                await message.edit(`${this.player.getQueue(guild)?.current.title}`);
            } else {
                const message = await channel.send(`${this.player.getQueue(guild)?.current.title}`);
                await upsertLyricsChannel(guild.id, channel.id, message.id);
            }
        }
    }

}

export default YounhaPlayerManager;
