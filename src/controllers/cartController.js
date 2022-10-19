const userModel = require('../models/userModel')
const cartModel = require('../models/cartModel')
const productModel = require('../models/productModel')

const createCart = async function (req, res) {
    try {
        let userId = req.params.userId
      

        let cartid = req.body.cartId
        let usercart = await cartModel.findOne({ _id:cartid, userId: userId })


        if (!usercart) {


            let productId = req.body.productId


            let product = await productModel.findOne({ _id: productId, isDeleted: false })
           
            let obj = {
                productId: product._id,
                quantity: 1,
            }
            let createcart = await cartModel.create({ userId: userId, items: obj, totalPrice: product.price * obj.quantity, totalItems: 1 })

            return res.status(201).send({ status: true, data: createcart })
        }
        if (usercart) {

            let cartId = await cartModel.findById(cartid)

            let productId = req.body.productId;


            let findProduct = await productModel.findById(productId).select({ price: 1, _id: 0 });
            let obj = {
                quantity: 1
            }

            let updateCart = await cartModel.findOneAndUpdate(
                { _id: cartId._id, "items.productId": productId, userId:userId },
                {
                    $inc: {
                        "items.$.quantity": 1,   // $ sign dynamically directs to the index number of the sub document.
                        totalPrice: obj.quantity * findProduct.price,
                    },
                },
                { new: true });
            console.log(updateCart)
            // res.status(200).send({status:true,message:"Quantity add in cart",data:updateCart})

            if (!updateCart) {
                let id = req.body.productId
                let product = await productModel.findOne({ _id: id, isDeleted: false })
                let obj = {
                    productId: product._id,
                    quantity: 1
                }

                let updateCart = await cartModel.findOneAndUpdate(
                    { _id: cartId._id, userId:userId },
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
        // if (!isValidObjectId(userId)) {
        //     return res.status(400).send({ status: false, message: "userId not valid" })
        // }
        let userData = await userModel.findById( userId )
        if (!userData) {
            return res.status(404).send({ status: false, message: "user not found" })
        }
        // if (req.loggedInUser != userId) {
        //     return res.status(403).send({ status: false, message: "Not Authorised" })
        // }
        let cart = await cartModel.findOne({ userId:userId }).populate('items.productId')
        if (!cart) {
            return res.status(404).send({ status: false, message: "Cart not found for this user" })
        }
        return res.status(200).send({ status: true, message: "cart fetched successfully", data: cart })
    }
    catch (err) {
        return res.status(500).send({ status: false, message: err.message })
    }
}

const updatecart = async function (req, res) {
    let userId = req.params.userId
    let productId = req.body.productId
    let cartId = req.body.cartId
    let removeProduct = req.body.removeProduct
    if (removeProduct == 1) {
        let product = await productModel.findOne({ _id: productId, isDeleted: false })  // we want the price of product

        let cartExist = await cartModel.findOne({ _id: cartId, "items.productId": productId, userId:userId })  // we want to check if the product exist in cart or not.
        if (!cartExist) return res.status(400).send({ status: false, message: "This product is already deleted from cart or cart of this user doesn't exist!" })
       // console.log(cartExist)
        let array = cartExist.items  
        let productQuantity = 0
        for (let i = 0; i < array.length; i++) {
            if (array[i].productId == productId) {
                productQuantity = array[i].quantity
            }
        }
        productQuantity = productQuantity - 1
        console.log(productQuantity)
            if (productQuantity == 0) {
                let updateCart = await cartModel.findOneAndUpdate({ _id: cartId, userId:userId },
                    { $pull: { items: { "productId": productId } }, $inc: { totalItems: -1, totalPrice: -product.price } }, { new: true })  //removes object from an array.
                return res.status(200).send({ status: true, message: "product deleted successfully from the cart !", data: updateCart })


            }

        //let cart = await cartModel.findById(cartId)
        let updateCart = await cartModel.findOneAndUpdate({ _id: cartId, "items.productId": productId, userId:userId },
            { $inc: { "items.$.quantity": -1, totalPrice: -product.price } }, { new: true })
        return res.send({ status: true, message: "Product quantity removed", data: updateCart })
         }
        if (removeProduct == 0) {
            let cartDetails = await cartModel.findOne({ _id: cartId, "items.productId": productId, userId:userId })
            if (!cartDetails) return res.status(400).send({ status: false, message: "This product already deleted from cart!" })
            let product = await productModel.findOne({ _id: productId, isDeleted: false })  // we want to fetch the price.
           // let cart = await cartModel.findById(cartId)
            let g = cartDetails.items.filter(ele => ele.productId == productId)
           // console.log(g)
            if (g.length == 0) return res.status(400).send({ status: false, message: "this item is already deleted  !" }) 
            let quantity = g[0].quantity
                

            let updateCart = await cartModel.findOneAndUpdate({ _id: cartId, userId:userId},
                { $pull: { items: { "productId": productId } }, $inc: { totalItems: -1, totalPrice: -product.price * quantity } }, { new: true })
            // console.log(g[0].quantity)
            return res.send({ status: true, message: "Product deleted Successfully from cart", data: updateCart })
        


    }


}


const deleteCart = async function (req, res) {
    try {
        let userId = req.params.userId
        // if (!isValidObjectId(userId)) {
        //     return res.status(400).send({ status: false, message: "userId not valid" })
        // }
        let userData = await userModel.findById(userId)
        if (!userData) {
            return res.status(404).send({ status: false, message: "user not found" })
        }
        // if (req.loggedInUser != userId) {
        //     return res.status(403).send({ status: false, message: "Not Authorised" })
        // }
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
        let updateCart = await cartModel.findOneAndUpdate({ _id: cart._id, userId:userId }, { $set: { items: items, totalPrice: totalPrice, totalItems: totalItems } })
        return res.status(200).send({ status: true, message: "cart deleted successfully" })
    }
    catch (err) {
        return res.status(500).send({ status: false, message: err.message })
    }
}



module.exports = { createCart, getCart, deleteCart, updatecart }