const express = require('express')
const mongoose = require('mongoose')
const route = require('./route/route')
const app = express()
const multer = require("multer")

app.use(multer().any())

app.use(express.json())

mongoose.connect('mongodb+srv://Shwetadubey:QvtqJ8hdhmn0fhlT@cluster0.ymyddly.mongodb.net/group57Database'
,{useNewUrlParser: true})

.then(() => console.log('MongoDB is connected'))
.catch(err => console.log(err))

app.use('/', route)

app.listen( 3000, function(){
    console.log('Express app running on port ' + (3000))
})