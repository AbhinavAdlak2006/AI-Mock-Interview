require("dotenv").config();

const express=require("express");
const app=express();
const connectDB=require("./config/db.js");
const port =8080;

const userRouter=require("./routes/userRoute.js")
const interviewRoute=require("./routes/interviewRoute.js")
connectDB();

const authMiddleware=require("./middlewares/authMiddleware.js")

app.use(express.json());

const cors=require("cors");
app.use(cors());

app.use("/interview",authMiddleware,interviewRoute);

app.use("/",userRouter);


app.listen(port,(req,res)=>{
    
    console.log(`app is listening of port ${port}`)
})