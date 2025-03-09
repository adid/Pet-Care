// routes/adoptionRoutes.js
const express = require("express");
const router = express.Router();
const { jwtVerification } = require('../middlewares/authMiddleware');
const { postAdoptionRequest, getAvailablePets, commentOnAdoption, requestAdoption, viewAdoptionRequests, getCommentsForAdoption, scheduleMeeting ,updateAdoptionStatus } = require("../controllers/adoptionController");

// Post an adoption request
router.post("/post", jwtVerification, postAdoptionRequest);

// Get available pets for adoption
router.get("/pets", jwtVerification, getAvailablePets);

// Comment on an adoption request
router.post("/:adoptionId/comment", jwtVerification, commentOnAdoption);

// Get all comments on an adoption request
router.get("/:adoptionId/comments", jwtVerification, getCommentsForAdoption);

// Request for adoption
router.post("/:adoptionId/request", jwtVerification, requestAdoption);

// View adoption requests
router.get("/:adoptionId/requests", jwtVerification, viewAdoptionRequests);

// Schedule Meeting
router.post("/schedule-meeting/:requestId", jwtVerification, scheduleMeeting);

// Update Adoption Status
router.post("/:adoptionId/status-confirmed", jwtVerification, updateAdoptionStatus);

module.exports = router;