const mongoose = require('mongoose');

const petSchema = new mongoose.Schema({
    name: { type: String, required: true },
    ownerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    species: { type: String, required: true },                        
    age: { type: Number, required: true },
    breed: { type: String, required: true },
    color: { type: String},
    description: { type: String, required: true },
    status: { type: String, required: true, default: "Adopted"},        
    photos: [String],                                                   
    healthRecords: [String],                                            //Need to update **
    traits: [String],                                                   
    createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Pet', petSchema);
  