// User.js race condition 
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    username: {
          type: String,
          required: true,
          unique: true,
    },
    email: {
       type: String,
       required: true,
       unique: true,
    },
    password:{
        type: String,
        required: function(){
            return !this.googleId; //solo obligatorio si no hay googleId osea si no viene de google
        },
    },
    role:{
        type: String,
        enum: ['user', 'admin'],
        default: 'user',
    },
    googleId:{
        type: String,
        unique: true, 
        sparse: true, // permite que sea nulo o undefined
    },
    createdAt:{
        type: Date,
        default: Date.now,
    },


});

module.exports = mongoose.model('User', userSchema);