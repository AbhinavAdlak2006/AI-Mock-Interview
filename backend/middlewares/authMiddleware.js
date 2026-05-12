const jwt=require("jsonwebtoken");

const authMiddleware=(req,res,next)=>{
    const authHeader=req.headers.authorization;
    console.log(authHeader);
     if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "No token provided" });
    }

    const token=authHeader.split(" ")[1];

    const decodeToken=jwt.verify(token,process.env.JWT_SECRET);
    req.user = { userId: decodeToken.id };
    next();
}
module.exports=authMiddleware;
