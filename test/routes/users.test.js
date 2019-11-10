var mongoose = require('mongoose')
    , chaiHttp = require('chai-http')
    , chai = require('chai')

var server = require('../../app')
    , user = require('../../models/user')

var expect = chai.expect
chai.use(chaiHttp)

let token
    , username
    , fakeToken = 'djbdjfbwjbfwjfb'
    , resetToken

describe('Register User', function () {

    before(done => {
        user.deleteMany({},
            { new: true }
        ).exec(() => {
            done()
        })
    })

    it("add user should show OK", function (done) {
        chai.request(server)
            .post('/users')
            .send({
                username: 'khairunnishafifa',
                firstName: 'Khairunnisha',
                email: 'khairunnishaliyyafifa@gmail.com',
                password: 'nasha1898'
            })
            .end(function (err, res) {
                expect(res).to.have.status(201)
                expect(res).to.be.an('object')
                done()
            })
    })

    it("add user with exist email should show FAILED", function (done) {
        chai.request(server)
            .post('/users')
            .send({
                username: 'khairunnishaafifa',
                firstName: 'Khairunnisha',
                email: 'khairunnishaliyyafifa@gmail.com',
                password: 'nasha1898'
            })
            .end(function (err, res) {
                expect(res).to.have.status(409)
                expect(res).to.be.an('object')
                done()
            })
    })

    it("add user with exist username should show FAILED", function (done) {
        chai.request(server)
            .post('/users')
            .send({
                username: 'khairunnishafifa',
                firstName: 'Khairunnisha',
                email: 'khairunnisha@gmail.com',
                password: 'nasha1898'
            })
            .end(function (err, res) {
                expect(res).to.have.status(422)
                expect(res).to.be.an('object')
                done()
            })
    })

    it("add user with password less than 8 characters should show FAILED", function (done) {
        chai.request(server)
            .post('/users')
            .send({
                username: 'khairunnisha',
                firstName: 'Khairunnisha',
                email: 'khairunnisha@gmail.com',
                password: 'nas18'
            })
            .end(function (err, res) {
                expect(res).to.have.status(422)
                expect(res).to.be.an('object')
                done()
            })
    })

    it("add user with invalid format email should show FAILED", function (done) {
        chai.request(server)
            .post('/users')
            .send({
                username: 'khairunnishaa',
                firstName: 'Khairunnisha',
                email: 'khairunnisha',
                password: 'nasha1898'
            })
            .end(function (err, res) {
                expect(res).to.have.status(422)
                expect(res).to.be.an('object')
                done()
            })
    })

    it("add user with invalid format gender should show FAILED", function (done) {
        chai.request(server)
            .post('/users')
            .send({
                username: 'khairunnishaa',
                firstName: 'Khairunnisha',
                email: 'khairunnisha@gmail.com',
                password: 'nasha1898',
                gender: 'Women'
            })
            .end(function (err, res) {
                expect(res).to.have.status(422)
                expect(res).to.be.an('object')
                done()
            })
    })
})

describe('Authentication User', function () {

    it("login should show OK", function (done) {
        chai.request(server)
            .post('/users/login')
            .send({
                username: 'khairunnishafifa',
                password: 'nasha1898'
            })
            .end(function (err, res) {
                token = res.header.authorization
                expect(res).to.have.status(200)
                expect(res).to.be.an('object')
                done()
            })
    })

    it("login with unregistered username should show FAILED", function (done) {
        chai.request(server)
            .post('/users/login')
            .send({
                username: 'khairunnishaafifa',
                password: 'nasha1898'
            })
            .end(function (err, res) {
                expect(res).to.have.status(404)
                expect(res).to.be.an('object')
                done()
            })
    })

    it("login with wrong password should show FAILED", function (done) {
        chai.request(server)
            .post('/users/login')
            .send({
                username: 'khairunnishafifa',
                password: 'nasha18989'
            })
            .end(function (err, res) {
                expect(res).to.have.status(401)
                expect(res).to.be.an('object')
                done()
            })
    })

    it("login with no password should show FAILED", function (done) {
        chai.request(server)
            .post('/users/login')
            .send({
                username: 'khairunnishafifa'
            })
            .end(function (err, res) {
                expect(res).to.have.status(500)
                expect(res).to.be.an('object')
                done()
            })
    })
})

describe('Get User', function () {

    it("it should show all user", function (done) {
        chai.request(server)
            .get('/users')
            .end(function (err, res) {
                username = res.body.result[0].username
                expect(res).to.have.status(200)
                expect(res).to.be.an('object')
                done()
            })
    })

    it("it should show own profile", function (done) {
        chai.request(server)
            .get('/users/profile')
            .set('authorization', token)
            .end(function (err, res) {
                expect(res).to.have.status(200)
                expect(res).to.be.an('object')
                done()
            })
    })

    it("show own profile with invalid token should show FAILED", function (done) {
        chai.request(server)
            .get('/users/profile')
            .set('authorization', fakeToken)
            .end(function (err, res) {
                expect(res).to.have.status(403)
                expect(res).to.be.an('object')
                done()
            })
    })

    it("it should show one user", function (done) {
        chai.request(server)
            .get(`/users/${username}`)
            .end(function (err, res) {
                expect(res).to.have.status(200)
                expect(res).to.be.an('object')
                done()
            })
    })

    it("show user with wrong username should show FAILED", function (done) {
        chai.request(server)
            .get('/users/nasha')
            .end(function (err, res) {
                expect(res).to.have.status(404)
                expect(res).to.be.an('object')
                done()
            })
    })

    
})

