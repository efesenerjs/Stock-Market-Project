const Products = require('../models/Products')
const checkUser = require('../middlewares/authMiddleware')
const Wallets = require('../models/wallets')
const Trades = require('../models/trades')

const admin_index = function (req, res) {
    Wallets.find({"verified": "false"}) // cüzdanları bul
        .then((result) => {
            var walletResult = result

            Products.find({"verified": "false"}) // cüzdan bulma başarılıysa ürünleri bul
            .then((result) => {
                var productResult = result
                Trades.find().sort({createdAt: -1})
                 .then((result) => {
                     res.render('admin', {title: 'Admin Panel', wallet: walletResult, product: productResult, trade: result}) // admin sayfasını renderla
                  })
            })
            
            
                 
            
            .catch((err) => {
                console.log(err)
            })
        })
        .catch((err) => {
            console.log(err)
        })
}



module.exports = {
    admin_index
}