const express=require("express");
const router=express.Router();
const multer=require("multer");
const {storage}=require("../config/cloudinary");
const upload=multer({storage})
const { startInterview, setupInterview, generateQuestion ,evaluateAns, endInterview,getResult,getInterview} = require("../controllers/intreviewController");

router.route("/results")
.get(getResult)

router.route("/start")
.post(upload.single('resume'),startInterview);

router.route("/setup/:id")
.get(setupInterview);

router.route("/:id/generate-question")
.post(generateQuestion);

router.route("/:id/evaluate-ans")
.post(evaluateAns);

router.route("/:id/end-Interview")
.patch(endInterview);

router.route("/:id/results")
.get(getInterview);

module.exports=router;
