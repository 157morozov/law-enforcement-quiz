import { useMemo } from 'react';
import { useAppContext } from '../context/AppContext';

function LeaderboardPage() {
  const { leaderboard, deviceId } = useAppContext();

  const sortedLeaderboard = useMemo(
    () => [...leaderboard].sort((a, b) => b.score - a.score),
    [leaderboard],
  );

  return (
    <section className="stack-lg">
      <div className="card intro-panel">
        <div>
          <p className="eyebrow">Таблица лидеров</p>
          <h1>Лучшие результаты расследований</h1>
          <p>
            Сейчас рейтинг хранится локально на устройстве и дополнен демонстрационными участниками,
            чтобы интерфейс выглядел полноценно уже сейчас. После подключения API рейтинг можно будет
            сделать общим для всех участников.
          </p>
        </div>
      </div>

      <div className="card leaderboard-card">
        <div className="leaderboard-head">
          <span>Место</span>
          <span>Участник</span>
          <span>Блок</span>
          <span>Баллы</span>
          <span>Звание</span>
        </div>

        <div className="leaderboard-list">
          {sortedLeaderboard.map((entry, index) => (
            <article
              key={`${entry.id}-${entry.blockId || index}`}
              className={`leaderboard-row ${entry.deviceId === deviceId ? 'current' : ''}`}
            >
              <strong>#{index + 1}</strong>
              <span>{entry.name}</span>
              <span>{entry.blockTitle}</span>
              <strong>{entry.score}</strong>
              <span>{entry.rank}</span>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

export default LeaderboardPage;
