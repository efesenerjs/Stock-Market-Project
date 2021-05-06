const User = require("../models/users")
const Wallets = require("../models/wallets")
const jwt = require('jsonwebtoken')

const maxAge= 60*60*24 // 1 güne denk gelir
const createToken = (id) => {
    return jwt.sign({id}, 'gizli kelime', {expiresIn: maxAge}) // süreli bir token oluştur
}

const login_get = (req,res) => {
    res.render('login', {title: 'Giriş Yap', user: res.locals.user})
}

const login_post = async (req,res) => {
    const {username, password} = req.body
    try{
        const user = await User.login(username, password) // username passwordu kontrole yolla
        const token = createToken(user._id) // token oluştur
        res.cookie('jwt',token,{httpOnly:true, maxAge: maxAge * 1000}) // https üzerinde çalışırsak secure: true yaparız
      
        if(username == 'admin')   // admin kontrol
            res.redirect('/admin')
        else 
            res.redirect('/')
    }catch(e){
        console.log(e)
    }
}

const signup_get = (req,res) => {
    res.render('signup', {title: 'Kayıt Ol', user: res.locals.user})
}

const signup_post = (req,res) => {
    const user = new User(req.body)
    user.save()
        .then((result) => {
            const wallet = new Wallets({
                userID: user.username
            }) // kullanıcı yaratılınca cüzdan yarat
            wallet.save()
            res.redirect('/login')
        })
        .catch((err) => {
            console.log(err)
        })
    
        
}

const logout_get = (req,res) => {
    res.cookie('jwt','',{maxAge:1}) // cookie yi sıfırla
    res.redirect('/login')
}



module.exports = {
    login_get,
    login_post,
    signup_get,
    signup_post,
    logout_get
}