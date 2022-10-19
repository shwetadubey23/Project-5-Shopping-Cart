const productModel = require('../models/productModel')
const { uploadFile } = require("../awsConfigure/aws")
const { isValid, checkObject, regexName, regexPrice, regexNumber, isValidObjectId } = require('../validators/validator')



const createProduct = async function (req, res) {
    try {
        let data = req.body
        const { title, description, price, currencyId, currencyFormat, installments, availableSizes } = data
        
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


    } catch(err) {
        return res.status(500).send({ status: false, error: err.message })
    }
}

const getProductByFilters = async function (req, res) {
    let query = req.query
    if (Object.keys(query).length > 0) {
        if (query.size && query.name && query.priceGreaterThan) {
            let arr = query.size.split(",")

            let product = await productModel.find({ availableSizes: { $in: arr }, title: { $regex: query.name }, price: { $gt: query.priceGreaterThan }, isDeleted: false })
            if (product.length == 0) {
                return res.status(404).send({ status: false, message: "products not found" })
            } else {
                return res.status(200).send({ status: true, message: "Product fetched successfully", data: product })
            }

        }

        if (query.size && query.name && query.priceLessThan) {
            let arr = query.size.split(",")

            let product = await productModel.find({ availableSizes: { $in: arr }, title: { $regex: query.name }, price: { $lt: query.priceLessThan }, isDeleted: false })
            if (product.length == 0) {
                return res.status(404).send({ status: false, message: "products not found" })
            } else {
                return res.status(200).send({ status: true, message: "Product fetched successfully", data: product })
            }

        }

        if (query.size && query.name) {
            let arr = query.size.split(",")

            let product = await productModel.find({ availableSizes: { $in: arr }, title: { $regex: query.name }, isDeleted: false })
            if (product.length == 0) {
                return res.status(404).send({ status: false, message: "products not found of given size" })
            } else {
                return res.status(200).send({ status: true, message: "Product fetched successfully", data: product })
            }

        }

        if (query.priceGreaterThan && query.priceLessThan) {

            let product = await productModel.find({ price: { $lt: query.priceLessThan, $gt: query.priceGreaterThan }, isDeleted: false })
            if (product.length == 0) {
                return res.status(404).send({ status: false, message: "products not found" })
            } else {
                return res.status(200).send({ status: true, message: "Product fetched successfully", data: product })
            }

        }
        if (query.size) {
            //console.log(query.size)
            let arr = query.size.split(",")

            let product = await productModel.find({ availableSizes: { $in: arr }, isDeleted: false })
            if (product.length == 0) {
                return res.status(404).send({ status: false, message: "products not found of given size" })
            } else {
                return res.status(200).send({ status: true, message: "Product fetched successfully", data: product })
            }
        }

        if (query.name) {
            let product = await productModel.find({ title: { $regex: query.name }, isDeleted: false })
            if (product.length == 0) {
                return res.status(404).send({ status: false, message: "products not found of given name" })
            } else {
                return res.status(200).send({ status: true, message: "Product fetched successfully", data: product })
            }
        }

        if (query.priceGreaterThan) {
            let product = await productModel.find({ price: { $gt: query.priceGreaterThan }, isDeleted: false })
            if (product.length == 0) {
                return res.status(404).send({ status: false, message: "products not found of given price" })
            } else {
                return res.status(200).send({ status: true, message: "Product fetched successfully", data: product })
            }
        }


        if (query.priceLessThan) {
            let product = await productModel.find({ price: { $lt: query.priceLessThan }, isDeleted: false })
            if (product.length == 0) {
                return res.status(404).send({ status: false, message: "products not found of given price" })
            } else {
                return res.status(200).send({ status: true, message: "Product fetched successfully", data: product })
            }
        }


        let priceSort = query.priceSort

        if (priceSort) {
            let product = await productModel.find({ isDeleted: false }).sort({ price: priceSort })

            if (product.length == 0) {
                return res.status(404).send({ status: false, message: "products not found of given price" })
            } else {
                return res.status(200).send({ status: true, message: "Product fetched successfully", data: product })
            }

        }
    } else {
        let allProducts = await productModel.find({ isDeleted: false })
        if (allProducts.length == 0) {
            return res.status(404).send({ status: false, message: "Products not found" })
        } else {
            return res.status(200).send({ status: true, message: "Product fetched successfully", data: allProducts })
        }
    }
}

