const userModel = require('../models/userModel')
const productModel = require('../models/productModel')
const cartModel = require('../models/cartModel')
const orderModel = require('../models/orderModel')
const { findOneAndUpdate } = require('../models/userModel')


const createOrder = async function (req, res) {
    try {

        let userId = req.params.userId
        let cartId = req.body.cartId

        let user = await userModel.findById(userId)
        if (!user) return res.status(404).send({ status: true, message: "user not found" })

        let cart = await cartModel.findOne({ _id: cartId, userId: userId })
        if (!cart) {
            return res.status(404).send({ status: false, message: "cart not found" })
        }

        let array = cart.items

        let totalQuantity = 0

        for (let i = 0; i < array.length; i++) {
           totalQuantity = totalQuantity + array[i].quantity
        }

        
        let Items = cart.items
        let totalPrice = cart.totalPrice
        let totalItems = cart.totalItems

        let orderCreated = await orderModel.create({userId: userId, items: Items, totalPrice:totalPrice, totalItems:totalItems, totalQuantity:totalQuantity})

        let items1 = []
        let totalPrice1 = 0
        let totalItems1 = 0
       await cartModel.findOneAndUpdate({ _id: cart._id, userId:userId }, { $set: { items: items1, totalPrice: totalPrice1, totalItems: totalItems1 } })
       return res.status(201).send({status:true, message:"Order created successfully", data:orderCreated})


    } catch (error) {
        return res.status(500).send({ status: false, message: error.message })
    }
}

const updateOrder = async function (req, res) {
    try{
        let userId = req.params.userId
        let orderId = req.body.orderId

        let updateOrder = await orderModel.findOneAndUpdate({_id:orderId}, {$set:{status:"completed"}},{new:true})
        return res.status(200).send({status:true, message:"Order updated successfully", data:updateOrder})

    }catch(error){
        return res.status(500).send({status:true, message:error.message})
    }
}


module.exports = { createOrder, updateOrder }

