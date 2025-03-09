const fs = require('fs');
const path = require('path');

const Pet = require('../models/Pet');
const User = require('../models/User');

// Create Pet Profile
const createPetProfile = async (req, res) => {
    const { name, species, dateOfBirth, breed, color, description, traits, photos, healthRecords } = req.body;
    const ownerId = req.user._id;

    try {
        if (!name || !species || !dateOfBirth || !breed || !color) {
            return res.status(400).json({ message: "Missing required fields" });
        }

        // Create a new pet profile
        const pet = new Pet({
            name,
            ownerId,
            species,
            dateOfBirth,
            breed,
            color,
            description,
            traits: traits || [],
            photos: photos || [],
            healthRecords: healthRecords || [],
        });

        // Save to database
        await pet.save();

        // Add the pet to the owner's profile
        const user = await User.findById(ownerId);
        user.petsOwned.push(pet._id);
        await user.save();

        return res.status(201).json({
            message: "Pet profile created successfully",
            pet: pet,
        });
    } catch (error) {
        console.error("Error creating pet profile:", error);
        return res.status(500).json({ message: "Error creating pet profile", error: error.message });
    }
};

// Update Pet Profile
const updatePetProfile = async (req, res) => {
    const { id } = req.params;
    const { description, traits, healthRecords } = req.body;

    try {
        // Find the pet by ID
        const pet = await Pet.findById(id);
        if (!pet) {
            return res.status(404).json({ message: "Pet not found" });
        }

        // Check if the authenticated user is the owner of the pet
        if (pet.ownerId.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: "You are not authorized to update this pet profile" });
        }

        // Update fields if provided
        if (description !== undefined) pet.description = description;
        if (traits) pet.traits = traits;
        if (healthRecords) pet.healthRecords = healthRecords;

        // Save updated profile
        const updatedPet = await pet.save();

        return res.status(200).json({
            message: "Pet profile updated successfully",
            pet: updatedPet,
        });
    } catch (error) {
        console.error("Error updating pet profile:", error);
        return res.status(500).json({ message: "Error updating pet profile", error: error.message });
    }
};

// Delete Pet Profile
const deletePetProfile = async (req, res) => {
    const { id } = req.params; // Pet ID from URL parameters

    try {
        const pet = await Pet.findById(id);

        if (!pet) {
            return res.status(404).json({ message: "Pet not found" });
        }

        // Check if the authenticated user is the owner of the pet
        if (pet.ownerId.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: "You are not authorized to delete this pet profile" });
        }

        // Delete the pet profile
        await Pet.findByIdAndDelete(id);

        return res.status(200).json({ message: "Pet profile deleted successfully" });
    } catch (error) {
        console.error("Error deleting pet profile:", error);
        return res.status(500).json({ message: "Error deleting pet profile", error: error.message });
    }
};

// Get Pet Profile
const getPetProfile = async (req, res) => {
    const { id } = req.params; // Pet ID from URL parameters

    try {
        const pet = await Pet.findById(id).populate('ownerId', 'username name email');

        if (!pet) {
            return res.status(404).json({ message: "Pet not found" });
        }

        return res.status(200).json({
            message: "Pet profile retrieved successfully",
            pet,
        });
    } catch (error) {
        console.error("Error fetching pet profile:", error);
        return res.status(500).json({ message: "Error fetching pet profile", error: error.message });
    }
};

// Add Photo to Pet Profile
const addPetPhoto = async (req, res) => {
    const petId = req.params.id;

    try {
        const pet = await Pet.findById(petId);

        if (!pet) {
            return res.status(404).json({ message: "Pet not found" });
        }

        // Check if the authenticated user is the owner of the pet
        if (pet.ownerId.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: "You are not authorized to add photos for this pet" });
        }

        // Save the photo path in the database
        const photoPath = `/uploads/photos/${req.file.filename}`;
        pet.photos.push(photoPath);
        await pet.save();

        return res.status(200).json({
            message: "Photo uploaded successfully",
            photoPath,
        });
    } catch (error) {
        console.error("Error adding photo:", error);
        return res.status(500).json({ message: "Error adding photo", error: error.message });
    }
};


// Remove Photo from Pet Profile
const removePetPhoto = async (req, res) => {
    const { id } = req.params; // Pet ID from URL parameters
    const { photo } = req.body;

    try {
        const pet = await Pet.findById(id);
        if (!pet) {
            return res.status(404).json({ message: "Pet not found" });
        }

        if (pet.ownerId.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: "You are not authorized to modify this pet profile" });
        }

        // Remove photo
        pet.photos = pet.photos.filter((p) => p !== photo);
        const updatedPet = await pet.save();

        return res.status(200).json({
            message: "Photo removed successfully",
            pet: updatedPet,
        });
    } catch (error) {
        console.error("Error removing photo:", error);
        return res.status(500).json({ message: "Error removing photo", error: error.message });
    }
};

// Get Pet Photos
const getPetPhotos = async (req, res) => {
    const { id } = req.params; // Pet ID from URL parameters

    try {
        const pet = await Pet.findById(id);

        if (!pet) {
            return res.status(404).json({ message: "Pet not found" });
        }

        return res.status(200).json({
            message: "Pet photos retrieved successfully",
            photos: pet.photos,
        });
    } catch (error) {
        console.error("Error fetching pet photos:", error);
        return res.status(500).json({ message: "Error fetching pet photos", error: error.message });
    }
};

module.exports = { createPetProfile, updatePetProfile, deletePetProfile, getPetProfile, addPetPhoto, removePetPhoto , getPetPhotos };
