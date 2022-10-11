const jwt= require('jsonwebtoken')
const userModel= require('../models/userModel')
const { isValid, checkObject, regexName, regexPhone, regexEmail, regexPassword, regexPincode} = require('../validators/validator')








const createUser= async function (req,res){
    try{
        let data= req.body
        if (Object.keys(data).length===0){
            return res.status(400).send({status:false,msg:"please provide something to create user"})
        }
        if(!isValid(fname)){
            return res.status(400).send({status: false , msg:"please provide name in proper format"})
        }
        if(!regexName.test(fname)){
            return res.status(400).send({status: false , msg:"please provide valid name "})
        }
        
        if(!isValid(lname)){
            return res.status(400).send({status: false , msg:"please provide lname in proper format"})
        }
        if(!regexName.test(lname)){
            return res.status(400).send({status: false , msg:"please provide valid lname "})
        }
        if (!isValid(email)) {
            return res.status(400).send({ status: false, msg: "please provide email in proper format" })
        }
        if (!regexEmail.test(email)) {
            return res.status(400).send({ status: false, msg: "please provide valid email" })
        }
        const duplicateEmail = await userModel.findOne({ email })
        if (duplicateEmail) {
            return res.status(400).send({ status: false, msg: "email is already registered" })
        }
        if (!isValid(password)) {
            return res.status(400).send({ status: false, msg: "please provide password in proper format" })
        }
        if (!regexPassword.test(password)) {
            return res.status(400).send({ status: false, msg: "please provide valid password" })
        }
        if (!isValid(phone)) {
            return res.status(400).send({ status: false, msg: "please provide phone in proper format" })
        }
        if (!regexPhone.test(phone)) {
            return res.status(400).send({ status: false, msg: "please provide valid phone number" })
        }
        const duplicatePhone = await userModel.findOne({ phone })
        if (duplicatePhone) {
            return res.status(400).send({ status: false, msg: "phone number is already registered" })
        }










    }
    catch(err){
        return res.status(500).send({status:false, error: err.message})
    }
}

const userLogin = async function (req, res) {
    try {
        const data = req.body
        const { email, password } = data

        if (!email) {
            return res.status(400).send({ status: false, message: 'please provide email' })
        }
        if (!password) {
            return res.status(400).send({ status: false, message: 'please provide password' })
        }
        let user = await userModel.findOne({ email, password })
        if (!user) {
            return res.status(400).send({ status: false, message: 'email or password incorrect' })
        }
        let token = jwt.sign({
            userId: user._id,
            iat: Math.floor(Date.now() / 1000),
            exp: Math.floor(Date.now() / 1000) + 10 * 60 * 60
        }, 'project-5-group-57')

        //  let exp = "6h"
        // let token = jwt.sign({ userId: userData._id }, "Book management secret key", { expiresIn: exp })

        // res.setHeader("x-api-key", token);
        // let dataT = { token, userId: userData._id, iat: moment(), exp: exp }
        // return res.status(201).send({ status: true, msg: "login successfull", data: dataT })
        res.status(201).send({ status: true, message: 'token created successfully', data: token })


    } catch (err) {
        return res.status(500).send({ status: false, Error: err.message })
    }
}


module.exports = { userLogin }
