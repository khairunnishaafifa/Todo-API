var express = require('express')
    , router = express.Router()

var todoCtrl = require('../../controllers/v1/todosController')

router.route('/')
    .get(todoCtrl.getAllTodo)
    .post(todoCtrl.addTodo)

router.route('/status/:status')
    .get(todoCtrl.getTodoByStatus)

router.route('/title/:title')
    .get(todoCtrl.getTodoByTitle)

router.route('/:id')
    .put(todoCtrl.updateTodo)
    .delete(todoCtrl.deleteTodo)

module.exports = router