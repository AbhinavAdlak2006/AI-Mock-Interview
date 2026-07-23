const express=require("express");
const router=express.Router();
const {signup,login ,logout}=require("../controllers/userController.js")

router.route("/users")
.post(signup);

router.route("/sessions")
.post(login);


module.exports=router;
