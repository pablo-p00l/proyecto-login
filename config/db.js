// Database connection
const mongoose = require('mongoose');


const connectDB = async ()=>{
    try{
        await mongoose.connect(process.env.MONGO_URI);
        console.log('MongoDB connected');
    } catch (error){
        console.log('Error al conectar a MongoDB', error.message);
        process.exit(1);
    }
};
module.exports = connectDB;
