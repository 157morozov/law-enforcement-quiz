import BlockCard from '../components/BlockCard';
import Loader from '../components/Loader';
import { useAppContext } from '../context/AppContext';

function DashboardPage() {
  const { profile, blocks, blocksLoading, progress, totalScore, overallRank } = useAppContext();

  return (
    <section className="stack-lg">
      <div className="card intro-panel">
        <div>
          <p className="eyebrow">Личный кабинет</p>
          <h1>Здравствуйте, {profile?.name}!</h1>
          <p>
            Выберите отдел расследования. Сейчас доступен стартовый блок по аббревиатурам, а ещё
            два блока уже подготовлены для будущих вопросов с изображениями и множественным выбором.
          </p>
        </div>

        <div className="stats-row">
          <div className="mini-stat">
            <span>Общий счёт</span>
            <strong>{totalScore}</strong>
          </div>
          <div className="mini-stat">
            <span>Текущее звание</span>
            <strong>{overallRank}</strong>
          </div>
          <div className="mini-stat">
            <span>Пройдено блоков</span>
            <strong>{Object.keys(progress).length}/3</strong>
          </div>
        </div>
      </div>

      {blocksLoading ? (
        <Loader label="Подготавливаем отделы расследования..." />
      ) : (
        <div className="blocks-grid">
          {blocks.map((block) => (
            <BlockCard key={block.id} block={block} result={progress[block.id]} />
          ))}
        </div>
      )}
    </section>
  );
}

export default DashboardPage;
