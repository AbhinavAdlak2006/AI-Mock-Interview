const express=require("express");
const router=express.Router();
const multer=require("multer");
const {storage}=require("../config/cloudinary");
const upload=multer({storage})
const audioUpload=multer({
    storage:multer.memoryStorage(),
    limits:{
        fileSize:15*1024*1024,
    }
})
const { startInterview, setupInterview, generateQuestion ,evaluateAns, transcribeAnswer, endInterview,getResult,getInterview} = require("../controllers/intreviewController");

router.route("/results")
.get(getResult)

router.route("/")
.post(upload.single('resume'),startInterview);

router.route("/:id/setup")
.get(setupInterview);

router.route("/:id/questions")
.post(generateQuestion);

router.route("/:id/answer-evaluations")
.post(evaluateAns);

router.route("/:id/answer-transcriptions")
.post(audioUpload.single("audio"),transcribeAnswer);

router.route("/:id")
.patch(endInterview);

router.route("/:id/results")
.get(getInterview);

module.exports=router;
