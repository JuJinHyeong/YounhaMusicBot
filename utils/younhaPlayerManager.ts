import { Player, PlayerSearchResult, QueryType, Track } from "discord-player";
import { ClientUser, Guild, TextChannel, VoiceBasedChannel } from "discord.js";
import { shuffle } from "./shuffle";
import { client } from "..";
import { deleteMarkChannel, getAllSongs, getLyrcisChannel, getMarkChannel, getSongYoutubeUrl, updateSongYoutubeUrl, upsertLyricsChannel } from "../db";

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

    addYoutubeUrl = async () => {
        const allSong = await getAllSongs();

        allSong.forEach((song) => {
            const urls: string[] = [];
            this.younhaPlayList.tracks.forEach((track) => {
                const index = track.title.indexOf(song.title || 'no_found_string');
                if(index !== -1) {
                    urls.push(track.url);
                }
            })
            if(urls.length > 0){
                console.log(song.title, urls[0]);
                updateSongYoutubeUrl(song.title || '', urls[0]);
            }
        })
    }

    init = async (user: ClientUser) => {
        const searchResult = await this.player.search(process.env.YOUNHA_PLAYLIST || '', {
            requestedBy: user,
            searchEngine: QueryType.AUTO,
        }).catch(() => {
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

    showLyrics = async (guild: Guild, track: Track) => {
        const lyricsData = await getLyrcisChannel(guild.id);
        const songData = await getSongYoutubeUrl(track.url);
        if (lyricsData && lyricsData.channelId && lyricsData.messageId) {
            const channelId = lyricsData.channelId;
            const messageId = lyricsData.messageId;
            const channel = client.channels.cache.get(channelId) as TextChannel;
            const message = await channel.messages.fetch(messageId);
            const existed = Object.keys(message).length;

            let messageText = '';
            if(songData) {
                messageText = (songData?.title || '') + '\n\n' + (songData?.lyrics[0].value || '');
            }else{
                messageText = `${this.player.getQueue(guild)?.current.title}`
            }
            if (existed) {
                await message.edit(messageText);
            } else {
                const message = await channel.send(messageText);
                await upsertLyricsChannel(guild.id, channel.id, message.id);
            }
        }
    }

}

export default YounhaPlayerManager;
