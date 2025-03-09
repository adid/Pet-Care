const PetAdoption = require("../models/PetAdoption");
const Pet = require("../models/Pet");
const User = require("../models/User");
const AdoptionRequest = require("../models/AdoptionRequest");

const postAdoptionRequest = async (req, res) => {
    const { petId, adoptionDescription, adoptionType, returnDate } = req.body;
    const user = await User.findById(req.user._id);
    
    try {
        if (!user.phoneVerified) return res.status(403).json({ message: "Please Verify your Phone First" });
        
        const pet = await Pet.findById(petId);
        if (!pet || pet.ownerId.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: "You can only post adoption requests for your own pets" });
        }

        const adoption = new PetAdoption({ 
            PetID: petId, 
            AdoptionDescription: adoptionDescription, 
            adoptionType, 
            ReturnDate: adoptionType === 'temporary' ? returnDate : null});

        await adoption.save();

        // Update pet status to "Available"
        pet.status = "Available";
        await pet.save();

        res.status(201).json({ message: "Adoption request posted", adoption });
    } catch (error) {
        res.status(500).json({ message: "Error posting adoption request", error: error.message });
    }
};

const getAvailablePets = async (req, res) => {
    try {
        const pets = await Pet.find({ status: "Available" })
            .populate("ownerId", "name email phone") // Fetch owner details
            .lean();

        // Fetch adoption details for each pet
        const petIds = pets.map(pet => pet._id);
        const adoptionDetails = await PetAdoption.find({ PetID: { $in: petIds } })
            .select("AdoptionDescription adoptionType ReturnDate PetID")
            .lean();

        // Merge adoption details with pet data and structure response correctly
        const petsWithAdoptionInfo = pets.map(pet => {
            const adoptionInfo = adoptionDetails.find(adopt => adopt.PetID.toString() === pet._id.toString());

            return {
                _id: pet._id,
                name: pet.name,
                species: pet.species,
                dateOfBirth: pet.dateOfBirth,
                breed: pet.breed,
                color: pet.color,
                description: pet.description,
                status: pet.status,
                photos: pet.photos,
                healthRecords: pet.healthRecords,
                traits: pet.traits,
                createdAt: pet.createdAt,
                adoptionDescription: adoptionInfo ? adoptionInfo.AdoptionDescription : null,
                adoptionType: adoptionInfo ? adoptionInfo.adoptionType : null,
                returnDate: adoptionInfo ? adoptionInfo.ReturnDate : null,
                postedBy: pet.ownerId ? {
                    id: pet.ownerId._id,
                    name: pet.ownerId.name,
                    email: pet.ownerId.email,
                    phone: pet.ownerId.phone
                } : null
            };
        });

        res.json(petsWithAdoptionInfo);
    } catch (error) {
        res.status(500).json({ message: "Error fetching pets", error: error.message });
    }
};

const commentOnAdoption = async (req, res) => {
    try {
        const { comment, parentId } = req.body;
        const userId = req.user._id;
        const { adoptionId } = req.params;

        // Fetch the adoption post
        const adoption = await PetAdoption.findById(adoptionId);
        if (!adoption) return res.status(404).json({ message: "Adoption post not found" });

        // Check if replying to a valid parent comment
        if (parentId) {
            const parentComment = adoption.comments.find(c => c._id.toString() === parentId);
            if (!parentComment) return res.status(404).json({ message: "Parent comment not found" });
        }

        // Add the new comment
        adoption.comments.push({ userId, comment, parentId });
        await adoption.save();

        res.status(201).json({ message: "Comment added", comment, commentId: adoption.comments[adoption.comments.length - 1]._id });
    } catch (error) {
        res.status(500).json({ message: "Error adding comment", error: error.message });
    }
};

const getCommentsForAdoption = async (req, res) => {
    try {
        const { adoptionId } = req.params;

        const adoption = await PetAdoption.findById(adoptionId).lean();
        if (!adoption) return res.status(404).json({ message: "Adoption post not found" });

        // Convert flat comments into a nested structure
        const commentMap = {};
        adoption.comments.forEach(comment => (commentMap[comment._id] = { ...comment, replies: [] }));

        const nestedComments = [];
        adoption.comments.forEach(comment => {
            if (comment.parentId) {
                commentMap[comment.parentId]?.replies.push(commentMap[comment._id]);
            } else {
                nestedComments.push(commentMap[comment._id]);
            }
        });

        res.json(nestedComments);
    } catch (error) {
        res.status(500).json({ message: "Error fetching comments", error: error.message });
    }
};


