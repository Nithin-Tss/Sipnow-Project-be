const mongoose = require("mongoose");

const quizOptionSchema = new mongoose.Schema(
  {
    label: { type: String, trim: true, required: true },
    icon: { type: String, trim: true, default: "" },
    scores: { type: Map, of: Number, default: {} },
  },
  { _id: false }
);

const quizQuestionSchema = new mongoose.Schema(
  {
    question: { type: String, trim: true, required: true },
    options: { type: [quizOptionSchema], default: [] },
  },
  { _id: false }
);

const quizResultSchema = new mongoose.Schema(
  {
    key: { type: String, trim: true, required: true },
    title: { type: String, trim: true, required: true },
    desc: { type: String, trim: true, default: "" },
  },
  { _id: false }
);

/*
 * Singleton document: the storefront's taste quiz is a single
 * configurable set of questions and results, not a list of quizzes.
 */
const quizSchema = new mongoose.Schema(
  {
    questions: { type: [quizQuestionSchema], default: [] },
    results: { type: [quizResultSchema], default: [] },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Quiz", quizSchema);
