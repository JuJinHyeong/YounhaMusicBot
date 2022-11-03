import mongoose from 'mongoose';

const albumSchema = new mongoose.Schema({
    title: {
        type: String,
        require: true,
    },
    description: String,
});

const model = mongoose.model("album", albumSchema);

export default model;