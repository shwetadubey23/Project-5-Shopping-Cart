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