const getProductById = async function (req, res) {
    try {
        let productId = req.params.productId
        if (!isValidObjectId(productId)) return res.status(400).send({ status: false, msg: "Please give a valid productId" })

        let product = await productModel.findOne({ _id: productId, isDeleted: false })

        if (!product) {
            return res.status(404).send({ status: false, msg: "Product not found" })
        }

        return res.status(200).send({ status: true, message: "data fetched successfully", data: product })

    } catch (error) {
        return res.status(500).send({ status: false, error: error.message })
    }

}


const updateProduct = async function (req, res) {
    let data = req.body

    let productID = req.params.productId
    // console.log(productID)
    if (!isValidObjectId(productID)) return res.status(400).send({ status: false, message: "Given productID is not valid" })

    let product = await productModel.findOne({ _id: productID, isDeleted: false })
    if (!product) return res.status(404).send({ status: false, message: "Product not found" })

    let productImage = req.files

    var { installments, availableSizes, style, isFreeShipping, currencyFormat, currencyId, price, description, title } = data

    if (title) {
        let uniqueTitle = await productModel.findOne({ title: title })
        if (uniqueTitle) {
            return res.status(400).send({ status: false, message: "title already exist" })
        }
    }

    if (price) {
        if (!regexPrice.test(price)) {
            return res.status(400).send({ status: false, msg: "please provide valid price" })
        }
    }


    if (currencyId) {
        if (!(currencyId).includes("INR")) {
            return res.status(400).send({ status: false, message: "Currency ID must be INR" })
        }
    }
    if (currencyFormat) {
        if (!(currencyFormat).includes("₹")) {
            return res.status(400).send({ status: false, message: "currencyFormat  must be ₹" })
        }
    }

    if (productImage) {


        if (productImage.length > 0) {

            var uploadedFileURL = await uploadFile(productImage[0])

            //profileImage was available in req.files ; added new key in req.body.profileImage = uploadedFileURL
            data["productImage"] = uploadedFileURL
        }
    }

    if (availableSizes) {
        let s = availableSizes.split(",")

        let enumValue = ["S", "XS", "M", "X", "L", "XXL", "XL"]


        for (let i = 0; i < s.length; i++) {
            let f = enumValue.includes(s[i])
            if (f == false) {
                return res.status(400).send({ status: false, message: "availableSizes is missing or invalid : provide  S, XS, M, X, L, XXL, XL " })
            }
        }

        data["availableSizes"] = s
    }


    if (installments) {
        if (!regexNumber.test(installments)) {
            return res.status(400).send({ status: false, msg: "installments should be in number format" })
        }
    }


    let updatedProduct = await productModel.findOneAndUpdate({ _id: productID }, { $set: data }, { new: true })
    return res.status(200).send({ status: true, message: "Product updated successfully", data: updatedProduct })


}


const deleteProductbyId = async function (req, res) {
    try {
        let productId = req.params.productId


        if (!isValidObjectId(productId)) {
            return res.status(400).send({ status: false, msg: "productId is not valid " })
        }
        const product = await productModel.findOne({ _id: productId, isDeleted: false })
        if (!product) {
            return res.status(404).send({ status: false, msg: "product not found" })
        }

        await productModel.updateOne({ _id: productId, isDeleted: false }, { $set: { isDeleted: true, deletedAt: new Date() } })
        return res.status(200).send({ status: true, msg: "product deleted successfully" })
    }
    catch (error) {
        return res.status(500).send({ status: false, error: error.messag })
    }
}




module.exports = { createProduct, updateProduct, getProductById, getProductByFilters, deleteProductbyId }
