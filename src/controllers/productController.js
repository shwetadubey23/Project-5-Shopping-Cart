const productModel = require('../models/productModel');
const ObjectId = require('mongoose').Types.ObjectId
const { uploadFile } = require('../awsConfigure/aws')


//______________________ Create Product API ______________________________________

const createProduct = async function (req, res) {
    try {
        let data = req.body
        const { title, description, price, currencyId, currencyFormat, installments, availableSizes } = data
        //let availableSizes = data.availableSizes
        if (Object.keys(data).length === 0) {
            return res.status(400).send({ status: false, msg: "please provide detail for the Product creation " })
        }


        if (!title) {
            return res.status(400).send({ status: false, msg: "please provide proper title" })
        }
        const duplicateTitle = await productModel.findOne({ title: title })
        if (duplicateTitle) {
            return res.status(400).send({ status: false, message: "enter different Title" })
        }
        if (!description) {
            return res.status(400).send({ status: false, msg: "please provide proper description" })
        }
        if (!price) {
            return res.status(400).send({ status: false, msg: "please provide price" })
        }
        if (!/^[1-9]+[0-9.]*$/.test(price)) {
            return res.status(400).send({ status: false, message: "Please Provide Valid Price" })
        }

        if ( currencyId && currencyId !== "INR") {
            return res.status(400).send({ status: false, msg: "currencyId must be INR" })
        }
        if ( currencyFormat && currencyFormat !== "₹") {
            return res.status(400).send({ status: false, msg: "currencyFormat must be in ₹" })
        }

        if (installments && !/^[0-9]*$/.test(installments)) {
            return res.status(400).send({ status: false, message: "Please Provide Valid Installments" })

        }

        //let  availableSize = JSON.parse(availableSizes)
        let newSizes = availableSizes.split(",")

        for (let i of newSizes) {
            if (!["S", "XS", "M", "X", "L", "XXL", "XL"].includes(i)) {
                return res.status(400).send({ status: false, message: 'Please Provide Available Sizes from S,XS,M,X,L,XXL,XL' })
            }
        }
        data["availableSizes"] = newSizes

        let files = req.files

        if (!files.length === 0) {
            return res.status(400).send({ status: false, message: "Please Provide The Product Image" });
        }

        const uploadedImage = await uploadFile(files[0])
        data.productImage = uploadedImage

        let productCreated = await productModel.create(data)
        return res.status(201).send({ status: true, msg: "User created successfully", data: productCreated })


    } catch (err) {
        return res.status(500).send({ status: false, error: err.message })
    }
}


//=========================== Get(getById) Product API =========================================================


const getProductById = async function (req, res) {
    try {
        let productId = req.params.productId

        if (!ObjectId.isValid(productId)) {
            return res.status(400).send({ status: false, msg: "productId is not valid " })
        }
        let product = await productModel.findOne({ _id: productId, isDeleted: false })
        if (!product) {
            return res.status(404).send({ status: false, msg: "product not found" })
        }
        return res.status(200).send({ status: true, msg: "data fetched successfully ", data: product })
    } catch (err) {
        return res.status(500).send({ status: false, message: err.message })
    }
}

module.exports = { createProduct, getProductById }