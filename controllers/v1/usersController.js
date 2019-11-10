var mongoose = require('mongoose')
    , bcrypt = require('bcryptjs')
    , jwt = require('jsonwebtoken')
    , multer = require('multer')
    , cloudinary = require('cloudinary')
    , datauri = require('datauri')
    , validator = require('validator')

var user = require('../../models/user')
    , todo = require('../../models/todo')
    , Token = require('../../models/token')
    , { successResponse, errorResponse } = require('../../helpers/response')
    , { sendVerification } = require('../../services/nodemailer')

exports.registerUser = async (req, res) => {
    var newUser = new user({
        _id: new mongoose.Types.ObjectId(),
        username: req.body.username,
        name: {
            firstName: req.body.firstName,
            lastName: req.body.lastName
        },
        gender: req.body.gender,
        email: req.body.email,
        password: req.body.password,
        listTodo: []
    })

    var userExist = await user.findOne({
        email: req.body.email
    })

    if (userExist) {
        return res.status(409).json({
            message: 'User already registered'
        })
    }

    newUser.save()
        .then(result => {
            return res.status(201).json(
                successResponse('User successfully saved',
                    res = {
                        name: `${result.name.firstName} ${result.name.lastName}`,
                        username: result.username,
                        email: result.email,
                    })
            )
        })
        .catch(err => {
            return res.status(422).json(
                errorResponse('Request is not quite right', err.message, 422)
            )
        })
}

exports.authentication = async (req, res, next) => {
    var userExist = await user.findOne({
        username: req.body.username
    })

    if (!userExist) {
        return res.status(404).json({
            message: 'User not registered'
        })
    }

    bcrypt.compare(req.body.password, userExist.password)
        .then((result) => {

            if (result) {
                var token = jwt.sign(userExist.toJSON(), process.env.SECRET_KEY, {
                    algorithm: 'HS256',
                    expiresIn: "900000"
                })

                res.setHeader('Authorization', `Bearer ${token}`)

                return res.status(200).json(
                    successResponse('Login success', token)
                )
            } else {
                return res.status(401).json(
                    errorResponse('Password Incorrect')
                )
            }

        })
        .catch((err) => {
            next(err)
        })
}

exports.getAllUser = (req, res) => {

    user.find()
        .sort({ created: -1 })
        .select('-password -__v -_id -listTodo')
        .exec()
        .then(result => {
            return res.status(200).json(
                successResponse('Done', result)
            )
        })
}

exports.getProfile = (req, res) => {

    user.findOne({ _id: userId })
        .select('-password -__v -_id')
        .populate('listTodo')
        .exec()
        .then(result => {
            return res.status(200).json(
                successResponse('Done', result)
            )
        })
}

exports.getUser = async (req, res) => {

    var userExist = await user.findOne({
        username: req.params.username
    })

    if (!userExist) {
        return res.status(404).json(
            errorResponse('User not found')
        )
    }

    user.findOne({ username: req.params.username })
        .select('-password -__v -_id -listTodo')
        .exec()
        .then(result => {
            return res.status(200).json(
                successResponse('Done', result)
            )
        })
}

exports.updateProfile = (req, res) => {

    user.findOneAndUpdate(
        { _id: userId },
        { $set: req.body },
        { 'new': true, runValidators: true, context: 'query' })
        .exec()
        .then(result => {
            return res.status(200).json(
                successResponse('User updated successfully',
                    res = {
                        name: `${result.name.firstName} ${result.name.lastName}`,
                        username: result.username,
                        email: result.email,
                    }
                ))
        })
        .catch(err => {
            return res.status(422).json(
                errorResponse('Request is not quite right', err.message, 422)
            )
        })
}

exports.updateProfPict = (req, res) => {

    const uploader = multer().single('image')
    var fileUp = req.file

    /* istanbul ignore else */

    if (!fileUp) {
        return res.status(415).send({
            success: false,
            message: 'No file received: Unsupported Media Type'
        })

    } else {

        const dUri = new datauri()

        uploader(req, res, err => {
            var file = dUri.format(`${req.file.originalname}-${Date.now()}`, req.file.buffer)

            cloudinary.uploader.upload(file.content)
                .then(data => {

                    user.findOneAndUpdate(
                        { _id: userId },
                        { $set: { profPict: data.secure_url } },
                        { new: true })
                        .exec()
                        .then(result => {
                            return res.status(200).json(
                                successResponse('User updated successfully',
                                    res = {
                                        name: `${result.name.firstName} ${result.name.lastName}`,
                                        username: result.username,
                                        email: result.email,
                                        profPict: result.profPict
                                    }
                                ))
                        })
                        .catch(err => {
                            return res.status(500).json(
                                errorResponse('An error occured', err, 500)
                            )
                        })


                })
                .catch(err => {
                    res.send(err);
                })
        })
    }
}

exports.deleteUser = (req, res) => {

    todo.deleteMany({
        author: userId
    }).exec()

    user.deleteOne({
        _id: userId
    })
        .exec()
        .then(() => {
            return res.status(200).json(
                successResponse('User deleted successfully')
            )
        })
}

exports.resetPassword = async (req, res, next) => {
    const email = req.body.email;

    const userExist = await user.findOne({ email })

    if (!userExist) {
        return res.status(404).json(errorResponse('Email not registered'))
    }

    const token = jwt.sign({ _id: userExist._id, email: email }, process.env.SECRET_KEY, {
        algorithm: 'HS256',
        expiresIn: "900000"
    })

    const data = {
        subject: 'Reset Password',
        name: userExist.name.firstName,
        token: token
    }
    
    var newToken = new Token({
        _userId: userExist._id,
        token: token
    })

    newToken.save()
        .then(() => {
            sendVerification(email, data, res)
        })
}

exports.changePassword =  async (req, res, next) => {
    const token = req.params.token
    const password = req.body.password
    
    try {
        const decoded = jwt.verify(token, process.env.SECRET_KEY)
        
        if (validator.isLength(password, {min: 8}) === false) {
            return res.status(422).json(
                errorResponse('Request is not quite right')
            )   
        }

        var tokenExist = await Token.findOne({ _userId: decoded._id, token: token })
    
        if (!tokenExist) {
            return res.status(401).json(
                errorResponse('Token already used, generate new one')
            )   
        }
    
        bcrypt.hash(password, 10, (err, hash) => {    
            user.findOneAndUpdate(
                    { _id: decoded._id },
                    { $set: { password: hash } },
                    { new: true })
                .exec()
                .then(() => {
                    Token.findOneAndDelete(
                        { _userId: decoded._id, token: token },
                    )
                    .exec()
                    .then(() => {
                        return res.status(200).json(
                            successResponse('Password updated successfully'))
                    })
                })
            
        })
    }

    catch(err) {
        return res.status(401).json(
            errorResponse('The access token provided is invalid.', err.message, 401)
        )
    }
}