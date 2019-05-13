const mongoose = require('mongoose');

const { Schema } = mongoose;

const passengerSchema = new Schema({
    number: { type: String, required:true },

    balance: { type: Number, required: true, default: 30 }
    
}, { timestamps: true});
 

module.exports = mongoose.model('Passenger', passengerSchema);