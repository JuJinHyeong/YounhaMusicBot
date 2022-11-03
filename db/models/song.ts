import mongoose, { Schema } from 'mongoose';

const songSchema = new mongoose.Schema({
    title: {
        type: String,
        require: true,
    },
    author: [String],
    arranger: [String],
    composer: [String],
    album_id: {
        type: Schema.Types.ObjectId,
        ref: 'album',
    },
    youtubeUrl: {
        type: String,
        require: true,
    },
    lyrics: [{
        time: Number,
        value: String,
    }]
});

const model = mongoose.model("song", songSchema);

export default model;