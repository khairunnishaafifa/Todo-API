var mongoose = require('mongoose')
    , uniqueValidator = require('mongoose-unique-validator')
    , bcrypt = require('bcryptjs'); 
const saltRounds = 10;

var schema = mongoose.Schema

var userSchema = new schema(
  {
    _id: mongoose.Schema.Types.ObjectId,
    username: {
      type: String,
      unique: [true, "Not avalaible"],
      required: [true, "It's required"],
      lowercase: true,
      validate: [
        function(username) {
          return /^\S*$/.test(username)
        },
        'Username cannot contain spaces'
      ]
    },
    name: {
      firstName: {
        type: String,
        required: [true, "Why you don't have a name?"]
      },
      lastName: String
    },
    gender: {
      type: String,
      enum: ['Male', 'Female']
    },
    email: {
      type: String,
      required: [true, "It's required"],
      unique: true,
      lowercase: true,
      validate: [
        function (email) {
            return /^[a-zA-Z0-9.!#$%&’*+\/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/.test(email)
        },
        'Email should contain @mail.com'
      ]
    },
    password: {
      type: String,
      required: true,
      minlength: [8, "Password must contain at least 8 characters"]
    },
    listTodo: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'todo'
    }],
    profPict: String
  },
  {
    collection: 'users'
  }
)

userSchema.pre('save', function (next) {
  this.password = bcrypt.hashSync(this.password, saltRounds);
  next()
})

userSchema.plugin(uniqueValidator, { message: 'Error, expected {PATH} to be unique.' })
var user = mongoose.model('user', userSchema);

module.exports = user