import { Link } from 'react-router-dom';

function BlockCard({ block, result }) {
  const isAvailable = block.status === 'available';

  return (
    <article className={`card block-card ${!isAvailable ? 'is-disabled' : ''}`}>
      <div className="card-badge-row">
        <span className={`status-badge ${isAvailable ? 'available' : 'soon'}`}>
          {isAvailable ? 'Доступно' : 'Скоро'}
        </span>
        <span className="muted">{block.estimatedTime}</span>
      </div>

      <div className="card-content">
        <h3>{block.title}</h3>
        <p>{block.subtitle}</p>
        <p className="muted">{block.description}</p>
      </div>

      {result ? (
        <div className="result-strip">
          <span>{result.score} баллов</span>
          <span>{result.rank}</span>
        </div>
      ) : null}

      {isAvailable ? (
        <Link className="button primary" to={`/blocks/${block.id}`}>
          {result ? 'Пройти снова' : 'Открыть блок'}
        </Link>
      ) : (
        <button className="button ghost" type="button" disabled>
          Ожидает наполнения
        </button>
      )}
    </article>
  );
}

export default BlockCard;
