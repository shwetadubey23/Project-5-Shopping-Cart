const express = require('express')
const router = express.Router()
const userController = require('../controllers/userController')
const {authentication,authorisation} = require('../middleware/auth')
const productController = require('../controllers/productController')


router.post('/register', userController.createUser)

router.post('/login', userController.userLogin)

router.get('/user/:userId/profile', userController.getUserById)

router.put('/user/:userId/profile', authentication, authorisation, userController.updateuser)

//________________________________ Product APIs _____________________________________

router.post('/products', productController.createProduct)
router.get('/products/:productId', productController.getProductById)


router.all("/*", function(req, res) {
    res.status(404).send({ msg: "No such Api found" })
})


module.exports = router