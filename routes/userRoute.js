const express = require('express');
const router = express.Router();
const userController =require('../controllers/userController');
const authUser =require('../middlewares/authUser')
const upload =require('../middlewares/multer')

router.post('/register',upload.single('image'),userController.signup)
router.post('/login',userController.login)
router.post('/logout',authUser.authUser,userController.logout)
router.get('/get-profile',authUser.authUser,userController.getProfile)
router.post('/update-Profile',upload.single('image'),authUser.authUser,userController.updateProfile)
router.post('/forget-password',authUser.forgetPassword)
router.post('/verify-resetcode',authUser.verifyResetCode)
router.patch('/resetPassword',authUser.resetPassword)
router.post('/verify-singnup',userController.successSingnUp)

module.exports =router