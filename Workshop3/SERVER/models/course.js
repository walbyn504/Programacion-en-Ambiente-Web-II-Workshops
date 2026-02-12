const mongoose = require('mongoose');

const courseSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    credits: {
        required: true,
        type: Number
    },
    code: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    professorId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Professor',
        required: true
    }
});

module.exports = mongoose.model('Course', courseSchema);
