const mongoose = require('mongoose')


const isValidObjectId = (ObjectId) => {
    return mongoose.Types.ObjectId.isValid(ObjectId)
}



function isValidStatus(status) {
    return ['completed', 'cancelled'].includes(status);
}


// Regex

const regexName = /^[a-zA-Z ]{2,30}$/

const regexEmail = /^\s*[a-zA-Z0-9]+([\.\-\_\+][a-zA-Z0-9]+)*@[a-zA-Z]+([\.\-\_][a-zA-Z]+)*(\.[a-zA-Z]{2,3})+\s*$/

const regexPassword = /^(?=.*\d)(?=.*[!@#$%^&*])(?=.*[a-z])(?=.*[A-Z]).{8,15}$/

const regexPhone = /^(\+91[\-\s]?)?[0]?(91)?[6789]\d{9}$/

const regexPincode = /^[1-9][0-9]{5}$/

const regexPrice = /^[1-9][0-9.]+$/

const regexNumber = /^\d+$/


module.exports = { isValidObjectId, isValidStatus, regexName, regexEmail, regexPassword, regexPhone, regexPincode, regexPrice, regexNumber }
