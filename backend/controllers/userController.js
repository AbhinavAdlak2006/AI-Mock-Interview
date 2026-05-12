const User=require("../models/userSchema.js");
const bcrypt=require("bcrypt")
const jwt=require("jsonwebtoken")

const signup=async(req,res)=>{
    try{
        let {username,email,password}=req.body;

        const existingUser=await User.findOne({email});

        if(existingUser){
            return res.status(400).json({
                success: false,
                message: "User already exists with this email"
            });
        }
    const saltround=10;
    const salt=await bcrypt.genSaltSync(saltround);

    const hashedPass=await bcrypt.hashSync(password,salt);

    let currUser={username,email,password:hashedPass};
    
    let newUser=new User(currUser);

    await newUser.save()
    
            res.status(201).json({
            success: true,
            message: "Signup successful 🎉 You can now login."
        })
    }
    catch(err){
        return res.status(400).json({
                success: false,
                message: "Signup Failed, Try Again",
            });
    }
}


const login=async(req,res)=>{
    let {email,password}=req.body;

    let existingUser=await User.findOne({email})

    if(!existingUser){
        return res.status(400).json({
            success: false,
            message:"User do not Exist"
        })
    }

    let hashedpass=existingUser.password;
    const isMatch=await bcrypt.compare(password,hashedpass);

    if(!isMatch){
        return res.status(400).json({
            success: false,
            message:"Incorrect Passsword"
        })
    }

    let token=jwt.sign({id:existingUser._id},
                        process.env.JWT_SECRET,
                        {expiresIn:"1d"}
    )
    return res.status(200).json({
        success: true,
        token:token,
        message: "Welcome back, you're logged in!"
    })
}


module.exports={signup,login};