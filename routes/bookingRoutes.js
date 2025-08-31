const express = require("express");
const {
  createBooking,
  getBookings,
} = require("../controllers/bookingController");

const router = express.Router();

router.post("/", createBooking); // create a new booking
router.get("/", getBookings); // list all bookings (admin view)
router.get("/my", async (req, res) => {
  try {
    // Assuming you have user authentication middleware
    const userId = req.user._id;

    const bookings = await Booking.find({ userId })
      .populate("serviceId", "name category location")
      .sort({ createdAt: -1 });

    res.json({ bookings });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch bookings" });
  }
});

module.exports = router;
