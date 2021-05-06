const mongoose = require('mongoose')
const Schema = mongoose.Schema // mongoose kütüphanesinin schema fonknsiyonu ile veri tablosu oluşturucaz

const productSchema = new Schema({
    userID: {
        type: String
    },
    product: {
        type: String,
        lowercase: true
    },
    amount: {
        type: Number,
        lowercase: true
    },
    price: {
        type: Number,
        lowercase: true
    },
    verified: {
        type: Boolean,
        lowercase: true,
        default: false
    }
}, { timestamps: true}) // otomatik olarak verinin eklendigi tarihi kaydeder

const Products = mongoose.model('Products', productSchema)
module.exports = Products