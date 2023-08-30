const jwt = require('jsonwebtoken')
const userModel = require('../models/userModel')
const { uploadFile } = require("../awsConfigure/aws")
const bcrypt = require("bcrypt");
const { regexName, regexPhone, regexEmail, regexPassword, regexPincode,
    isValidObjectId } = require('../validators/validator');
const cartModel = require('../models/cartModel');


//_______________________________ createUser (post)API ______________________________________________ 

const createUser = async function (req, res) {
    try {
        let data = req.body
        const { fname, lname, email, password, address, phone } = data


        if (!fname || !lname || !email || !password || !phone) {
            return res.status(400).send({
                status: false, message:
                    `please provide required field [fname, lname, email, password, phone ]`
            })
        }
        if (!regexName(fname)) {
            return res.status(400).send({ status: false, message: "please provide valid name " })
        }

        if (!regexName(lname)) {
            return res.status(400).send({ status: false, message: "please provide valid lname" })
        }

        if (!regexEmail(email)) {
            return res.status(400).send({ status: false, message: "please provide valid email" })
        }
        if (!regexPhone(phone)) {
            return res.status(400).send({ status: false, message: "please provide valid phone number" })
        }

        const duplicateData = await userModel.findOne({ $or: [{ email: email }, { phone: phone }] })
        if (duplicateData) {
            if (duplicateData.email === email) {
                return res.status(400).send({ status: false, message: "email is already registered" })
            }
            else {
                return res.status(400).send({ status: false, message: "phone number is already registered" })
            }
        }
        if (!regexPassword(password)) {
            return res.status(400).send({ status: false, message: "please provide valid password" })
        }

        if (address) {

            if (address.shipping) {

                if (!address.shipping.street) {
                    return res.status(400).send({ status: false, message: "shipping street is required" })
                }
                if (!address.shipping.city) {
                    return res.status(400).send({ status: false, message: "shipping city is required" })
                }
                if (!regexName(address.shipping.city)) {
                    return res.status(400).send({ status: false, message: "shipping city is in incorrect format" })
                }

                if (!address.shipping.pincode) {
                    return res.status(400).send({ status: false, message: " shipping pincode is required" })
                }

                if (!regexPincode(address.shipping.pincode)) {
                    return res.status(400).send({ status: false, message: "shipping Pincode is in incorrect format" })
                }
            }
            if (address.billing) {
                if (!address.billing.street) {
                    return res.status(400).send({ status: false, message: "billing street is required" })
                }
                if (!address.billing.city) {
                    return res.status(400).send({ status: false, message: "billing city is required" })
                }
                if (!regexName(address.billing.city)) {
                    return res.status(400).send({ status: false, message: "billing city is in incorrect format" })
                }

                if (!address.billing.pincode) {
                    return res.status(400).send({ status: false, message: "billing pincode is required" })
                }
                if (!regexPincode(address.billing.pincode)) {
                    return res.status(400).send({ status: false, message: "billing Pincode is in incorrect format" })
                }
            }
        }
        let files = req.files

        if (files.length == 0) {
            return res.status(400).send({ status: false, message: "Please Provide The Profile Image" });
        }

        const uploadedProfileImage = await uploadFile(files[0])

        const newpass = await bcrypt.hash(password, 10)

        data["profileImage"] = uploadedProfileImage

        data["password"] = newpass


        let userData = await userModel.create(data)
        const cartData = {}
        cartData.userId = userData._id
        cartData.items = []
        cartData.totalPrice = 0
        cartData.totalItems = 0
        await cartModel.create(cartData)
        return res.status(201).send({ status: true, message: "User created successfully", data: userData })
    }
    catch (error) {
        return res.status(500).send({ status: false, error: error.message })
    }
}

// ++++++++++++++++++++++++++++++++++++ login Api  +++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++


