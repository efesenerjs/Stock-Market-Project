const mongoose = require('mongoose')
const Schema = mongoose.Schema

const walletSchema = new Schema({
    userID: {
        type: String,
        require: true
    },
    amount: {
        type: Number,
        default: 0 
    },
    verified: {
        type: Boolean,
        lowercase: true,
        default: true
    }
}, { timestamps: true}) // otomatik olarak verinin eklendigi tarihi kaydeder

const Wallets = mongoose.model('Wallets', walletSchema)
module.exports = Wallets