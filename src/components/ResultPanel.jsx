function ResultPanel({ result, onRetry, onBack }) {
  return (
    <section className="card result-panel">
      <p className="eyebrow">Итоги блока</p>
      <h2>Расследование завершено</h2>

      <div className="result-stats-grid">
        <div>
          <span>Баллы</span>
          <strong>{result.score}</strong>
        </div>
        <div>
          <span>Верно</span>
          <strong>
            {result.correctCount}/{result.totalQuestions}
          </strong>
        </div>
        <div>
          <span>Точность</span>
          <strong>{result.percentage}%</strong>
        </div>
        <div>
          <span>Звание</span>
          <strong>{result.rank}</strong>
        </div>
      </div>

      <div className="certificate-card">
        <p>Сертификат участника</p>
        <h3>{result.playerName}</h3>
        <span>{result.rank}</span>
      </div>

      <div className="button-row center">
        <button className="button ghost" type="button" onClick={onRetry}>
          Пройти ещё раз
        </button>
        <button className="button primary" type="button" onClick={onBack}>
          К выбору блоков
        </button>
      </div>
    </section>
  );
}

export default ResultPanel;
