import { Player, PlayerSearchResult, QueryType, Queue, Track } from "discord-player";
import { ClientUser, Guild, StageChannel, TextChannel, VoiceBasedChannel, VoiceChannel } from "discord.js";
import { shuffle } from "./shuffle";
import { client } from "..";
import { getAlbum, getLyrcisChannel, getMarkChannel, getSongYoutubeUrl, updateSongYoutubeUrl, upsertLyricsChannel } from "../db";
import song from "../db/models/song";
import lyricsChannel from "../db/models/lyricsChannel";

export interface CustomTrack extends Track {
    db?: any;
}

interface CustomPlayerSearchResult extends PlayerSearchResult {
    tracks: CustomTrack[];
}

class YounhaPlayerManager {
    younhaPlayList: CustomPlayerSearchResult;
    shuffledTracks: CustomTrack[];
    player: Player;

    constructor(player: Player) {
        this.player = player;
        this.shuffledTracks = [];
        this.younhaPlayList = {
            playlist: null,
            tracks: [],
        }
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
        const allSongs = await song.find();
        this.younhaPlayList.tracks.forEach(async (track) => {
            track.db = allSongs.find((song) => song.youtubeUrl === track.url);
        })
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
        if (queue.playing) {
            return;
        }
        await this.addTrack(queue);
        await queue.play();
    }
    addTrack = async (queue: Queue<any>) => {
        if(this.shuffledTracks.length === 0){
            this.shuffledTracks = shuffle(this.younhaPlayList.tracks);
        }
        queue.addTracks(this.shuffledTracks.splice(0, queue.tracks.length ? 1 : 10));
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
        const lyricsData = await lyricsChannel.findOne({ guildId: guild.id });;
        const songData = await song.findOne({youtubeUrl: track.url}).populate('album');
        const albumData = songData?.album as any;
        if (lyricsData && lyricsData.channelId && lyricsData.messageId) {
            const channelId = lyricsData.channelId;
            const messageId = lyricsData.messageId;
            const channel = client.channels.cache.get(channelId) as TextChannel;
            const message = await channel.messages.fetch(messageId);
            const existed = Object.keys(message).length;

            let messageText = '';
            if(songData && albumData) {
                messageText = 
                `앨범(${albumData.type || ''}): ` + (albumData.title || '') + '\n\n'
                + '제목: ' + (songData?.title || '') + '\n\n' 
                + (songData?.lyrics[0].value || '');
            }else{
                messageText = `${this.player.getQueue(guild)?.current.title}`
            }
            if (existed) {
                await message.edit({content: '', embeds: [{title: '가사', description: messageText}]});
            } else {
                const message = await channel.send({content: '', embeds: [{title: '가사', description: messageText}]});
                await upsertLyricsChannel(guild.id, channel.id, message.id);
            }
        }
    }
    removeLyrics = async (guild: Guild) => {
        const lyricsData = await lyricsChannel.findOne({ guildId: guild.id });
        if (lyricsData && lyricsData.channelId && lyricsData.messageId) {
            const channelId = lyricsData.channelId;
            const messageId = lyricsData.messageId;
            const channel = client.channels.cache.get(channelId) as TextChannel;
            const message = await channel.messages.fetch(messageId);
            const existed = Object.keys(message).length;
            if (existed) {
                await message.edit({content: '재생중인 곡이 없습니다.', embeds: []});
            } else {
                const message = await channel.send({content: '재생중인 곡이 없습니다.', embeds: []});
                await upsertLyricsChannel(guild.id, channel.id, message.id);
            }
        }
    }
}

export default YounhaPlayerManager;
