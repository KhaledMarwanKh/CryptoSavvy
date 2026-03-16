const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const authUser = require('../middlewares/authUser');
const upload = require('../middlewares/multer');
const {
    signupValidator,
    loginValidator,
    forgetPasswordValidator,
    resetPasswordValidator,
} = require('../middlewares/validator');

router.post('/register', upload.single('image'), signupValidator, userController.signup);
router.post('/login', loginValidator, userController.login);
router.post('/logout', authUser.authUser, userController.logout);
router.get('/get-profile', authUser.authUser, userController.getProfile);
router.post('/update-Profile', upload.single('image'), authUser.authUser, userController.updateProfile);
router.post('/forget-password', forgetPasswordValidator, authUser.forgetPassword);
router.post('/verify-resetcode', authUser.verifyResetCode);
router.patch('/resetPassword', resetPasswordValidator, authUser.resetPassword);
router.post('/verify-singnup', userController.successSingnUp);

module.exports = router;