const Products = require('../models/Products')
const Wallets = require("../models/wallets")
const Requests = require("../models/requests")
const Trades = require("../models/trades")

const whenNewRequest = (request) => {
    console.log("Alinmak istenen urun: " + request.product)

    Products.find({"product": request.product, "price": {$lte: request.price}, "minAmount": {$lte: request.amount} }).sort({price: 1}) // fiyata göre sıralandı
        .then((result) => {

            var requestedProduct = result // satın almak istenilen ürün
            var requestedAmount = request.amount // satın alınmak istenen ürünün miktarı

            Wallets.findOne({"userID": request.userID, "verified": true}) // kullanıcının cüzdanını bul
                .then((result) => {
                    var buyersWallet = result
                    var walletAmount = buyersWallet.amount // kullanıcının cüzdan bakiyesi
                    
                    console.log("Toplam bulunan urun: ", requestedProduct.length)
                    console.log("Kullanici baslangic para: ", walletAmount)
                    console.log("Alinmak istenen baslangic urun miktarı: ", requestedAmount)
                   
                    var i, amountSold, tPrice, productTotalPrice
                        
                    for(i=0;i<requestedProduct.length;i++){
                       
                        // alıcının alacağı ürün, satıcının elindeki üründen fazla mı az mı?
                        if(requestedAmount >= requestedProduct[i].amount){ 
                            productTotalPrice = requestedProduct[i].amount*requestedProduct[i].price
                        }else{
                            productTotalPrice = requestedAmount*requestedProduct[i].price
                        }

                        console.log("Alıcının cebinden cikacak para: ", productTotalPrice)

                        if(requestedAmount > 0 && walletAmount >= productTotalPrice){

                            console.log("Kacinci urun: ", i+1, "Alinmak istenen kalan urun miktari:", requestedAmount)
                            

                            if(requestedAmount >= requestedProduct[i].amount){
                                requestedAmount -= requestedProduct[i].amount
                                
                                amountSold = requestedProduct[i].amount // satışı gerçekleşen miktar
                                tPrice = amountSold*requestedProduct[i].price // satış fiyatını hesapla

                                //product u sil
                                Products.findOneAndDelete({"_id": requestedProduct[i]._id})
                                .then((result) => {
                                    console.log("Ürün silindi!")
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
                                        console.log("Satılan ürün güncellemesi: ", updatedProduct)
                                    }
                                })
                                
                                // requestedAmount sıfırlandı
                                requestedAmount = 0
                            }
                            
                            var date = new Date()  // dateStr you get from mongodb
                            var d = date.getUTCDate()
                            var m = date.getUTCMonth()+1
                            var y = date.getUTCFullYear()
                            var tradeDate = y+""+m+""+d
                            // SATIŞ GERÇEKLEŞTİĞİNDE YENİ TRADE KAYDI OLUŞTUR 
                            const newTrade = new Trades({
                                sellerID: requestedProduct[i].userID,
                                buyerID: request.userID,
                                product: request.product,
                                amount: amountSold,
                                tarih: tradeDate,
                                totalPrice: tPrice
                            })
                            newTrade.save()

                            // SATIŞ SONRASI ALICININ CÜZDANINI GÜNCELLE

                            var komisyonluUcret = Math.floor(tPrice*1.1) // %1 lik komisyon alınıyor
                            walletAmount -= komisyonluUcret
                            
                            // MUHASEBECİ CÜZDAN GÜNCELEME
                            var muhasebeciPara = komisyonluUcret - tPrice // komisyonlu ücretten satıcıya giden parayı cıkarıp muhasebeciye giden parayı alıyoruz
                            Wallets.findOneAndUpdate({"userID": "muhasebeci", "verified": true},{$inc: {amount: muhasebeciPara}}, function(err,updatedAccounterWallet){ 
                                if(err){
                                    console.log(err)
                                }
                                else{
                                    console.log("Komisyon geliri: ", muhasebeciPara)
                                }
                            })
                            
                            // SATICININ CÜZDANINI GÜNCELLEME
                            Wallets.findOneAndUpdate({"userID": requestedProduct[i].userID, "verified": true},{$inc: {amount: tPrice}}, function(err,updatedSellerWallet){ 
                                if(err){
                                    console.log(err)
                                }
                                else{
                                    console.log("Satıcı geliri: ", tPrice)
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
                            console.log("Alıcı gideri:", komisyonluUcret)
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
                                console.log("Request guncellendi!")
                            }
                        })
                    } 
                    // Kullanıcının istediği ürün miktarı karşılandıysa
                    else{
                        Requests.findByIdAndDelete(request._id)
                        .then((result) => {
                            console.log(result)
                        })
                        console.log("Request silinmeli!")
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