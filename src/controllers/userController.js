const jwt = require('jsonwebtoken')

const userModel = require('../models/userModel')
const { uploadFile } = require("../awsConfigure/aws")
const bcrypt = require("bcrypt");
const { isValid, checkObject, regexName, regexPhone, regexEmail, regexPassword, regexPincode, isValidObjectId } = require('../validators/validator')








const createUser = async function (req, res) {
    try {
        let data = req.body
        const { fname, lname, email, password, address, phone } = data
        if (Object.keys(data).length === 0) {
            return res.status(400).send({ status: false, msg: "please provide something to create user" })
        }

        if (!fname) {
            return res.status(400).send({ status: false, msg: "please provide name in proper format" })
        }
        if (!regexName.test(fname)) {
            return res.status(400).send({ status: false, msg: "please provide valid name " })
        }
        // ***********************************
        if (!lname) {
            return res.status(400).send({ status: false, msg: "please provide lname in proper format" })
        }
        if (!regexName.test(lname)) {
            return res.status(400).send({ status: false, msg: "please provide valid lname " })
        }
        // **********************************

        if (!email) {
            return res.status(400).send({ status: false, msg: "please provide email in proper format" })
        }
        if (!regexEmail.test(email)) {
            return res.status(400).send({ status: false, msg: "please provide valid email" })
        }
        const duplicateEmail = await userModel.findOne({ email })
        if (duplicateEmail) {
            return res.status(400).send({ status: false, msg: "email is already registered" })
        }
        // ***********************************
        if (!password) {
            return res.status(400).send({ status: false, msg: "please provide password in proper format" })
        }
        if (!regexPassword.test(password)) {
            return res.status(400).send({ status: false, msg: "please provide valid password" })
        }
        // ********************************
        if (!phone) {
            return res.status(400).send({ status: false, msg: "please provide phone in proper format" })
        }
        if (!regexPhone.test(phone)) {
            return res.status(400).send({ status: false, msg: "please provide valid phone number" })
        }
        const duplicatePhone = await userModel.findOne({ phone })
        if (duplicatePhone) {
            return res.status(400).send({ status: false, msg: "phone number is already registered" })
        }
        // **************************************

        if (address) {

            if (typeof address != "object")
                return res.status(400).send({ status: false, message: "address is in incorrect format" })

            if (address.shipping) {

                if (!address.shipping.street) {
                    return res.status(400).send({ status: false, message: "shipping street is required" })
                }
                if (!regexName.test(address.shipping.city)) {
                    return res.status(400).send({ status: false, message: "shipping city is in incorrect format" })
                }

                if (!address.shipping.pincode) {
                    return res.status(400).send({ status: false, msg: " shipping pincode is required" })
                }

                if (!regexPincode.test(address.shipping.pincode)) {
                    return res.status(400).send({ status: false, message: " shipping Pincode should be 6 characters long" })
                }
            }

            // +++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
            if (address.billing) {
                if (!address.billing.street) {
                    return res.status(400).send({ status: false, message: "billing street is required" })
                }
                if (!regexName.test(address.billing.city)) {
                    return res.status(400).send({ status: false, message: "billing city is in incorrect format" })
                }

                if (!address.billing.pincode) {
                    return res.status(400).send({ status: false, msg: " billing pincode is required" })
                }
                if (!regexPincode.test(address.billing.pincode)) {
                    return res.status(400).send({ status: false, message: " billing Pincode should be 6 characters long" })
                }
            }
        }
        // ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++=
        let files = req.files

        if (files.length == 0) {
            return res.status(400).send({ status: false, message: "Please Provide The Profile Image" });
        }

        const uploadedProfileImage = await uploadFile(files[0])

        const newpass = await bcrypt.hash(password, 10)

        data["profileImage"] = uploadedProfileImage

        data["password"] = newpass


        let userData = await userModel.create(data)
        return res.status(201).send({ status: true, message: "User created successfully", data: userData })
    }
    catch (error) {
        return res.status(500).send({ status: false, error: error.message })
    }
}
// ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
const userLogin = async function (req, res) {
    try {
        const data = req.body
        const { email, password } = data

        if (!email) {
            return res.status(400).send({ status: false, message: 'please provide email' })
        }

        let user = await userModel.findOne({ email })
        if (!user) {
            return res.status(400).send({ status: false, message: 'email or password incorrect' })
        }
        let hashedPassword = await bcrypt.compare(password, user.password)
        if (!hashedPassword) return res.status(400).send({ status: false, message: "password doesn't match" })

        let token = jwt.sign({
            userId: user._id,
           
        }, 'project-5-group-57',
          { expiresIn: "1hr" }) 

         
        let Object = { userId: user._id, token: token }

        res.status(201).send({ status: true, message: 'token created successfully', data: Object })


    } catch (error) {
        return res.status(500).send({ status: false, error: error.message })
    }
}

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


