const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    firstName:{
      type:String,
      required:true  
    },
    lastName:{
      type:String,
      required:true
    },
    registerDate:{
        type:Date,
        required: true,
        default: Date.now
    },
    username:{
        type:String,
        required:true
    },
    password:{
        type:String,
        required:true
    },
    phoneNumber:{
        type:Number,
        required:false
    },
    email:{
        type:String,
        required:true
    }
})

module.exports = mongoose.model('User', userSchema)