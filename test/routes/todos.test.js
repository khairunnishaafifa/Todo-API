var mongoose = require('mongoose')
    , chaiHttp = require('chai-http')
    , chai = require('chai')

var server = require('../../app')
    , todo = require('../../models/todo')

var expect = chai.expect
chai.use(chaiHttp)

let token
    , todoId
    , title = 'Glints Academy'
    , status = 0
    , fakeToken = 'djbdjfbwjbfwjfb'

describe('Add Todo', function () {

    before(done => {
        chai.request(server)
            .post('/users')
            .send({
                username: 'nasha',
                firstName: 'Nasha',
                email: 'nasha@gmail.com',
                password: 'nasha1898'
            })
            .end(function (err, res) {
                todo.deleteMany({},
                    { new: true }
                ).exec(() => {
                    done()
                })
            })
    })


    beforeEach(done => {
        chai.request(server)
            .post('/users/login')
            .send({
                username: 'nasha',
                password: 'nasha1898'
            })
            .end(function (err, res) {
                token = res.header.authorization
                done()
            })
    })

    it("add todo should show OK", function (done) {
        chai.request(server)
            .post('/todos')
            .send({
                title: 'Glints Academy',
                notes: 'Todo Apps',
                status: '0'
            })
            .set('authorization', token)
            .end(function (err, res) {
                expect(res).to.have.status(201)
                expect(res).to.be.an('object')
                done()
            })
    })

    it("add todo with invalid token show FAILED", function (done) {
        chai.request(server)
            .post('/todos')
            .send({
                title: 'Glints Academy',
                notes: 'Todo Apps',
                status: 0
            })
            .set('authorization', `Bearer ${fakeToken}`)
            .end(function (err, res) {
                expect(res).to.have.status(403)
                expect(res).to.be.an('object')
                done()
            })
    })

    it("add todo without title should show FAILED", function (done) {
        chai.request(server)
            .post('/todos')
            .send({
                notes: 'Todo Apps',
                status: 0
            })
            .set('authorization', token)
            .end(function (err, res) {
                expect(res).to.have.status(422)
                expect(res).to.be.an('object')
                done()
            })
    })
})

describe('Get Todo', function () {

    it("it should show all todo", function (done) {
        chai.request(server)
            .get('/todos')
            .set('authorization', token)
            .end(function (err, res) {
                todoId = res.body.result[0]._id
                expect(res).to.have.status(200)
                expect(res).to.be.an('object')
                done()
            })
    })

    it("show all todo with invalid token should show FAILED", function (done) {
        chai.request(server)
            .get('/todos')
            .set('authorization', `Bearer ${fakeToken}`)
            .end(function (err, res) {
                expect(res).to.have.status(403)
                expect(res).to.be.an('object')
                done()
            })
    })

    it("it should show todo by title", function (done) {
        chai.request(server)
            .get(`/todos/title/${title}`)
            .set('authorization', token)
            .end(function (err, res) {
                expect(res).to.have.status(200)
                expect(res).to.be.an('object')
                done()
            })
    })

    it("show unexist todo should show FAILED", function (done) {
        chai.request(server)
            .get(`/todos/title/glints`)
            .set('authorization', token)
            .end(function (err, res) {
                expect(res).to.have.status(404)
                expect(res).to.be.an('object')
                done()
            })
    })

    it("show todo with invalid token should show FAILED", function (done) {
        chai.request(server)
            .get(`/todos/title/${title}`)
            .set('authorization', `Bearer ${fakeToken}`)
            .end(function (err, res) {
                expect(res).to.have.status(403)
                expect(res).to.be.an('object')
                done()
            })
    })

    it("it should show todo by status", function (done) {
        chai.request(server)
            .get(`/todos/status/${status}`)
            .set('authorization', token)
            .end(function (err, res) {
                expect(res).to.have.status(200)
                expect(res).to.be.an('object')
                done()
            })
    })

    it("show todo by status if unexist should show FAILED", function (done) {
        chai.request(server)
            .get(`/todos/status/1`)
            .set('authorization', token)
            .end(function (err, res) {
                expect(res).to.have.status(404)
                expect(res).to.be.an('object')
                done()
            })
    })

    it("show todo by status with invalid token should show FAILED", function (done) {
        chai.request(server)
            .get(`/todos/status/${title}`)
            .set('authorization', `Bearer ${fakeToken}`)
            .end(function (err, res) {
                expect(res).to.have.status(403)
                expect(res).to.be.an('object')
                done()
            })
    })
})

describe('Update Todo', function () {

    it("it should update own todo", function (done) {
        chai.request(server)
            .put(`/todos/${todoId}`)
            .send({
                title: 'Glints BE'
            })
            .set('authorization', token)
            .end(function (err, res) {
                expect(res).to.have.status(200)
                expect(res).to.be.an('object')
                done()
            })
    })

    it("update todo with invalid token should show FAILED", function (done) {
        chai.request(server)
            .put(`/todos/${todoId}`)
            .send({
                title: 'Glints BE'
            })
            .set('authorization', `Bearer ${fakeToken}`)
            .end(function (err, res) {
                expect(res).to.have.status(403)
                expect(res).to.be.an('object')
                done()
            })
    })

    it("update todo with invalid format priority should show FAILED", function (done) {
        chai.request(server)
            .put(`/todos/${todoId}`)
            .send({
                priority: 'Important'
            })
            .set('authorization', token)
            .end(function (err, res) {
                expect(res).to.have.status(422)
                expect(res).to.be.an('object')
                done()
            })
    })

    it("update todo with invalid format status should show FAILED", function (done) {
        chai.request(server)
            .put(`/todos/${todoId}`)
            .send({
                status: '123'
            })
            .set('authorization', token)
            .end(function (err, res) {
                expect(res).to.have.status(422)
                expect(res).to.be.an('object')
                done()
            })
    })
})

describe('Delete Todo', function () {

    it("it should delete own todo", function (done) {
        chai.request(server)
            .delete(`/todos/${todoId}`)
            .set('authorization', token)
            .end(function (err, res) {
                expect(res).to.have.status(200)
                expect(res).to.be.an('object')
                done()
            })
    })

    it("delete todo without invalid token should show FAILED", function (done) {
        chai.request(server)
            .delete(`/todos/${todoId}`)
            .set('authorization', `Bearer ${fakeToken}`)
            .end(function (err, res) {
                expect(res).to.have.status(403)
                expect(res).to.be.an('object')
                done()
            })
    })
})