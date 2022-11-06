import mongoose from 'mongoose';

import lyricsChannel from './models/lyricsChannel';
import markChannel from './models/markChannel';
import album from './models/album';
import song from './models/song';
import axios from 'axios';
import { load } from 'cheerio';

import dotenv from 'dotenv';

export const connect = async () => {
    try {
        dotenv.config();
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
