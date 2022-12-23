const express = require('express')
const router = express.Router()
const userController = require('../controllers/userController')
const {authentication,authorisation} = require('../middleware/auth')
const productController = require('../controllers/productController')
const cartController = require('../controllers/cartController')
const orderController = require('../controllers/orderController')


//------------------------------------- User APIs----------------------------------

router.post('/register', userController.createUser)

router.post('/login', userController.userLogin)

router.get('/user/:userId/profile', authentication, userController.getUserById)

router.put('/user/:userId/profile', authentication, authorisation, userController.updateuser)


//________________________________ Product APIs _____________________________________

router.post('/products', productController.createProduct)

router.get('/products', productController.getProductByQuery)

router.get('/products/:productId', productController.getProductById)

router.put('/products/:productId', productController.updateProduct)

router.delete('/products/:productId', productController.deleteProductbyId)


//------------------------------- Cart APIs --------------------------------------------

 router.post('/users/:userId/cart', authentication, authorisation, cartController.createCart)

 router.get('/users/:userId/cart', authentication, authorisation, cartController.getCart)

router.put('/users/:userId/cart', authentication, authorisation, cartController.updatecart)

router.delete('/users/:userId/cart', authentication, authorisation, cartController.deleteCart)

//------------------------------- Order APIs ----------------------------------------------

router.post('/users/:userId/orders', authentication, authorisation, orderController.createOrder)

router.put('/users/:userId/orders', authentication, authorisation, orderController.updateOrder)


router.all("/*", function(req, res) {
    res.status(404).send({ msg: "No such Api found" })
})


module.exports = router