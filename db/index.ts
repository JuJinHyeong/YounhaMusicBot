import mongoose from 'mongoose';
import album from './models/album';

import lyricsChannel from './models/lyricsChannel';
import markChannel from './models/markChannel';
import song from './models/song';

export const connect = async () => {
    try {
        console.log(process.env.DB_URL);
        await mongoose.connect(process.env.DB_URL || '');
        console.log('conected');
    } catch (err) {
        console.log(err);
    }
}

export const getMarkChannel = async (guildId: string) => {
    try {
        return await markChannel.findOne({ guildId });
    } catch (err) {
        console.log(err);
    }
}
export const upsertMarkChannel = async (guildId: string, channelId: string) => {
    try {
        const data = await markChannel.findOneAndUpdate({ guildId }, { guildId, channelId }, { upsert: true });
        return true;
    } catch (err) {
        console.log(err);
        return false;
    }
}
export const deleteMarkChannel = async (guildId: string) => {
    try {
        const data = await markChannel.deleteMany({ guildId });
        return true;
    } catch (err) {
        console.log(err);
        return false;
    }
}

export const getLyrcisChannel = async (guildId: string) => {
    try {
        return await lyricsChannel.findOne({ guildId });
    } catch (err) {
        console.log(err);
    }
}
export const upsertLyricsChannel = async (guildId: string, channelId: string, messageId: string) => {
    try {
        const data = await lyricsChannel.findOneAndUpdate({ guildId, channelId }, { guildId, channelId, messageId }, { upsert: true });
        return true;
    } catch (err) {
        console.log(err);
        return false;
    }
}
export const deleteLyricsChannel = async (guildId: string) => {
    try {
        const data = await lyricsChannel.deleteMany({ guildId });
        return true;
    } catch (err) {
        console.log(err);
        return false;
    }
}
export const getAllSongs = async () => {
    try {
        const data = await song.find();
        return data;
    } catch (err) {
        console.log(err);
        return [];
    }
}
export const updateSongYoutubeUrl = async (title: string, youtubeUrl: string) => {
    try {
        const data = await song.updateOne({ title }, { youtubeUrl });
        return data;
    } catch (err) {
        console.log(err);
        return false;
    }
}
export const getSongYoutubeUrl = async (youtubeUrl: string) => {
    try {
        const data = await song.findOne({youtubeUrl});
        return data;
    } catch(err){
        console.log(err);
        return;
    }
}
export const getAlbum = async (id?: mongoose.Types.ObjectId) => {
    try {
        if(id) {
            const data = await album.findOne({_id: new mongoose.Types.ObjectId(id) });
            return data;
        }
    } catch(err) {
        console.log(err);
        return;
    }
}