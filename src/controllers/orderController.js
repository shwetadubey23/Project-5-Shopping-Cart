const userModel = require('../models/userModel')
const productModel = require('../models/productModel')
const cartModel = require('../models/cartModel')
const orderModel = require('../models/orderModel')
const { isValidObjectId,  isValidStatus } = require('../validators/validator')



const createOrder = async function (req, res) {
    try {

        let userId = req.params.userId
        let data = req.body
        let { cancellable } = data
let orderData = {}
        
        let cart = await cartModel.findOne({ userId })
        if (!cart) {
            return res.status(404).send({ status: false, message: "cart not found" })
        }
        if(!cart.totalItems){
            return res.status(404).send({ status: false, message: "cart is empty" })
        }
        
        if (cancellable) {
            if ( typeof(cancellable) !== "boolean" )
                return res.status(400).send({ status: false, message: "cancellable should be true/false" })
        orderData.cancellable = cancellable
            }

        let cartItems = cart.items

        let totalQuantity = 0

        for (let i = 0; i < cartItems.length; i++) {
          orderData.totalQuantity = totalQuantity + cartItems[i].quantity
            
        }

        orderData.userId = userId
        orderData.items = cart.items
          orderData.totalPrice = cart.totalPrice
          orderData.totalItems = cart.totalItems

        let orderCreated = await orderModel.create(orderData)

        return res.status(201).send({ status: true, message: "Success", data: orderCreated })

    } catch (error) {
        return res.status(500).send({ status: false, message: error.message })
    }
}


const updateOrder = async function (req, res) {
    try {
        let data = req.body
        let userId = req.params.userId
        let orderId = req.body.orderId
        let status = req.body.status
        if (!orderId) {
            return res.status(404).send({ status: false, message: "orderId is required" })
        }
        if (!isValidObjectId(orderId)) {
            return res.status(400).send({ status: false, message: "orderId is not valid" })
        }
        if (!data.status) {
            return res.status(400).send({ status: false, message: "Status is required " });
        }
        if (!isValidStatus(data.status)) {
            return res.status(400).send({ status: false, 
                message: "Status can be updated to only 'completed' and 'cancelled'" });
        }
        let orderDB = await orderModel.findOne({ _id: orderId, userId: userId, isDeleted: false })
        if (!orderDB) {
            return res.status(404).send({ status: false, message: "order not found" });
        }
        if(orderDB.status =="completed"){
            return res.status(404).send({ status: false, message: "Order alreday completed" })
        }
        if(orderDB.status =="cancelled"){
            return res.status(404).send({ status: false, message: "Order alreday cancelled" })
        }
        if (orderDB.cancellable == false) {
            if (status === "cancelled") {

                return res.status(400).send({ status: false, message: "this order cannot be cancelled" })
            }}

        let updateOrder = await orderModel.findOneAndUpdate({ _id: orderId }, 
            { $set: { status: status } }, { new: true })
        return res.status(200).send({ status: true, message: "Success", data: updateOrder })

    } catch (error) {
        return res.status(500).send({ status: true, message: error.message })
    }
}


module.exports = { createOrder, updateOrder }

