import { Player, PlayerSearchResult, QueryType } from "discord-player";
import { Channel, ClientUser, Guild, TextChannel, VoiceBasedChannel } from "discord.js";
import { shuffle } from "./shuffle";
import fs from 'fs';
import path from 'path';
import { client } from "..";

class YounhaPlayerManager {
    younhaPlayList: PlayerSearchResult;
    player: Player;
    markedChannel: { [key: string]: string };
    lyricsChannel: { [key: string]: string };
    lyricsMessage: { [key: string]: string };

    constructor(player: Player) {
        this.player = player;
        this.younhaPlayList = {
            playlist: null,
            tracks: [],
        }
        this.markedChannel = {};
        this.lyricsChannel = {};
        this.lyricsMessage = {};
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

        const markedChannelData = fs.readFileSync(path.join(__dirname, '..', 'db', 'mark_channel.json'), { encoding: 'utf-8', flag: 'r' });
        this.markedChannel = JSON.parse(markedChannelData || '{}');
        const lyricsChannelData = fs.readFileSync(path.join(__dirname, '..', 'db', 'lyrics_channel.json'), { encoding: 'utf-8', flag: 'r' });
        this.lyricsChannel = JSON.parse(lyricsChannelData || '{}');
        const lyricsMessageData = fs.readFileSync(path.join(__dirname, '..', 'db', 'lyrics_message.json'), { encoding: 'utf-8', flag: 'r' });
        this.lyricsMessage = JSON.parse(lyricsMessageData || '{}');
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

    setMarkedChannel = (guild: Guild, markedChannelId: string) => {
        if (!guild.id) {
            return false;
        }
        this.markedChannel[guild.id] = markedChannelId;
        fs.writeFileSync(path.join(__dirname, '..', 'db', 'mark_channel.json'), JSON.stringify(this.markedChannel));

        return true;
    }
    removeMarkedChannel = (guild: Guild) => {
        delete this.markedChannel[guild.id];
        fs.writeFileSync(path.join(__dirname, '..', 'db', 'mark_channel.json'), JSON.stringify(this.markedChannel));
    }
    getMarkedChannel = (guild: Guild) => {
        return this.markedChannel[guild.id];
    }
    isMarkedChannel = (guild: Guild, channelId: string) => {
        return this.markedChannel[guild.id] === channelId;
    }

    setLyricsChannel = (guild: Guild, lyricsChannelId: string) => {
        if (!guild.id) {
            return false;
        }
        this.lyricsChannel[guild.id] = lyricsChannelId;
        fs.writeFileSync(path.join(__dirname, '..', 'db', 'lyrics_channel.json'), JSON.stringify(this.lyricsChannel));
        return true;
    }

    showLyrics = async (guild: Guild) => {
        const channelId = this.lyricsChannel[guild.id];
        const channel = client.channels.cache.get(channelId) as TextChannel;
        const lyrics = await channel.messages.fetch(this.lyricsMessage[channelId]);
        const existed = Object.keys(lyrics).length;

        if (existed) {
            await lyrics.edit(`${this.player.getQueue(guild)?.current.title}`);
        } else {
            const message = await channel.send(`${this.player.getQueue(guild)?.current.title}`);
            this.setLyricsMessage(channel, message.id);
        }
    }

    setLyricsMessage = (channel: Channel, messageId: string) => {
        if (!channel.id) {
            return false;
        }
        this.lyricsMessage[channel.id] = messageId;
        fs.writeFileSync(path.join(__dirname, '..', 'db', 'lyrics_message.json'), JSON.stringify(this.lyricsMessage));
        return true;
    }
}

export default YounhaPlayerManager;
