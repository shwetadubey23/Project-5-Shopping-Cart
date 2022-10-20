const userModel = require('../models/userModel')
const cartModel = require('../models/cartModel')
const productModel = require('../models/productModel')
const { isValidObjectId } = require('../validators/validator')


const createCart = async function (req, res) {
    try {
        let data = req.body
        let userId = req.params.userId
        let { cartId, productId } = data

        if (Object.keys(data).length === 0) {
            return res.status(400).send({ status: false, msg: "please provide some data" })
        }

        let usercart = await cartModel.findOne({ userId: userId })

        if (!usercart) {
            if (!productId) {
                return res.status(400).send({ status: false, message: 'please provide product id' })
            }
            if (!isValidObjectId(productId)) {
                return res.status(400).send({ status: false, message: 'productId id is not valid' })
            }
            let product = await productModel.findOne({ _id: productId, isDeleted: false })
            if (!product) {
                return res.status(404).send({ status: false, message: 'product does not exist' })
            }

            let obj = {
                productId: product._id,
                quantity: 1,
            }
            let createcart = await cartModel.create({ userId: userId, items: obj, totalPrice: product.price * obj.quantity, totalItems: 1 })

            return res.status(201).send({ status: true, message: "cart created successfully", data: createcart })
        }
        if (usercart) {

            if (!cartId) {
                return res.status(400).send({ status: false, message: 'cart is already created (provide cart id)' })
            }
            if (!isValidObjectId(cartId)) {
                return res.status(400).send({ status: false, message: 'cart id is not valid' })
            }
            let cartIdInDb = await cartModel.findById(cartId)
            if (!cartIdInDb) {
                return res.status(404).send({ status: false, message: 'cart id does not exist' })
            }
            if (!productId) {
                return res.status(400).send({ status: false, message: 'please provide product id' })
            }
            if (!isValidObjectId(productId)) {
                return res.status(400).send({ status: false, message: 'productId id is not valid' })
            }

            let findProduct = await productModel.findOne({ _id: productId, isDeleted: false }).select({ price: 1, _id: 0 });
            if (!findProduct) {
                return res.status(404).send({ status: false, message: 'productId id does not exist' })
            }

            let obj = {
                quantity: 1
            }
            let updateCart = await cartModel.findOneAndUpdate(
                { _id: cartIdInDb._id, "items.productId": productId, userId: userId },
                {
                    $inc: {
                        "items.$.quantity": 1,   // $ sign dynamically directs to the index number of the sub document.
                        totalPrice: obj.quantity * findProduct.price,
                    },
                },
                { new: true });

            if (!updateCart) {
                let id = data.productId
                let product = await productModel.findOne({ _id: id, isDeleted: false })
                let obj = {
                    productId: product._id,
                    quantity: 1
                }

                let updateCart = await cartModel.findOneAndUpdate(
                    { _id: cartIdInDb._id, userId: userId },
                    {
                        $push: { items: obj },
                        $inc: {

                            totalPrice: obj.quantity * product.price,
                            totalItems: 1
                        }
                    },
                    { new: true });
                return res.status(201).send({ status: true, message: "product pushed and added successfully!", data: updateCart })

            }
            return res.status(201).send({ status: true, message: "product quantity added successfully!", data: updateCart })
        }
    } catch (error) {
        return res.status(500).send({ status: false, message: error.message })
    }
}



const getCart = async function (req, res) {
    try {
        let userId = req.params.userId

        let cart = await cartModel.findOne({ userId: userId }).populate('items.productId')
        if (!cart) {
            return res.status(404).send({ status: false, message: "Cart not found for this user" })
        }
        return res.status(200).send({ status: true, message: "Success", data: cart })
    }
    catch (err) {
        return res.status(500).send({ status: false, message: err.message })
    }
}



