const jwt = require('jsonwebtoken')
const mongoose = require('mongoose')
const userModel = require('../models/userModel')


// ______________________ Authentication ____________________________________

const authentication = async function (req, res, next) {
    try {
        let token = req.headers["authorization"]

        if (!token) {
            return res.status(401).send({ status: false, message: 'please provide token' })
        }
        
        let bearerToken = token.split(' ')[1]
               
        jwt.verify(bearerToken, 'project-5-group-57', function (err, decodedToken) {
            if (err) {
                return res.status(401).send({ status: false, message: 'please provide valid token' })
            }
           
            req.loggedInUser = decodedToken.userId
           
            next()
        })

    } catch (err) {
        return res.status(500).send({ status: false, Error: err.message })
    }
}


// ______________________ Authorisation ___________________________________

const authorisation = async function (req, res, next) {
    try {
        let userId = req.params.userId

        if (!mongoose.isValidObjectId(userId)) {
            return res.status(400).send({ status: false, message: 'user id is not valid' })
        }
        let user = await userModel.findById({_id:userId })
        if (!user) {
            return res.status(404).send({ status: false, message: 'user id does not exist' })
        }
        if (userId != req.loggedInUser) {
            return res.status(403).send({ status: false, message: 'not authorised' })
        }
        next()

    } catch (err) {
        return res.status(500).send({ status: false, Error: err.message })
    }
}


module.exports = { authentication, authorisation }



