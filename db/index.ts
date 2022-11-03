import mongoose from 'mongoose';

import lyricsChannel from './models/lyricsChannel';
import markChannel from './models/markChannel';

export const connect = async () => {
    try{
        const connection = await mongoose.connect('mongodb://localhost:27017/yountopia');
        console.log('conected');
    } catch(err){
        console.log(err);
    }
}

const upsertMarkChnnel = async (guildId: string, channelId: string) => {
    try{
        const data = await markChannel.findOneAndUpdate({ guildId }, { guildId, channelId }, {upsert: true});
        console.log(data);
    } catch(err){
        console.log(err);
    }
}

const upsertLyricsChannel = async (guildId: string, channelId: string, messageId: string) => {
    try{
        const data = await lyricsChannel.findOneAndUpdate({ guildId, channelId }, { guildId, channelId, messageId }, {upsert: true});
        console.log(data);
    } catch(err){
        console.log(err);
    }
}

const test = async () => {
    await connect();
    // await upsertLyricsChannel('123', '55aa');
}

test();