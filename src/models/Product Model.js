const mongoose = require('mongoose')

const productSchema = new mongoose.Schema({
    title: { 
        type: String, 
        required: true, 
        unique: true
    },
  description: {
    type: String, 
    required: true
},
  price: {
    type: Number,
     required: true  //number/decimal
    },
  currencyId: {
    type:  String, 
    require: true, 
    default: "INR"
},
  currencyFormat: {
    type: String, 
    require: true, //Rupee symbol
},
  isFreeShipping: {
    type: Boolean, 
     default: false},
  productImage: {
    type: String, 
    required: true
},  // s3 link
  style: String,
  availableSizes: {
    type: [String],  
    enum: ["S", "XS","M","X", "L","XXL", "XL"]},
  installments: Number,
  deletedAt: Date,  
  isDeleted: {
    type: Boolean, 
    default: false
},
   
}, { timestamps: true})

module.exports = mongoose.model('Product', productSchema)