import mongoose, { Schema } from 'mongoose';

export const songSchema = new mongoose.Schema({
    title: {
        type: String,
        require: true,
    },
    release: {
        type: Date,
        require: true,
    },
    author: [String],
    composer: [String],
    arranger: [String],
    genre: [String],
    album: {
        type: Schema.Types.ObjectId,
        ref: 'album',
    },
    youtubeUrl: {
        type: String,
        require: true,
    },
    mvYoutubeUrl: {
        type: String,
    },
    lyrics: [{
        time: Number,
        value: String,
    }]
});

const model = mongoose.model("song", songSchema);

export default model;