const updatecart = async function (req, res) {
    try {
        let userId = req.params.userId
        let data = req.body
        let { productId, cartId, removeProduct } = data
  // removeProduct = removeProduct.toString().trim()


        if (Object.keys(data).length === 0) {
            return res.status(400).send({ status: false, message: "body should not be empty" })
        }
        // if (!isValid (removeProduct)) {
        //     return res.status(400).send({ status: false, message: 'removeProduct key is mandatory' })
        // }
        // if (!(removeProduct == "1" || removeProduct == "0")) {
        //     return res.status(400).send({ status: false, message: "removeProduct value only can be 0 or 1" })
        // }

        if (!cartId) {
            return res.status(400).send({ status: false, message: 'cart id is mandatory' })
        }
        if (!isValidObjectId(cartId)) {
            return res.status(400).send({ status: false, message: 'cart id is not valid' })
        }
        let cartIdInDb = await cartModel.findById(cartId)
        if (!cartIdInDb) {
            return res.status(404).send({ status: false, message: 'cart id does not exist' })
        }
        if (!productId) {
            return res.status(400).send({ status: false, message: 'please provide product id' })
        }
        if (!isValidObjectId(productId)) {
            return res.status(400).send({ status: false, message: 'productId id is not valid' })
        }
        let findProduct = await productModel.findOne({ _id: productId, isDeleted: false })
        if (!findProduct) {
            return res.status(404).send({ status: false, message: 'productId id does not exist' })
        }
        if (removeProduct == 1) {
            let product = await productModel.findOne({ _id: productId, isDeleted: false })  // we want the price of product

            let cartExist = await cartModel.findOne({ _id: cartId, "items.productId": productId, userId: userId })  // we want to check if the product exist in cart or not.
            if (!cartExist) return res.status(200).send({ status: false, message: "This product is already deleted from cart or cart of this user doesn't exist!" })

            let array = cartExist.items
            let productQuantity = 0
            for (let i = 0; i < array.length; i++) {
                if (array[i].productId == productId) {
                    productQuantity = array[i].quantity
                }
            }
            productQuantity = productQuantity - 1
            if (productQuantity == 0) {
                let updateCart = await cartModel.findOneAndUpdate({ _id: cartId, userId: userId },
                    { $pull: { items: { "productId": productId } }, $inc: { totalItems: -1, totalPrice: -product.price } }, { new: true })  //removes object from an array.
                return res.status(200).send({ status: true, message: "Success", data: updateCart })
            }

            let updateCart = await cartModel.findOneAndUpdate({ _id: cartId, "items.productId": productId, userId: userId },
                { $inc: { "items.$.quantity": -1, totalPrice: -product.price } }, { new: true })
            return res.status(200).send({ status: true, message: "Success", data: updateCart })
        }
        if (removeProduct == 0) {
            let cartDetails = await cartModel.findOne({ _id: cartId, "items.productId": productId, userId: userId })
            if (!cartDetails) return res.status(400).send({ status: false, message: "cart document not found" })

            let product = await productModel.findOne({ _id: productId, isDeleted: false })  // we want to fetch the price.
            let g = cartDetails.items.filter(ele => ele.productId == productId)
            if (g.length == 0) return res.status(400).send({ status: false, message: "this item is already deleted  !" })
            let quantity = g[0].quantity

            let updateCart = await cartModel.findOneAndUpdate({ _id: cartId, userId: userId },
                { $pull: { items: { "productId": productId } }, $inc: { totalItems: -1, totalPrice: -product.price * quantity } }, { new: true })
            return res.status(200).send({ status: true, message: "Success", data: updateCart })
        }
    } catch (err) {
        return res.status(500).send({ status: false, message: err.message })
    }
}



const deleteCart = async function (req, res) {
    try {
        let userId = req.params.userId

        let cart = await cartModel.findOne({ userId: userData._id })
        if (!cart) {
            return res.status(404).send({ status: false, message: "Cart not found for this user" })
        }
        if (cart.items.length === 0) {
            return res.status(400).send({ status: false, message: "Cart is already empty" })
        }

        let items = []
        let totalPrice = 0
        let totalItems = 0
        let updateCart = await cartModel.findOneAndUpdate({ _id: cart._id, userId: userId }, { $set: { items: items, totalPrice: totalPrice, totalItems: totalItems } })
        return res.status(204).send({ status: true, message: "cart deleted successfully" })
    }
    catch (err) {
        return res.status(500).send({ status: false, message: err.message })
    }
}



module.exports = { createCart, getCart, deleteCart, updatecart }