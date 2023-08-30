const mongoose = require('mongoose')


const isValidObjectId = (ObjectId) => {
    return mongoose.Types.ObjectId.isValid(ObjectId)
}



function isValidStatus(status) {
    return ['completed', 'cancelled'].includes(status);
}


// Regex

const regexName = function (body) {
    const regexName = /^[a-zA-Z ]{2,30}$/
    return regexName.test(body)
}

const regexEmail = function (body) {
    const regexEmail = /^\s*[a-zA-Z0-9]+([\.\-\_\+][a-zA-Z0-9]+)*@[a-zA-Z]+([\.\-\_][a-zA-Z]+)*(\.[a-zA-Z]{2,3})+\s*$/
    return regexEmail.test(body)
}
const regexPassword = function (body) {
       const regexPassword = /^(?=.*\d)(?=.*[!@#$%^&*])(?=.*[a-z])(?=.*[A-Z]).{8,15}$/
    return regexPassword.test(body)
}
const regexPhone = function (body) {
       const regexPhone = /^(\+91[\-\s]?)?[0]?(91)?[6789]\d{9}$/
    return regexPhone.test(body)
}
const regexPincode = function (body) {
      const regexPincode = /^[1-9][0-9]{5}$/
    return regexPincode.test(body)
}
const regexNumber = function (body) {
       const regexNumber = /^\d+$/
    return regexNumber.test(body)
}

const regexPrice = function (body) {
    const regexPrice = /^[1-9][0-9.]+$/
    return regexPrice.test(body)
}


module.exports = { isValidObjectId, isValidStatus, regexName, regexEmail, regexPassword, 
    regexPhone, regexPincode, regexPrice, regexNumber }
