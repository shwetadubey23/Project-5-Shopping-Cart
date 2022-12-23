const userModel = require('../models/userModel')
const cartModel = require('../models/cartModel')
const productModel = require('../models/productModel')
const { isValidObjectId } = require('../validators/validator')



//==========================================  createCart ==================================================///

const createCart = async (req, res) => {
    try {
        let userId = req.params.userId
        let { productId, cartId, ...rest} = req.body
        let createData = {}

        if (Object.keys(req.body).length === 0) {
            return res.status(400).send({ status: false, message: "Request body empty... Please provide data for input" })
        }

        if (!isValidObjectId(productId))
            return res.status(400).send({ status: false, message: "Ivalid productId" });

        if (cartId) {
            if (!isValidObjectId(cartId))
                return res.status(400).send({ status: false, message: "Ivalid cartid" });
        }
        if (Object.keys(rest).length != 0) {
            return res.status(400).send({status: false,message: "Extra data provided...Please provide only productId or productId and cartId from body",
            });
        }

        let productData = await productModel.findOne({ _id: productId, isDeleted: false });
        if (!productData) {
            return res.status(404).send({ status: false, message: "product not found" });
        }

        if (cartId) {
            let isCartExist = await cartModel.findOne({ _id: cartId });
            if (!isCartExist) {
                return res.status(404).send({ status: false, message: "cart not found" });
            }
        }

        let userAlreadyHaveCart = await cartModel.findOne({ userId });
        if (userAlreadyHaveCart && !cartId) {
            return res.status(400).send({ status: false, message: "Cart already exist, Please provide cartId" });
        }

        if (cartId) {
            let usersCart = await cartModel.findOne({ _id: cartId, userId: userId })
            if (!usersCart) {
                return res.status(400).send({ status: false, message: "Cart doesn't belongs to this user" });
            }
        }
    // console.log(typeof(userAlreadyHaveCart))
        if (userAlreadyHaveCart){
            let cartObj = userAlreadyHaveCart.toObject()
            let product
            cartObj.items.map(x => { if (x.productId == productId) product = x.productId })
            if (product) {
                let update = await cartModel.findOneAndUpdate(
                    { _id: cartId, "items.productId": product },
                    { $inc: { "items.$.quantity": 1, totalPrice: productData.price } },
                    { new: true }
                ).populate('items.productId').select({ __v: 0 });
                return res.status(201).send({ status: true, message: "Success", data: update })
            } else {
                let update = await cartModel.findOneAndUpdate(
                    { _id: cartId },
                    {
                        $push: {
                            items: {
                                productId: productId,
                                quantity: 1
                            }
                        },
                        $inc: { totalPrice: productData.price, totalItems: 1 }
                    }, { new: true }
                ).populate('items.productId').select({ __v: 0 });
                return res.status(201).send({ status: true, message: "Success", data: update })
            }
        }

        createData.userId = userId
        createData.items = [{
            productId: productId,
            quantity: 1
        }]
        createData.totalPrice = productData.price
        createData.totalItems = 1

        let createCart = await cartModel.create(createData)
        let sendData = await cartModel.findOne({ userId }).populate('items.productId').select({ __v: 0 });
        return res.status(201).send({ status: true, message: "Success", data: sendData })

    } catch (error) {
        return res.status(500).send({ status: false, error: error.message });
    }
}

///===================================== updatecart ===================================================///

