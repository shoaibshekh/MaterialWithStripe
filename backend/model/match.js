const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const matchSchema = new Schema({
    type: {
        type: String,
        required: true,
    },
    version: {
        type: String,
        required: true
    },
    map: {
        type: String,
        required: true
    },
    fees: {
        type: String,
        required: true
    },
    win: {
        type: String,
        required: true
    },
    perkill: {
        type: String,
        required: true
    },
    date: {
        type: String,
        required: true
    },
    time: {
        type: String,
        required: true
    },
    
    
});


const Match = mongoose.model('Match', matchSchema);
module.exports = Match;