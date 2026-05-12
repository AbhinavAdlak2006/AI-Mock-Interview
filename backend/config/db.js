const mongoose=require("mongoose");

const mongourl=process.env.MONGO_URL;

const connectDB=(async()=>{
    try{
        await mongoose.connect(mongourl);
        console.log("connected to database")
    }
    catch(err){
        console.log("failed to coonect to database",err);
    }
})

module.exports=connectDB;