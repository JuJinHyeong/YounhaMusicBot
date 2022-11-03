import mongoose from 'mongoose';

const lyricsChannelSchema = new mongoose.Schema({
    guildId: {
        type: String,
        require: true,
    },
    channelId: {
        type: String,
        require: true,
    },
    messageId: {
        type: String,
    },
    createAt: {
        type: Date,
        default: Date.now(),
    },

});

const model = mongoose.model("lyricsChannel", lyricsChannelSchema);

export default model;