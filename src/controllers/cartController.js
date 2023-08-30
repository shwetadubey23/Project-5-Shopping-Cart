const userModel = require('../models/userModel')
const cartModel = require('../models/cartModel')
const productModel = require('../models/productModel')
const { isValidObjectId } = require('../validators/validator')



//==========================================  AddProduct in cart ==================================================///

const addToCart = async (req, res) => {
    try {
        let userId = req.params.userId
        let productId = req.body.productId

        if (!productId)
            return res.status(400).send({ status: false, message: "Please provide productId" });


        if (!isValidObjectId(productId))
            return res.status(400).send({ status: false, message: "Ivalid productId" });

        let productData = await productModel.findOne({ _id: productId, isDeleted: false });
        if (!productData) {
            return res.status(404).send({ status: false, message: "product not found" });
        }

        let userCart = await cartModel.findOne({ userId });

        let sameProduct
        userCart.items.map(x => { if (x.productId == productId) sameProduct = x.productId })
        if (sameProduct) {
            let update = await cartModel.findOneAndUpdate(
                { userId, "items.productId": sameProduct },
                { $inc: { "items.$.quantity": 1, totalPrice: productData.price } },
                { new: true }
            ).populate('items.productId').select({ __v: 0 });
            return res.status(201).send({ status: true, message: "Success", data: update })
        } else {
            let update = await cartModel.findOneAndUpdate(
                { userId: userId },
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

    } catch (error) {
        return res.status(500).send({ status: false, error: error.message });
    }
}

///===================================== updatecart ===================================================///

const updatecart = async (req, res) => {
    try {
        let userId = req.params.userId
        let { productId, removeProduct, ...rest } = req.body

        if (!productId) {
            return res.status(400).send({ status: false, message: "Please provide productId" })
        }

        if (!Object.keys(req.body).includes('removeProduct')) {
            return res.status(400).send({ status: false, message: "Please provide removeProduct" })
        }

        if (!isValidObjectId(productId))
            return res.status(400).send({ status: false, message: "Ivalid productId" });


        if (removeProduct > 1 || removeProduct < 0) {
            return res.status(400).send({ status: false, message: "removeProduct can only be 0 or 1" });
        }

        let productData = await productModel.findOne({ _id: productId, isDeleted: false })
        if (!productData) { return res.status(404).send({ status: false, message: "product not found" }) }

        let userCart = await cartModel.findOne({ userId })
        if (!userCart) { return res.status(404).send({ status: false, message: "cart not found" }) }

        if (userCart.totalItems == 0) {
            return res.status(400).send({ status: false, message: "cart is empty... add items into cart" });
        }

        let quantity
        let itemId
        userCart.items.map(x => { if (x.productId == productId) { quantity = x.quantity, itemId = x._id } })

        if (!itemId) {
            return res.status(404).send({ status: false, message: "Product not found" })
        }

        if (removeProduct == 1 && quantity > 1) {
            let update = await cartModel.findOneAndUpdate(
                { userId, "items.productId": productId },
                { $inc: { "items.$.quantity": -1, totalPrice: -(productData.price) } },
                { new: true }
            ).populate('items.productId').select({ __v: 0 });
            return res.status(200).send({ status: true, message: "Success", data: update })

        } else if (removeProduct == 0 || quantity == 1) {

            let updateCart = await cartModel.findOneAndUpdate(
                { userId },
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

module.exports = { addToCart, updatecart, getCart, deleteCart }