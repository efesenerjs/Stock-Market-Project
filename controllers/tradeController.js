const Products = require('../models/Products')
const Wallets = require("../models/wallets")
const Requests = require("../models/requests")
const Trades = require("../models/trades")

const whenNewRequest = (request) => {
    console.log(request.product)

    Products.find({"product": request.product}).sort({price: 1}) // fiyata göre sıralandı
        .then((result) => {

            var requestedProduct = result // satın almak istenilen ürün
            var requestedAmount = request.amount // satın alınmak istenen ürünün miktarı

            Wallets.findOne({"userID": request.userID, "verified": true}) // kullanıcının cüzdanını bul
                .then((result) => {
                    var buyersWallet = result
                    var walletAmount = buyersWallet.amount // kullanıcının cüzdan bakiyesi
                    
                    console.log(requestedProduct.length)
                    console.log("baslangic bakiye",walletAmount)
                    console.log("baslangic amount", requestedAmount)
                   
                    var i, amountSold, tPrice, productTotalPrice
                        
                    for(i=0;i<requestedProduct.length;i++){

                        productTotalPrice = requestedProduct[i].amount*requestedProduct[i].price

                        if(requestedAmount > 0 && walletAmount >= productTotalPrice){

                            console.log(i, requestedAmount)
                            console.log("requested amount son", requestedProduct[i].amount)

                            if(requestedAmount >= requestedProduct[i].amount){
                                requestedAmount -= requestedProduct[i].amount
                                
                                amountSold = requestedProduct[i].amount // satışı gerçekleşen miktar
                                tPrice = amountSold*requestedProduct[i].price // satış fiyatını hesapla

                                //product u sil
                                Products.findOneAndDelete({"_id": requestedProduct[i]._id})
                                .then((result) => {
                                    console.log("product silindi")
                                })
                                .catch((err) => {
                                    console.log(err)
                                })
                            }
                            else{
                                amountSold = requestedAmount // satışı gerçekleşen miktar
                                tPrice = amountSold*requestedProduct[i].price // satış fiyatını hesapla
                                //productu güncelle
                                Products.findByIdAndUpdate(requestedProduct[i]._id,{$set: {amount: requestedProduct[i].amount-requestedAmount}}, function(err,updatedProduct){
                                    if(err){
                                        console.log(err)
                                    }
                                    else{
                                        console.log("satılan ürün güncellemesi", updatedProduct)
                                    }
                                })
                                
                                // requestedAmount sıfırlandı
                                requestedAmount = 0
                            }
                            
                            // SATIŞ GERÇEKLEŞTİĞİNDE YENİ TRADE KAYDI OLUŞTUR 
                            const newTrade = new Trades({
                                sellerID: requestedProduct[i].userID,
                                buyerID: request.userID,
                                product: request.product,
                                amount: amountSold,
                                totalPrice: tPrice
                            })
                            newTrade.save()

                            // SATIŞ SONRASI ALICININ CÜZDANINI GÜNCELLE
                            walletAmount -= tPrice
                            
                            // SATICININ CÜZDANINI GÜNCELLEME
                            Wallets.findOneAndUpdate({"userID": requestedProduct[i].userID, "verified": true},{$inc: {amount: tPrice}}, function(err,updatedSellerWallet){ 
                                if(err){
                                    console.log(err)
                                }
                                else{
                                    console.log("satıcının cüzdanı güncellendi")
                                }
                            })
                        }
                    }

                    // ALICI CÜZDAN GÜNCELLEME
                    Wallets.findByIdAndUpdate(buyersWallet._id,{$set: {amount: walletAmount}}, function(err,updatedWallet){ 
                        if(err){
                            console.log(err)
                        }
                        else{
                            console.log("request guncellendi")
                        }
                    })

                    // Kullanıcının istediği ürün miktarı karşılanmadıysa 
                    if(requestedAmount>0){
                        // Ürün isteginin miktarı güncellenir
                        Requests.findByIdAndUpdate(request._id,{$set: {amount: requestedAmount}}, function(err,updatedRequest){ 
                            if(err){
                                console.log(err)
                            }
                            else{
                                console.log("request guncellendi")
                            }
                        })
                    } 
                    // Kullanıcının istediği ürün miktarı karşılandıysa
                    else{
                        Requests.findByIdAndDelete(request._id)
                        .then((result) => {
                            console.log(result)
                        })
                        console.log("request silinmeli")
                    }
                           
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
    whenNewRequest
}