const requestAdoption = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        if (!user.phoneVerified) return res.status(403).json({ message: "Phone number not verified" });

        const adoption = await PetAdoption.findById(req.params.adoptionId);
        if (!adoption) return res.status(404).json({ message: "Adoption post not found" });

        const request = new AdoptionRequest({ adoptionId: adoption._id, requesterId: req.user._id });
        await request.save();

        res.status(201).json({ message: "Adoption request sent" });
    } catch (error) {
        res.status(500).json({ message: "Error requesting adoption", error: error.message });
    }
};

const viewAdoptionRequests = async (req, res) => {
    try {
        const { adoptionId } = req.params;
        const userId = req.user._id; // Logged-in user (owner)

        // Check if the adoption post exists
        const adoption = await PetAdoption.findById(adoptionId);
        if (!adoption) return res.status(404).json({ message: "Adoption post not found" });

        // Check if the logged-in user is the owner of the pet
        const pet = await Pet.findById(adoption.PetID);
        if (!pet || pet.ownerId.toString() !== userId.toString()) {
            return res.status(403).json({ message: "You are not authorized to view these requests" });
        }

        // Fetch all requests for this adoption post
        const requests = await AdoptionRequest.find({ adoptionId })
            .populate("requesterId", "name email phone");

        res.json(requests);
    } catch (error) {
        res.status(500).json({ message: "Error fetching adoption requests", error: error.message });
    }
};


const scheduleMeeting = async (req, res) => {
    try {
        const { meetingDate, notes } = req.body;
        const { requestId } = req.params;
        const userId = req.user._id;

        // Check if the adoption request exists
        const adoptionRequest = await AdoptionRequest.findById(requestId).populate("adoptionId");
        if (!adoptionRequest) return res.status(404).json({ message: "Adoption request not found" });

        // Check if the user is the owner of the pet
        const pet = await Pet.findById(adoptionRequest.adoptionId.PetID);
        if (!pet || pet.ownerId.toString() !== userId.toString()) {
            return res.status(403).json({ message: "You are not authorized to schedule a meeting for this pet" });
        }

        // Validate meeting date
        if (!meetingDate) return res.status(400).json({ message: "Meeting date is required" });

        // Update adoption request
        adoptionRequest.meetingDate = meetingDate;
        adoptionRequest.notes = notes || "";
        adoptionRequest.status = "meet scheduled";
        await adoptionRequest.save();

        res.status(200).json({ message: "Meeting scheduled successfully", adoptionRequest });
    } catch (error) {
        res.status(500).json({ message: "Error scheduling meeting", error: error.message });
    }
};

const updateAdoptionStatus = async (req, res) => {
    try {
        const { requestId } = req.body;
        const { adoptionId } = req.params;

        // Fetch adoption post & adoption request
        const adoption = await PetAdoption.findById(adoptionId);
        const request = await AdoptionRequest.findById(requestId);
        if (!adoption || !request) return res.status(404).json({ message: "Adoption post or request not found" });

        // Fetch pet and adopter
        const pet = await Pet.findById(adoption.PetID);
        const adopter = await User.findById(request.requesterId);
        if (!pet || !adopter) return res.status(404).json({ message: "Pet or adopter not found" });

        // Update pet status
        pet.status = "Adopted";
        pet.ownerId = adopter._id;
        await pet.save();

        // Remove adoption post & adoption requests
        // await AdoptionRequest.deleteMany({ adoptionId });
        // await PetAdoption.findByIdAndDelete(adoptionId);

        res.json({ message: "Adoption confirmed successfully" });
    } catch (error) {
        res.status(500).json({ message: "Error updating adoption status", error: error.message });
    }
};

module.exports = { postAdoptionRequest, getAvailablePets, commentOnAdoption, requestAdoption, viewAdoptionRequests, scheduleMeeting, getCommentsForAdoption, updateAdoptionStatus };