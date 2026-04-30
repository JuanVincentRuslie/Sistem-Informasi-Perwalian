const { Router } = require('express');
const { authenticate } = require('../../middleware/authenticate');
const authController = require('./auth.controller');

const router = Router();

router.post('/google', authController.googleLogin);
router.get('/me', authenticate, authController.getMe);

module.exports = router;
