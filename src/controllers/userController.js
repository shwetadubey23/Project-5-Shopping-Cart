const userModel = require('../models/userModel')
const jwt = require('jsonwebtoken')


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

        res.status(201).send({ status: true, message: 'token created successfully', data: token })


    } catch (err) {
        return res.status(500).send({ status: false, Error: err.message })
    }
}


module.exports = { userLogin }