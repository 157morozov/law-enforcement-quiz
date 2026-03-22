export function calculateBlockResult(questions, answers) {
  const correctCount = questions.reduce((sum, question) => {
    const selectedAnswers = answers[question.id] || [];
    const expectedAnswers = question.correctAnswers || [];
    const isCorrect =
      selectedAnswers.length === expectedAnswers.length &&
      selectedAnswers.every((item) => expectedAnswers.includes(item));

    return sum + (isCorrect ? 1 : 0);
  }, 0);

  const totalQuestions = questions.length;
  const percentage = totalQuestions === 0 ? 0 : Math.round((correctCount / totalQuestions) * 100);
  const score = correctCount * 10;

  return {
    correctCount,
    totalQuestions,
    percentage,
    score,
  };
}

export function getRankByScore(score) {
  if (score >= 90) return 'Главный следователь';
  if (score >= 70) return 'Старший инспектор';
  if (score >= 50) return 'Младший эксперт';
  return 'Юный стажёр';
}
