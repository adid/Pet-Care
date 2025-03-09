const mongoose = require('mongoose');

const petSchema = new mongoose.Schema({
    name: { type: String, required: true },
    ownerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    species: { type: String, required: true },                        
    dateOfBirth: { type: Date, required: true },
    breed: { type: String, required: true },
    color: { type: String, required: true },
    description: { type: String },
    status: { type: String, required: true, default: "Adopted"},   
    profilePhoto: { type: String },     
    photos: [String],                                                   
    healthRecords: [String],
    traits: [String],                                                   
    createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Pet', petSchema);
  