describe('Update User', function () {

    it("it should update own profile", function (done) {
        chai.request(server)
            .put('/users/profile')
            .send({
                email: 'khairunnishaliyyafifa@gmail.com'
            })
            .set('authorization', token)
            .end(function (err, res) {
                expect(res).to.have.status(200) 
                expect(res).to.be.an('object')
                done()
            })
    })

    it("update own profile with invalid format email should show FAILED", function (done) {
        chai.request(server)
            .put('/users/profile')
            .send({
                email: 'khairunnishaliyyafifa'
            })
            .set('authorization', token)
            .end(function (err, res) {
                expect(res).to.have.status(422) 
                expect(res).to.be.an('object')
                done()
            })
    })

    it("update own profile with invalid format gender should show FAILED", function (done) {
        chai.request(server)
            .put('/users/profile')
            .send({
                gender: 'Men'
            })
            .set('authorization', token)
            .end(function (err, res) {
                expect(res).to.have.status(422) 
                expect(res).to.be.an('object')
                done()
            })
    })

    it("update own profile with password less than 8 characters should show FAILED", function (done) {
        chai.request(server)
            .put('/users/profile')
            .send({
                password: 'nasha'
            })
            .set('authorization', token)
            .end(function (err, res) {
                expect(res).to.have.status(422) 
                expect(res).to.be.an('object')
                done()
            })
    })

    it("update profile with invalid token should show FAILED", function (done) {
        chai.request(server)
            .put('/users/profile')
            .send({
                email: 'khairunnisha.afifa@gmail.com'
            })
            .set('authorization', fakeToken)
            .end(function (err, res) {
                expect(res).to.have.status(403)
                expect(res).to.be.an('object')
                done()
            })
    })

    it("update profile picture not a file should show FAILED", function (done) {
        chai.request(server)
            .put('/users/profile/upload')
            .set('authorization', token)
            .end(function (err, res) {
                expect(res).to.have.status(415)
                expect(res).to.be.an('object')
                done()
            })
    })

    it("update profile picture with invalid token should show FAILED", function (done) {
        chai.request(server)
            .put('/users/profile/upload')
            .set('authorization', fakeToken)
            .end(function (err, res) {
                expect(res).to.have.status(403)
                expect(res).to.be.an('object')
                done()
            })
    })
})

describe('Reset Password', function () {

    it("it should send verification for reset password to email", function (done) {
        chai.request(server)
            .post('/users/reset-password')
            .send({
                email: 'khairunnishaliyyafifa@gmail.com'
            })
            .end(function (err, res) {
                resetToken = res.body.token
                console.log(resetToken)
                expect(res).to.have.status(200) 
                expect(res).to.be.an('object')
                done()
            })
    })

    it("send verification for reset password to unexist email should show FAILED", function (done) {
        chai.request(server)
            .post('/users/reset-password')
            .send({
                email: 'khairunnishafifa@gmail.com'
            })
            .end(function (err, res) {
                expect(res).to.have.status(404) 
                expect(res).to.be.an('object')
                done()
            })
    })

    it("change password with invalid token should show FAILED", function (done) {
        chai.request(server)
            .put(`/users/reset/${fakeToken}`)
            .send({
                password: '1898nasha'
            })
            .end(function (err, res) {
                expect(res).to.have.status(401) 
                expect(res).to.be.an('object')
                done()
            })
    })

    it("it should change password", function (done) {
        chai.request(server)
            .put(`/users/reset/${resetToken}`)
            .send({
                password: '1898nasha'
            })
            .end(function (err, res) {
                expect(res).to.have.status(200)
                expect(res).to.be.an('object')
                done()
            })
    })

    it("change password with password less than 8 should show FAILED", function (done) {
        chai.request(server)
            .put(`/users/reset/${resetToken}`)
            .send({
                password: '1898'
            })
            .end(function (err, res) {
                expect(res).to.have.status(422)
                expect(res).to.be.an('object')
                done()
            })
    })

    it("change password with used token should show FAILED", function (done) {
        chai.request(server)
            .put(`/users/reset/${resetToken}`)
            .send({
                password: '1898nasha'
            })
            .end(function (err, res) {
                expect(res).to.have.status(401)
                expect(res).to.be.an('object')
                done()
            })
    })
})

describe('Delete User', function () {

    after(function () {
        mongoose.connection.close();
    })

    it("it should delete own profile", function (done) {
        chai.request(server)
            .delete('/users/profile')
            .set('authorization', token)
            .end(function (err, res) {
                expect(res).to.have.status(200)
                expect(res).to.be.an('object')
                done()
            })
    })

    it("delete profile with invalid token should show FAILED", function (done) {
        chai.request(server)
            .delete('/users/profile')
            .set('authorization', fakeToken)
            .end(function (err, res) {
                expect(res).to.have.status(403)
                expect(res).to.be.an('object')
                done()
            })
    })
})