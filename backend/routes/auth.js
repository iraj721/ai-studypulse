const express = require('express');
const router = express.Router();
const { 
  register, 
  login, 
  getMe, 
  verifyEmail, 
  resendVerificationCode,
  forgotPassword,
  resetPassword
} = require('../controllers/authController');
const authMiddleware = require('../middleware/authMiddleware');

router.post('/register', register);
router.post('/verify-email', verifyEmail);
router.post('/resend-verification', resendVerificationCode);
router.post('/login', login);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);
router.get('/me', authMiddleware, getMe);

module.exports = router;