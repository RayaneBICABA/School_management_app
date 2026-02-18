const mongoose = require('mongoose');

const printHistorySchema = new mongoose.Schema({
    bulletin: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Bulletin',
        required: false // null for class-wide prints
    },
    eleve: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Eleve',
        required: false // null for class-wide prints
    },
    classe: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Classe',
        required: true
    },
    action: {
        type: String,
        enum: ['DOWNLOAD', 'PRINT'],
        required: true
    },
    actionType: {
        type: String,
        enum: ['INDIVIDUAL', 'CLASS'],
        required: true
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    timestamp: {
        type: Date,
        default: Date.now,
        required: true
    },
    metadata: {
        studentCount: {
            type: Number,
            default: 1
        },
        periode: String,
        anneeScolaire: String
    }
}, {
    timestamps: true
});

// Index for faster queries
printHistorySchema.index({ timestamp: -1 });
printHistorySchema.index({ user: 1, timestamp: -1 });
printHistorySchema.index({ classe: 1, timestamp: -1 });
printHistorySchema.index({ action: 1, actionType: 1 });

module.exports = mongoose.model('PrintHistory', printHistorySchema);