const updateuser = async function (req, res) {
    let data = req.body
    let id = req.params.userId
    const { fname, lname, email, password, phone, file, address } = data


    if (!isValidObjectId(id)) return res.status(400).send({ status: false, message: "given UserId is not valid" })

    let User = await userModel.findById(id)
    if (!User) return res.status(404).send({ status: false, message: "user not found" })

    if (fname) {
        if (!regexName.test(fname)) {
            return res.status(400).send({ status: false, msg: "please provide valid name " })
        }
    }
    // ***********************************
    if (lname) {
        if (!regexName.test(lname)) {
            return res.status(400).send({ status: false, msg: "please provide valid lname " })
        }
    }
    // **********************************

    if (email) {
        if (!regexEmail.test(email)) {
            return res.status(400).send({ status: false, msg: "please provide valid email" })
        }
        const duplicateEmail = await userModel.findOne({ email })
        if (duplicateEmail) {
            return res.status(400).send({ status: false, msg: "email is already registered" })
        }
    }
    // ***********************************
    if (password) {
        if (!regexPassword.test(password)) {
            return res.status(400).send({ status: false, msg: "please provide valid password" })
        }
        const newpass = await bcrypt.hash(password, 10)

        data["password"] = newpass
    }
    // ********************************
    if (phone) {
        if (!regexPhone.test(phone)) {
            return res.status(400).send({ status: false, msg: "please provide valid phone number" })
        }
        const duplicatePhone = await userModel.findOne({ phone })
        if (duplicatePhone) {
            return res.status(400).send({ status: false, msg: "phone number is already registered" })
        }
    }
    // **************************************

    if (address) {

        if (address.shipping) {
            if (address.shipping.street) {
                if (!regexName.test(address.shipping.street)) {
                    return res.status(400).send({ status: false, message: "shipping street is in incorrect format" })
                }
            }
            if (address.shipping.city) {
                if (!regexName.test(address.shipping.city)) {
                    return res.status(400).send({ status: false, message: "shipping city is in incorrect format" })
                }
            }


            if (address.shipping.pincode) {
                if (!regexPincode.test(address.shipping.pincode)) {
                    return res.status(400).send({ status: false, message: " shipping Pincode should be 6 characters long" })
                }
            }
        }

        // +++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
        if (address.billing) {
            if (address.shipping.street) {
                if (!regexName.test(address.billing.street)) {
                    return res.status(400).send({ status: false, message: "billing street is in incorrect format" })
                }
            }

            if (address.shipping.city) {
                if (!regexName.test(address.billing.city)) {
                    return res.status(400).send({ status: false, message: "billing city is in incorrect format" })
                }
            }

            if (address.shipping.pincode) {
                if (!regexPincode.test(address.billing.pincode)) {
                    return res.status(400).send({ status: false, message: " billing Pincode should be 6 characters long" })
                }
            }
        }
    }
    // ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++=


    if (file) {
        let file = req.files

        if (file.length > 0) {
            var image = await uploadFile(file[0])
            data["profileImage"] = image
        }
    }

    // const newpass = await bcrypt.hash(password, 10)

    // data["password"] = newpass


    let updateuser = await userModel.findOneAndUpdate({ _id: id }, { $set: data }, { new: true })

    return res.send({ status: true, message: "user updated successfully", data: updateuser })

}

module.exports = { createUser, userLogin, updateuser, getUserById }