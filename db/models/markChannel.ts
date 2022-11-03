import mongoose from 'mongoose';

const markChannelSchema = new mongoose.Schema({
    guildId: {
        type: String,
        require: true,
        unique: true,
    },
    channelId: {
        type: String,
        require: true,
    },
    createAt: {
        type: Date,
        default: Date.now,
    },
});

const model = mongoose.model("markChannel", markChannelSchema);

export default model;