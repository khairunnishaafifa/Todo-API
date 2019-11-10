var mongoose = require('mongoose')

var todo = require('../../models/todo')
    , user = require('../../models/user')

var { successResponse, errorResponse } = require('../../helpers/response')

exports.addTodo = (req, res) => {

    user.findOne({ _id: userId })
        .populate('listTodo')
        .exec(function (err) {

            var newTodo = new todo({
                _id: new mongoose.Types.ObjectId(),
                title: req.body.title,
                author: userId,
                notes: req.body.notes,
                dueDate: req.body.dueDate,
                priority: req.body.priority,
                status: req.body.status
            })

            newTodo.save(function (err) {
                if (err) {
                    return res.status(422).json(
                        errorResponse('Request is not quite right', err.message, 422)
                    )
                }

                user.updateOne(
                    { _id: userId },
                    { $push: { listTodo: newTodo._id } }
                ).exec()
                    .then(() => {
                        return res.status(201).json(
                            successResponse('Todo successfully saved', newTodo.title)
                        )
                    })
            })
        })
}

exports.getAllTodo = (req, res) => {

    todo.find({ author: userId })
        .select('-__v')
        .sort({ created: -1 })
        .populate({ path: 'author', select: 'name username email -_id' })
        .exec()
        .then(result => {
            return res.status(200).json(
                successResponse('Done', result)
            )
        })
}

exports.getTodoByTitle = async (req, res) => {

    var todoExist = await todo.findOne({
        title: req.params.title,
        author: userId
    })

    if (!todoExist) {
        return res.status(404).json(
            errorResponse('Todo not found', '', 404)
        )
    }

    todo.find({
        title: req.params.title,
        author: userId
    })
        .sort({ created: -1 })
        .select('-author -_id -__v')
        .then(result => {
            return res.status(200).json(
                successResponse('Todo found', result)
            )
        })
}

exports.getTodoByStatus = async (req, res) => {

    var todoExist = await todo.findOne({
        status: req.params.status,
        author: userId
    })

    if (!todoExist) {
        return res.status(404).json(
            errorResponse('Todo not found', '', 404)
        )
    }

    todo.find({
        status: req.params.status,
        author: userId
    })
        .sort({ created: -1 })
        .select('-author -_id -__v')
        .then(result => {
            return res.status(200).json(
                successResponse('Todo found', result)
            )
        })
}

exports.updateTodo = async (req, res) => {

    todo.findOneAndUpdate(
        { _id: req.params.id },
        { $set: req.body },
        { 'new': true, runValidators: true, context: 'query' })
        .exec()
        .then(result => {
            return res.status(200).json(
                successResponse('Todo updated successfully',
                    res = {
                        title: result.title,
                        status: result.status
                    })
            )
        })
        .catch(err => {
            return res.status(422).json(
                errorResponse('Request is not quite right', err.message, 422)
            )
        })
}

exports.deleteTodo = (req, res) => {

    todo.findOne(
        { author: userId, _id: req.params.id },
    )
        .exec(function (err, todos) {

            todo.deleteOne(
                { _id: req.params.id },
                { new: true }
            ).exec(function (err, todos) {

                    user.updateOne(
                        { _id: userId },
                        { $pull: { listTodo: req.params.id } }
                    )
                        .exec()
                        .then(() => {
                            return res.status(200).json(
                                successResponse('Todo deleted successfully')
                            )
                        })
                })
        })
}