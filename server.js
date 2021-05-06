const express = require('express') // server kurmak için
const app = express()
const mongoose = require('mongoose') // mongoDB ile bağlantı kurmak için
const cookieParser = require('cookie-parser') // cookie yi decode etmek için
const Products = require('./models/Products') // modelleri kullanabilmek için
const Wallets = require("./models/wallets")
const Requests = require("./models/requests")
const User = require('./models/users')
const adminRoutes = require('./routes/adminRoutes') // routesları kullanabilmek için
const authRoutes = require('./routes/authRoutes')
const {requireAuth, checkUser} = require('./middlewares/authMiddleware') // ara katmanlar
const tradeController = require('./controllers/tradeController') // alış-satış kontrollerini kullanabilmek için
const Trades = require('./models/trades')



const dbURL = 'mongodb+srv://efe:asd123@nodeblog.bn5fb.mongodb.net/node-blog?retryWrites=true&w=majority' // veri tabanı bağlantısı için gerekli olan link
mongoose.connect(dbURL, { useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex: true}) // veri tabanı bağlantısı
    .then((result) => app.listen(3000))
    .catch((err) => console.log(err))

app.set('view engine', 'ejs') // görüntüleme motoru
   


// ARA KATMANLAR
mongoose.set('useFindAndModify', false) // MONGOOSE tan warning almamak için
app.use(express.static('public'))
app.use(express.urlencoded({extended: true})) //body request parse edebilmek için
app.use((req,res,next) => {
    console.log(req.method)
    next()
})
app.use('/',authRoutes)
app.use('/admin',adminRoutes) // ikinci parametre sayesinde sadece admin kullanıcılar giriş ypaabilir
app.use(cookieParser())

app.get('*', checkUser)

app.get('/deleterequest', function(req,res){ // delete all requests
    Requests.findOneAndDelete()
    .then((result) => {
        console.log(result)
        res.redirect("/")
    })
})

app.get('/', function (req, res) {
    if(res.locals.user){
        Requests.find({"userID": res.locals.user.username}) // kullanıcının istek listesi
        .then((result) => {
            const request = result
            Trades.find().sort({createdAt: -1}) // gerçekleşen alım satımlar
            .then((result) => {
                 res.render('index', {title: 'Ana sayfa', user: res.locals.user, request: request, trade: result})
            })
            
        })
        .catch((err) => {
            console.log(err)
        })
        
    }
    else{
        res.redirect('/login')
    }
})

app.post('/', function (req,res){
    const request = new Requests({ // yeni request oluştur
        userID: req.body.username,
        product: req.body.product,
        amount: req.body.amount
    })
    request.save()
    .then((result) => {
        tradeController.whenNewRequest(result)
        res.redirect('/')
    })
    .catch((err) => {
        console.log(err)
    })
})

app.get('/wallet', function (req, res) {
    Wallets.find({"userID": res.locals.user.username}) // cüzdan bilgisini sayfaya gönder
        .then((result) => {
            res.render('wallet', {title: 'Cüzdanım', wallet: result})
        })
        .catch((err) => {
            console.log(err)
        })
    
})

app.post('/wallet', function (req, res) { // Bakiye güncelleme talebi
    const wallet = new Wallets({
        userID: req.body.username,
        amount: req.body.amount,
        verified: false
    }) 
    console.log(req.body.username)
    wallet.save()
    res.redirect('/wallet')
})


app.get('/myproducts', function (req, res) {
    Products.find({"userID": res.locals.user.username}).sort({createdAt: -1})
        .then((result) => {
            res.render('myproducts', {title: 'Ürünlerim', products: result, user: res.locals.user}) // Sayfada kullanabilmek için products değişkeni oluşturduk
        })
        .catch((err) => {
            console.log(err)
        })
})

app.post('/myproducts', function (req, res){ // POST etme
    const newProduct = new Products({
        userID: req.body.username,
        product: req.body.product,
        amount: req.body.amount,
        price: req.body.price,
        verified: false
    })
    newProduct.save()
        .then((result) => {
            res.redirect('/myproducts')
        })
        .catch((err) => {
            console.log(err)
        })
})

app.post('/verifywallet', function(req,res){
    Wallets.findOneAndDelete({userID: req.body.userID}, function (err, deletedWallet){ // kullanıcın doğrulanmış son walletını siler
        if(err){
            console.log(err)
        }
        else{
            console.log("deleted", deletedWallet)

            Wallets.findByIdAndUpdate(req.body._id,{$set: {verified: true}}, function(err,newWallet){ // ilgili wallet ı doğrular
                if(err){
                    console.log(err)
                }else{
                    console.log(newWallet.userID)
                    Wallets.find({"verified": "false"}) // cüzdanları bul
                        .then((result) => {
                            var walletResult = result

                            Products.find({"verified": "false"}) // cüzdan bulma başarılıysa ürünleri bul
                            .then((result) => {
                                var productResult = result
                                res.redirect('/admin')
                            })
                            .catch((err) => {
                                console.log(err)
                            })
                        })
                        .catch((err) => {
                            console.log(err)
                        })
                }
            })
        }
    })

})

app.post('/verifyproduct', function(req,res){
       
    
    Products.findByIdAndUpdate(req.body._id,{$set: {verified: true}}, function(err,updatedProduct){
       if(err){
           console.log(err)
       }
       else{
            console.log("The product verified!", updatedProduct)

            Products.find({"verified": "false"}) // yönlendirme
            .then((result) => {
                res.redirect('/admin')
            })
            .catch((err) => {
                console.log(err)
            })
       }
    }) 
    
})
