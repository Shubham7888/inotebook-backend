const mongoose=require('mongoose');
const mongoURI="mongodb+srv://Shubham:W0fU4GJkm6WHtK6b@cluster0.m5zu6sx.mongodb.net/?retryWrites=true&w=majority";

const connectToMongo =()=>{
    mongoose.connect(mongoURI);
    mongoose.connection.on('connected',()=>{
        console.log('Conneced');
    })
    mongoose.connection.on('error',()=>{
        console.log('Connection failed');
    })
}
module.exports=connectToMongo;