const mongoose = require("mongoose");

const interviewSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    interviewType:{
      type:String,
      enum: ["HR", "Technical", "Mixed"],
    },
    role: {
      type: String,
      required: true,
    },

    difficulty: {
      type: String,
      enum: ["Easy", "Medium", "Hard"],
      required: true,
    },
    duration:{
      type:String,
      enum:["15 min","30 min","45 min","60 min","75 min","90 min"]
    },
    userMode:{
      type:String,
      enum:["Text","Voice"]
    },
    AIMode:{
      type:String,
      enum:["Text","Voice"]
    },
    voiceType:{
      type:String,
      enum:["","Male","Female"]
    },
    name:{
      type:"String"
    },
    resume:{
      filename:{
        type:String,
      },
      path:{
        type:String,
      }
    },
    totalScore: {
      type: Number,
      default: 0,
    },
    summary: {
      type: String,
      default: 0,
    },
    strengths:{
      type:String,
    } ,
    weaknesses: {
      type:String,
    },
    feedback: {
      type: String,
      default: "",
    },
    completion_assessment:{
      type:String,
      enum:["Completed", "Partially Completed","Exited Early"]
    },
    status: {
      type: String,
      enum: ["in-progress", "completed"],
      default: "in-progress",
    },
    commpletion_time:{
      type:Date,
    }
  },
);

const Interview = mongoose.model("Interview", interviewSchema);

module.exports = Interview;