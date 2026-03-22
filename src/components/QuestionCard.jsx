function QuestionCard({ index, question, selectedAnswers, onSelect }) {
  return (
    <section className="card question-card">
      <div className="question-head">
        <h3>
          {index}. {question.prompt}
        </h3>
        <span>{question.multiple ? 'Несколько ответов' : 'Один ответ'}</span>
      </div>

      <div className="options-grid">
        {question.options.map((option) => {
          const checked = selectedAnswers.includes(option);

          return (
            <label key={option} className={`option-tile ${checked ? 'selected' : ''}`}>
              <input
                type={question.multiple ? 'checkbox' : 'radio'}
                name={question.id}
                checked={checked}
                onChange={() => onSelect(question, option)}
              />
              <span>{option}</span>
            </label>
          );
        })}
      </div>
    </section>
  );
}

export default QuestionCard;
