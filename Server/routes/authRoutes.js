const express = require('express');
const router = express.Router();
const { signupUser, loginUser, getUserInfo, sendOtp, verifyOtp, loginUsingFacebook ,passport } = require('../controllers/authController');
const {jwtVerification, ensureAuthenticated} = require('../middlewares/authMiddleware');

router.post('/signup', signupUser);

router.post('/login', loginUser);

router.post('/otp/send', sendOtp);

router.post('/otp/verify', verifyOtp);

// Protected Routes
router.get("/userInfo", jwtVerification, getUserInfo);

// Initiates Facebook login
router.get('/facebook', passport.authenticate('facebook', { scope: ['email'] }));

// Callback URL after Facebook login
router.get('/facebook/callback', passport.authenticate('facebook', { failureRedirect: '/login' }), (req, res) => {
    res.redirect('/userInformation');
});

router.post('/facebookLogin', loginUsingFacebook);

module.exports = router;
