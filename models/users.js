const mongoose = require('mongoose')
const Schema = mongoose.Schema // mongoose kütüphanesinin schema fonknsiyonu ile veri tablosu oluşturucaz
const bcrypt = require('bcrypt') // şifreyi hash ile saklamak için

const userSchema = new mongoose.Schema({
    username:{
        type: String,
        required: true,
        unique: true
    },
    password:{
        type: String,
        required: true
    },
    name:{
        type: String
    },
    surname:{
        type: String
    },
    tcid:{
        type: String
    },
    phone:{
        type: String
    },
    email:{
        type: String
    },
    address:{
        type: String
    },
})

userSchema.statics.login = async function(username,password){      // kullanıcı giriş kontrlü
    const user = await this.findOne({username})
    if(user){
        const auth = await bcrypt.compare(password, user.password) // gelen şifreyi, encode olmuş şifre ile kontrol et
        if (auth){
            return user
        }else{
            throw Error('Yanlış şifre girdiniz!')
        }
    }else{
        throw Error('Böyle bir kullanıcı bulunamadı!')
    }
}

// allttaki kod blogu çalışmadan projenin devam etmesini istemedigimiz için
// asenktron fonksiyon olarak tanımladık await ile bekleme oluşturduk
userSchema.pre('save', async function(next){ // kaydedilmeden önce 
    const salt = await bcrypt.genSalt() // salt algoritması ile şifreleme
    this.password = await bcrypt.hash(this.password,salt)
    next() // kod blogunu calıştrımayı devam ettir
})

const User = new mongoose.model('user', userSchema)

module.exports = User