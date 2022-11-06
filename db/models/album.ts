import mongoose from 'mongoose';

const albumSchema = new mongoose.Schema({
    title: {
        type: String,
        require: true,
        unique: true,
    },
    type: {
        type: String,
        require: true,
    },
    release: {
        type: Date,
        require: true,
    },
    genre: [String],
    publisher: String,
    agency: String,
    description: String,
    imgUrl: String,
});

const model = mongoose.model("album", albumSchema);

export default model;