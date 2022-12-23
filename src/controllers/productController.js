const productModel = require('../models/productModel')
const { uploadFile } = require("../awsConfigure/aws")
const { regexPrice, regexNumber, isValidObjectId } = require('../validators/validator')


//__________________________________ createProduct (post) API ___________________________________

const createProduct = async function (req, res) {
    try {
        let data = req.body
        const { title, description, price, currencyId, currencyFormat, installments, availableSizes } = data

        if (Object.keys(data).length === 0) {
            return res.status(400).send({ status: false, message: "please provide details for the Product creation" })
        }
        if (!title) {
            return res.status(400).send({ status: false, message: "please provide title" })
        }
        const duplicateTitle = await productModel.findOne({ title: title })
        if (duplicateTitle) {
            return res.status(400).send({ status: false, message: "enter different Title" })
        }
        if (!description) {
            return res.status(400).send({ status: false, message: "please provide description" })
        }
        if (!price) {
            return res.status(400).send({ status: false, message: "please provide price" })
        }
        if (!/^[1-9]+[0-9.]*$/.test(price)) {
            return res.status(400).send({ status: false, message: "Please Provide Valid Price" })
        }

        if (currencyId && currencyId !== "INR") {
            return res.status(400).send({ status: false, message: "currencyId must be INR" })
        }
        if (currencyFormat && currencyFormat !== "₹") {
            return res.status(400).send({ status: false, message: "currencyFormat must be in ₹" })
        }

        if (installments && !/^[0-9]*$/.test(installments)) {
            return res.status(400).send({ status: false, message: "Please Provide Valid Installments" })

        }
        if (availableSizes) {
            let newSizes = availableSizes.split(",")

            for (let i of newSizes) {
                if (!["S", "XS", "M", "X", "L", "XXL", "XL"].includes(i)) {
                    return res.status(400).send({ status: false, message: 'Please Provide Available Sizes from [S,XS,M,X,L,XXL,XL]' })
                }
            }
            data["availableSizes"] = newSizes
        }
        let files = req.files

        if (files.length === 0) {
            return res.status(400).send({ status: false, message: "Please Provide The Product Image" });
        }

        const uploadedImage = await uploadFile(files[0])
        data.productImage = uploadedImage

        let productCreated = await productModel.create(data)
        return res.status(201).send({ status: true, message: 'Success', data: productCreated })

    } catch (err) {
        return res.status(500).send({ status: false, error: err.message })
    }
}


//____________________________________ getProduct API ___________________________________

const getProductByQuery = async (req, res) => {
    try {
      let { name, size, priceGreaterThan, priceLessThan, priceSort, ...rest } = req.query ;
  
      if (Object.keys(rest).length != 0) {
        return res.status(400).send({ status: false, message: "Filter data through keys => name, size, priceGreaterThan, priceLessThan, priceSort" });
      }
      let data = { isDeleted: false };
  
      if (priceGreaterThan) {
        let pric = parseFloat(priceGreaterThan);
        if (!regexPrice(priceGreaterThan)) {
          return res.status(400).send({ status: false, message: "priceGreaterThan must be Numeric or decimal (upto 4 digits)" });
        }
        data.price = { $gt: pric };
      }
  
      if (priceLessThan) {
        let pric = parseFloat(priceLessThan);
        if (!regexPrice(priceLessThan)) {
          return res.status(400).send({ status: false, message: "priceLessThan must be Numeric or decimal (upto 4 digits"});
        }
        data.price = { $lt: pric };
      }
  
      if (priceGreaterThan && priceLessThan) {
        let pric = parseFloat(priceGreaterThan);
        let pri = parseFloat(priceLessThan);
        data.price = { $gt: pric, $lt: pri };
      }
  
      if (size) {
        size = size.toUpperCase().split(",");
        for (let i = 0; i < size.length; i++) {
          const element = size[i];
  
          if (!["S", "XS", "M", "X", "L", "XXL", "XL"].includes(element)) {
            return res.status(400).send({status: false, message: "available sizes should be from:  S, XS, M, X, L, XXL, XL"});
          }
        }
        data.availableSizes = { $in: size };
      }
      if (name) {
        if (!isValidTitle(name))
          return res.status(400).send({ status: false, message: "Invalid name" });
        const regexForName = new RegExp(name, "i");
        data.title = { $regex: regexForName };
      }
  
      let allProducts = await productModel.find(data);
  
      if (allProducts.length == 0) {
        return res.status(404).send({ status: false, message: "No Product found" });
      }
  
      if (priceSort == 1) {
        allProducts.sort((a, b) => {
          return a.price - b.price;
        });
      } else if (priceSort == -1) {
        allProducts.sort((a, b) => {
          return b.price - a.price;
        });
      }
  
      return res.status(200).send({ status: true, message: "Success", data: allProducts });
    } catch (error) {
      return res.status(500).send({ status: false, error: error.message });
    }
  };



