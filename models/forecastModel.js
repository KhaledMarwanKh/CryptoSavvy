const mongoose = require('mongoose');

const forecastSchema = new mongoose.Schema({
    symbol: {
        type: String,
        required: true,
        unique: true,
        uppercase: true
    },
    predictions: [
        {
            date: String,
            predicted_price: float,
            min_price: float,
            max_price: float
        }
    ],
    lastUpdated: {
        type: Date,
        default: Date.now
    }
}, { timestamps: true });

// Note: In some mongoose versions, 'float' isn't a type, using 'Number'
const forecastSchemaFixed = new mongoose.Schema({
    symbol: {
        type: String,
        required: true,
        unique: true,
        uppercase: true
    },
    predictions: [
        {
            date: String,
            predicted_price: Number,
            min_price: Number,
            max_price: Number
        }
    ],
    lastUpdated: {
        type: Date,
        default: Date.now
    }
}, { timestamps: true });

module.exports = mongoose.model('Forecast', forecastSchemaFixed);
