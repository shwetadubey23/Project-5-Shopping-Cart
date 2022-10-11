const express = require('express')
const router = express.Router()
const userController = require('../controllers/userController')


router.post('/register', userController.createUser)

// router.post('/login', userLogin)





router.all("/*", function(req, res) {
    res.status(404).send({ msg: "No such Api found" })
})


module.exports = router