var mongoose = require('mongoose')

var schema = mongoose.Schema

var tokenSchema = new schema(
    {
        _userId: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: 'User'
        },
        token: {
            type: String,
            required: true
        }
    }
)

var token = mongoose.model('token', tokenSchema)

module.exports = token