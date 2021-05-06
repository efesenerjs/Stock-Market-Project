const mongoose = require('mongoose')
const Schema = mongoose.Schema // mongoose kütüphanesinin schema fonknsiyonu ile veri tablosu oluşturucaz

const tradeSchema = new Schema({
    sellerID: {
        type: String
    },
    buyerID: {
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
    totalPrice: {
        type: Number,
        lowercase: true
    }
}, { timestamps: true}) // otomatik olarak verinin eklendigi tarihi kaydeder

const Trades = mongoose.model('Trades', tradeSchema)
module.exports = Trades