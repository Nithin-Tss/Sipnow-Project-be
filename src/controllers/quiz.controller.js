const Quiz = require("../models/Quiz");

/*
 * ---------------------------------------------------------
 * GET /api/quiz
 *
 * Get the storefront taste quiz (public). The quiz is a
 * singleton document — the first (and only) one is used.
 * ---------------------------------------------------------
 */
async function getQuiz(req, res) {
  const quiz = await Quiz.findOne();

  res.json({
    questions: quiz?.questions || [],
    results: quiz?.results || [],
  });
}

/*
 * ---------------------------------------------------------
 * PUT /api/quiz
 *
 * Replace the storefront taste quiz (Admin)
 * ---------------------------------------------------------
 */
async function updateQuiz(req, res) {
  const { questions, results } = req.body;

  if (!Array.isArray(questions) || !Array.isArray(results)) {
    return res.status(400).json({
      message: "questions and results must both be arrays",
    });
  }

  const quiz = await Quiz.findOneAndUpdate(
    {},
    { questions, results },
    { new: true, upsert: true, runValidators: true }
  );

  res.json({
    message: "Quiz updated successfully",
    quiz,
  });
}

module.exports = {
  getQuiz,
  updateQuiz,
};