const updatecart = async (req, res) => {
    try {
        let userId = req.params.userId
        let { productId, cartId, removeProduct, ...rest } = req.body

        if (Object.keys(req.body).length === 0) {
            return res.status(400).send({ status: false, message: "Request body empty... Please provide data for input" })
        }

        if (!productId) {
            return res.status(400).send({ status: false, message: "Please provide productId" })
        }

        if (!cartId) {
            return res.status(400).send({ status: false, message: "Please provide cartId" })
        }

        if (!Object.keys(req.body).includes('removeProduct')) {
            return res.status(400).send({ status: false, message: "Please provide removeProduct" })
        }

        if (!isValidObjectId(productId))
            return res.status(400).send({ status: false, message: "Ivalid productId" });

        if (cartId) {
            if (!isValidObjectId(cartId))
                return res.status(400).send({ status: false, message: "Ivalid cartid" });
        }

        if (Object.keys(rest).length != 0) {
            return res.status(400).send({status: false, message: "Extra data provided...Please provide only productId, cartId and removeProduct from body"});
        }

        if (removeProduct > 1 || removeProduct < 0) {
            return res.status(400).send({status: false, message: "removeProduct can only be 0 or 1"});
        }

        let productData = await productModel.findOne({ _id: productId, isDeleted: false })
        if (!productData) { return res.status(404).send({ status: false, message: "product not found" })}

        let userAlreadyHaveCart = await cartModel.findOne({ _id: cartId })
        if (!userAlreadyHaveCart) {return res.status(404).send({ status: false, message: "cart not found" }) }

        if (cartId) {
            let usersCart = await cartModel.findOne({ _id: cartId, userId: userId })
            if (!usersCart) {return res.status(400).send({ status: false, message: "Cart doesn't belongs to this user" })}
        } 
        
        if (userAlreadyHaveCart.totalItems == 0) {
            return res.status(400).send({ status: false, message: "cart is empty... add items into cart" });
        }

        let cartObj = userAlreadyHaveCart.toObject()
        let quantity
        cartObj.items.map(x => { if (x.productId == productId) quantity = x.quantity })

        let itemId
        cartObj.items.map(x => { if (x.productId == productId) itemId = x._id })
        if (!itemId) {
            return res.status(404).send({ status: false, message: "Product not found" })
        }

        if (removeProduct == 1 && quantity > 1) {
            let update = await cartModel.findOneAndUpdate(
                { _id: cartId, "items.productId": productId },
                { $inc: { "items.$.quantity": -1, totalPrice: -(productData.price) } },
                { new: true }
            ).populate('items.productId').select({ __v: 0 });
            return res.status(200).send({ status: true, message: "Success", data: update })

        } else if (removeProduct == 0 || quantity == 1) {
            let quantity
            cartObj.items.map(x => { if (x.productId == productId) quantity = x.quantity })
            let itemId
            cartObj.items.map(x => { if (x.productId == productId) itemId = x._id })
            let updateCart = await cartModel.findOneAndUpdate(
                { _id: cartId, isDeleted: false },
                {
                    $pull: {
                        items: { _id: itemId }
                    },
                    $inc: { totalPrice: -((productData.price) * quantity), totalItems: -1 }
                }, { new: true }
            ).populate('items.productId').select({ __v: 0 });
            return res.status(200).send({ status: true, message: "Success", data: updateCart })
        }

    } catch (error) {
        return res.status(500).send({ status: false, error: error.message });
    }
}

///===================================== get cart data  ===================================================///

const getCart = async function (req, res) {
    try {
        let userId = req.params.userId
        
        let findCart = await cartModel.findOne({ userId: userId }).populate('items.productId').select({ __v: 0 });
        if (!findCart) return res.status(404).send({ status: false, message: `No cart found with this "" userId` });

        return res.status(200).send({ status: true, message: "Success", data: findCart })

    } catch (err) {
        return res.status(500).send({ status: false, message: err.message });
    }
};

///===================================== delete cart  ===================================================///

const deleteCart = async (req, res) => {
    try {

        let userId = req.params.userId
        
        let isCart = await cartModel.findOne({ userId: userId });
        if (!isCart) {
            return res.status(404).send({ status: false, message: "cart not found" });
        } else if (isCart.totalItems == 0) {
            return res.status(400).send({ status: false, message: "cart empty!" });
        } else {
            let deletedCart = await cartModel.findOneAndUpdate(
                { userId: userId, isDeleted: false },
                { $set: { items: [], totalItems: 0, totalPrice: 0 } },
                { new: true });
            return res.status(204).send({ status: true, message: "Cart Deleted Succesfully", data: deletedCart });
        }
    } catch (err) {
        return res.status(500).send({ status: false, message: err.message });
    }
};

module.exports = { createCart, updatecart, getCart, deleteCart }