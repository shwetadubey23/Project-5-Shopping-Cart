const express = require('express')
const router = express.Router()
const userController = require('../controllers/userController')




router.post('/login', userController.userLogin)
router.get('/user/:userId/profile',userController.getUserById)







module.exports = router