const userLogin = async function (req, res) {
    try {
        const data = req.body
        const { email, password } = data


        if (!email || !password) {
            return res.status(400).send({ status: false, message: 'please provide email and password' })
        }

        let user = await userModel.findOne({ email })
        if (!user) {
            return res.status(400).send({ status: false, message: 'email does not exist' })
        }
        let hashedPassword = await bcrypt.compare(password, user.password)
        if (!hashedPassword) return res.status(400).send({ status: false, message: "password doesn't match" })

        let token = jwt.sign({
            userId: user._id,

        }, 'project-5-group-57',
            { expiresIn: "5hr" })


        let obj = { userId: user._id, token: token }

        res.status(201).send({ status: true, message: 'token created successfully', data: obj })


    } catch (error) {
        return res.status(500).send({ status: false, error: error.message })
    }
}

// ----------------------------------- Get Api --------------------------------------------------------


const getUserById = async function (req, res) {
    try {
        let userId = req.params.userId
        if (!isValidObjectId(userId)) return res.status(400).send({ status: false, msg: "Please give a Valid userId " })
        let userProfile = await userModel.findById({ _id: userId })
        if (!userProfile) {
            return res.status(404).send({ status: false, msg: "userProfile not found" })
        }

        return res.status(200).send({ status: true, message: "data fetched successfully", data: userProfile })

    } catch (error) {
        return res.status(500).send({ status: false, error: error.message })
    }
}

//---------------------------------------- put Api -------------------------------------------------------

const updateuser = async function (req, res) {
    try {
        let data = req.body
        let id = req.params.userId
        const { fname, lname, email, password, phone, file, address } = data


        if (!isValidObjectId(id)) return res.status(400).send({ status: false, message: "given UserId is not valid" })

        let User = await userModel.findById(id)
        if (!User) return res.status(404).send({ status: false, message: "user not found" })

        if (fname) {
            if (!regexName(fname)) {
                return res.status(400).send({ status: false, msg: "please provide valid name " })
            }
        }
        if (lname) {
            if (!regexName(lname)) {
                return res.status(400).send({ status: false, msg: "please provide valid lname " })
            }
        }

        if (email) {
            if (!regexEmail(email)) {
                return res.status(400).send({ status: false, msg: "please provide valid email" })
            }
            const duplicateEmail = await userModel.findOne({ email })
            if (duplicateEmail) {
                return res.status(400).send({ status: false, msg: "email is already registered" })
            }
        }
        if (password) {
            if (!regexPassword(password)) {
                return res.status(400).send({ status: false, msg: "please provide valid password" })
            }
            const newpass = await bcrypt.hash(password, 10)

            data["password"] = newpass
        }
        if (phone) {
            if (!regexPhone(phone)) {
                return res.status(400).send({ status: false, msg: "please provide valid phone number" })
            }
            const duplicatePhone = await userModel.findOne({ phone })
            if (duplicatePhone) {
                return res.status(400).send({ status: false, msg: "phone number is already registered" })
            }
        }
        if (address) {

            if (address.shipping) {

                if (address.shipping.city) {
                    if (!regexName(address.shipping.city)) {
                        return res.status(400).send({ status: false, message: "shipping city is in incorrect format" })
                    }
                }
                if (address.shipping.pincode) {
                    if (!regexPincode(address.shipping.pincode)) {
                        return res.status(400).send({ status: false, message: " shipping Pincode is in incorrect format" })
                    }
                }
            }

            if (address.billing) {

                if (address.shipping.city) {
                    if (!regexName(address.billing.city)) {
                        return res.status(400).send({ status: false, message: "billing city is in incorrect format" })
                    }
                }

                if (address.shipping.pincode) {
                    if (!regexPincode(address.billing.pincode)) {
                        return res.status(400).send({ status: false, message: " billing Pincode is in incorrect format" })
                    }
                }
            }
        }

        let files = req.files
        if (files) {

            if (files.length == 0) {
                return res.status(400).send({ status: false, message: "Please Provide The Profile Image" });
            }
            var image = await uploadFile(files[0])
            data["profileImage"] = image
        }

        let updateuser = await userModel.findOneAndUpdate({ _id: id }, { $set: data }, { new: true })

        return res.status(200).send({ status: true, message: "user updated successfully", data: updateuser })

    } catch (err) {
        return res.status(500).send({ status: false, error: err.message })
    }
}

module.exports = { createUser, userLogin, updateuser, getUserById }