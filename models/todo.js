var mongoose = require('mongoose');

var todoSchema = mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    title: {
        type: String,
        required: [true, "Title is required"]
    },
    author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user'
    },
    notes: String,
    dueDate: {
        type: Date,
        default: Date.now()
    },
    priority: {
        type: String,
        default: 'Low',
        enum: ['High', 'Medium', 'Low']
    },
    status: {
        type: Boolean,
        default: false
    }
})

var todo = mongoose.model('todo', todoSchema)

module.exports = todo