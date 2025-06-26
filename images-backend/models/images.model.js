const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');


const images = new mongoose.Schema({
    user_id: {
        type: Number,
        required: true
    },
    profile_picture: {
        type: Buffer,
        required: false
    },
});

const Task1 = mongoose.model('images', images);

module.exports = { Task1 };