//___________________________________ getProductById (get API) ________________________________

const getProductById = async function (req, res) {
    try {
        let productId = req.params.productId

        if (!isValidObjectId(productId)) return res.status(400).send({ status: false, message: "Please give a valid productId" })

        let product = await productModel.findOne({ _id: productId, isDeleted: false })

        if (!product) {
            return res.status(404).send({ status: false, message: "Product not found" })
        }

        return res.status(200).send({ status: true, message: "Success", data: product })

    } catch (error) {
        return res.status(500).send({ status: false, error: error.message })
    }

}

//____________________________ updateProduct (put)API ___________________________________________

const updateProduct = async function (req, res) {
    try {
        let data = req.body
        let productID = req.params.productId
        let productImage = req.files

        if (Object.keys(data).length === 0 &&  !req.files) {
            return res.status(400).send({ status: false, message: "please provide details for the Product updation" })
        }
        if (!isValidObjectId(productID)) return res.status(400).send({ status: false, message: "Given productID is not valid" })

        let product = await productModel.findOne({ _id: productID, isDeleted: false })
        if (!product) return res.status(404).send({ status: false, message: "Product not found" })

        var { installments, availableSizes, currencyFormat, currencyId, price,  title } = data

        if (title) {
            let uniqueTitle = await productModel.findOne({ title: title })
            if (uniqueTitle) {
                return res.status(400).send({ status: false, message: "title already exist" })
            }
        }

        if (price) {
            if (!regexPrice.test(price)) {
                return res.status(400).send({ status: false, message: "please provide valid price" })
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

     
            let uploadedFileURL
         if(req.files && req.files.length>0 && req.files[0].fieldname=="productImage"){
             uploadedFileURL = await uploadFile(productImage[0])

                   data["productImage"] = uploadedFileURL
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
                return res.status(400).send({ status: false, message: "installments should be in number format" })
            }
        }

        let updatedProduct = await productModel.findOneAndUpdate({ _id: productID }, { $set: data }, { new: true })
        return res.status(200).send({ status: true, message: "Product updated successfully", data: updatedProduct })
    } catch (error) {
        return res.status(500).send({ status: false, error: error.message })
    }
}


//__________________________ deleteProductById (delet)API __________________________________________
const deleteProductbyId = async function (req, res) {
    try {
        let productId = req.params.productId


        if (!isValidObjectId(productId)) {
            return res.status(400).send({ status: false, message: "productId is not valid " })
        }
        const product = await productModel.findOne({ _id: productId, isDeleted: false })
        if (!product) {
            return res.status(404).send({ status: false, message: "product not found" })
        }

        await productModel.updateOne({ _id: productId, isDeleted: false }, { $set: { isDeleted: true, deletedAt: new Date() } })
        return res.status(200).send({ status: true, message: "product deleted successfully" })
    }
    catch (error) {
        return res.status(500).send({ status: false, error: error.messag })
    }
}




module.exports = { createProduct, updateProduct, getProductById, getProductByQuery, deleteProductbyId }
