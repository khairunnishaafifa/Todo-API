var express = require('express')
    , router = express.Router()
    , cloudinaryConfig= require('../../config/cloudinaryConfig')

var usersCtrl = require('../../controllers/v1/usersController')
    , auth = require('../../middleware/auth')
    , upload = require('../../middleware/multer')

router.use('*', cloudinaryConfig)

router.route('/')
    .post(usersCtrl.registerUser)
    .get(usersCtrl.getAllUser)

router.route('/profile')
    .get(auth.isAuthenticated, usersCtrl.getProfile)
    .put(auth.isAuthenticated, usersCtrl.updateProfile)
    .delete(auth.isAuthenticated, usersCtrl.deleteUser)

router.route('/:username')
    .get(usersCtrl.getUser)

router.route('/profile/upload')
    .put(auth.isAuthenticated, upload.single('profPict'), usersCtrl.updateProfPict)

router.route('/login')
    .post(usersCtrl.authentication)

router.route('/reset-password')
    .post(usersCtrl.resetPassword)

router.route('/reset/:token')
    .put(usersCtrl.changePassword)

module.exports = router