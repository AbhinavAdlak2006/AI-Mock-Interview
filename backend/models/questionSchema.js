const mongoose = require("mongoose");

const questionSchema = new mongoose.Schema(
  {
    interviewId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Interview",
      required: true,
    },

    order: {
      type: Number,
      required: true,
    },

    question: {
      type: String,
      required: true,
    },

    answer: {
      type: String,
      default: "",
    },

    idealAnswer: {
      type: String,
      default: "",
    },

    score: {
      type: Number,
    },

    feedback: {
      type: String,
    },
  },
);

const Question = mongoose.model("Question", questionSchema);

module.exports = Question;