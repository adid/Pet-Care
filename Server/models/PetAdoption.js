const mongoose = require('mongoose');

const petAdoptionSchema = new mongoose.Schema({
    PetID: { type: mongoose.Schema.Types.ObjectId, ref: 'Pet', required: true },
    AdoptionDescription: { type: String, required: true },
    adoptionType: { type: String, required: true },                                 // ["permanent", "temporary"]
    ReturnDate: { type: Date },
    comments: [
        {
            userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
            text: { type: String, required: true },
            createdAt: { type: Date, default: Date.now }
        }
    ],
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('PetAdoption', petAdoptionSchema);
  