const express = require('express')
const app = express()

app.set('view engine', 'ejs')
   
app.listen(3000)

// ARA KATMANLAR
app.use(express.static('public'))

app.use((req,res,next) => {
    console.log(req.method)
    next()
})

app.get('/', function (req, res) {
    res.render('index', {title: 'Ana sayfa'})
})

app.get('/wallet', function (req, res) {
    res.render('wallet', {title: 'Cüzdanım'})
})

app.get('/myproducts', function (req, res) {
    res.render('myproducts', {title: 'Ürünlerim'})
})

app.get('/admin', function (req, res) {
    res.render('admin', {title: 'Admin Panel'})
})

app.get('/login', function (req, res) {
    res.render('login', {title: 'Giriş Yap'})
})

app.get('/signup', function (req, res) {
    res.render('signup', {title: 'Kayıt Ol'})
})