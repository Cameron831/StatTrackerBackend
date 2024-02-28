const mongoose = require('mongoose');

const playerSchema = new mongoose.Schema({
    player: {
        type: String,
        required: true,
    },
    PTS: {
        type: Boolean,
        default: false
    },
    REB: {
        type: Boolean,
        default: false
    },
    AST: {
        type: Boolean,
        default: false
    },
    TPM: {
        type: Boolean,
        default: false
    },
    BLK: {
        type: Boolean,
        default: false
    },
    STL: {
        type: Boolean,
        default: false
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }
});

playerSchema.index({ player: 1, user: 1 }, { unique: true });

module.exports = mongoose.model('Player', playerSchema, 'players');