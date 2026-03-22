const {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} = React;

const {
  HashRouter,
  Routes,
  Route,
  NavLink,
  Navigate,
  Outlet,
  Link,
  useLocation,
  useNavigate,
  useParams,
} = ReactRouterDOM;

const STORAGE_KEYS = {
  profile: 'quiz_profile',
  deviceId: 'quiz_device_id',
  leaderboard: 'quiz_leaderboard',
  progress: 'quiz_progress',
};

const DEMO_LEADERBOARD = [
  { id: 'demo-1', name: 'Арина', score: 90, rank: 'Главный следователь', blockTitle: 'Блок 1. Шифры ведомств', date: '2026-03-18' },
  { id: 'demo-2', name: 'Илья', score: 80, rank: 'Старший инспектор', blockTitle: 'Блок 1. Шифры ведомств', date: '2026-03-17' },
  { id: 'demo-3', name: 'София', score: 70, rank: 'Старший инспектор', blockTitle: 'Блок 1. Шифры ведомств', date: '2026-03-16' },
];

const AppContext = createContext(null);

function readStorage(key, fallback) {
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch (error) {
    return fallback;
  }
}

function writeStorage(key, value) {
  window.localStorage.setItem(key, JSON.stringify(value));
}

function getOrCreateDeviceId() {
  const existing = window.localStorage.getItem(STORAGE_KEYS.deviceId);
  if (existing) {
    return existing;
  }

  const nextId = `device-${crypto.randomUUID()}`;
  window.localStorage.setItem(STORAGE_KEYS.deviceId, nextId);
  return nextId;
}

function calculateBlockResult(questions, answers) {
  const correctCount = questions.reduce((sum, question) => {
    const selected = answers[question.id] || [];
    const expected = question.correctAnswers || [];
    const isCorrect =
      selected.length === expected.length && selected.every((item) => expected.includes(item));

    return sum + (isCorrect ? 1 : 0);
  }, 0);

  const totalQuestions = questions.length;
  const percentage = totalQuestions ? Math.round((correctCount / totalQuestions) * 100) : 0;
  const score = correctCount * 10;

  return { correctCount, totalQuestions, percentage, score };
}

function getRankByScore(score) {
  if (score >= 90) return 'Главный следователь';
  if (score >= 70) return 'Старший инспектор';
  if (score >= 50) return 'Младший эксперт';
  return 'Юный стажёр';
}

async function fetchBlocks() {
  const response = await fetch('./src/data/blocks.json');
  const data = await response.json();
  await new Promise((resolve) => window.setTimeout(resolve, 450));
  return data.blocks || [];
}

async function fetchBlockById(blockId) {
  const blocks = await fetchBlocks();
  return blocks.find((item) => item.id === blockId) || null;
}

function AppProvider({ children }) {
  const [deviceId, setDeviceId] = useState('');
  const [profile, setProfile] = useState(null);
  const [blocks, setBlocks] = useState([]);
  const [blocksLoading, setBlocksLoading] = useState(true);
  const [progress, setProgress] = useState({});
  const [leaderboard, setLeaderboard] = useState([]);

  useEffect(() => {
    const nextDeviceId = getOrCreateDeviceId();
    setDeviceId(nextDeviceId);
    setProfile(readStorage(STORAGE_KEYS.profile, null));
    setProgress(readStorage(STORAGE_KEYS.progress, {}));

    const storedLeaderboard = readStorage(STORAGE_KEYS.leaderboard, []);
    setLeaderboard(storedLeaderboard.length ? storedLeaderboard : DEMO_LEADERBOARD);
  }, []);

  useEffect(() => {
    let isMounted = true;

    async function loadBlocks() {
      setBlocksLoading(true);
      const items = await fetchBlocks();
      if (isMounted) {
        setBlocks(items);
        setBlocksLoading(false);
      }
    }

    loadBlocks();
    return () => {
      isMounted = false;
    };
  }, []);

  const registerProfile = (name) => {
    const ensuredDeviceId = deviceId || getOrCreateDeviceId();
    const nextProfile = {
      deviceId: ensuredDeviceId,
      name,
      createdAt: new Date().toISOString(),
    };

    setDeviceId(ensuredDeviceId);
    setProfile(nextProfile);
    writeStorage(STORAGE_KEYS.profile, nextProfile);
  };

  const saveBlockResult = ({ blockId, blockTitle, score, percentage, correctCount, totalQuestions }) => {
    const rank = getRankByScore(score);
    const completedAt = new Date().toISOString();
    const nextProgress = {
      ...progress,
      [blockId]: {
        blockId,
        blockTitle,
        score,
        percentage,
        correctCount,
        totalQuestions,
        rank,
        completedAt,
      },
    };

    const nextLeaderboard = [
      ...leaderboard.filter((entry) => !(entry.deviceId === deviceId && entry.blockId === blockId)),
      {
        id: `${deviceId}-${blockId}`,
        deviceId,
        blockId,
        name: profile?.name || 'Участник',
        blockTitle,
        score,
        rank,
        date: completedAt.slice(0, 10),
      },
    ].sort((a, b) => b.score - a.score);

    setProgress(nextProgress);
    setLeaderboard(nextLeaderboard);
    writeStorage(STORAGE_KEYS.progress, nextProgress);
    writeStorage(STORAGE_KEYS.leaderboard, nextLeaderboard);

    return nextProgress[blockId];
  };

  const totalScore = Object.values(progress).reduce((sum, item) => sum + item.score, 0);
  const overallRank = getRankByScore(totalScore);

  const value = useMemo(
    () => ({
      deviceId,
      profile,
      blocks,
      blocksLoading,
      progress,
      leaderboard,
      totalScore,
      overallRank,
      registerProfile,
      saveBlockResult,
    }),
    [deviceId, profile, blocks, blocksLoading, progress, leaderboard, totalScore, overallRank],
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

function useAppContext() {
  const context = useContext(AppContext);

  if (!context) {
    throw new Error('useAppContext must be used within AppProvider');
  }

  return context;
}

function Layout() {
  const { profile, totalScore, overallRank } = useAppContext();

  return (
    <div className="app-shell">
      <header className="topbar">
        <div>
          <p className="eyebrow">Детективное расследование</p>
          <NavLink className="brand" to={profile ? '/dashboard' : '/'}>
            Правовой След
          </NavLink>
        </div>

        <nav className="topbar-nav">
          {profile ? (
            <>
              <NavLink to="/dashboard">Блоки</NavLink>
              <NavLink to="/leaderboard">Лидеры</NavLink>
            </>
          ) : null}
        </nav>

        <div className="profile-chip">
          <span>{profile?.name || 'Новый участник'}</span>
          <strong>{totalScore} б.</strong>
          <small>{overallRank}</small>
        </div>
      </header>

      <main className="page-container">
        <Outlet />
      </main>
    </div>
  );
}

function ProtectedRoute({ children }) {
  const { profile } = useAppContext();
  const location = useLocation();

  if (!profile) {
    return <Navigate to="/" replace state={{ from: location.pathname }} />;
  }

  return children;
}

function Loader({ label = 'Загружаем данные...' }) {
  return (
    <div className="loader-card" role="status" aria-live="polite">
      <span className="loader-spinner" />
      <p>{label}</p>
    </div>
  );
}

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

function QuestionCard({ question, selectedAnswers, onSelect, index }) {
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

      <div className="button-row">
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

function WelcomePage() {
  const { profile, registerProfile } = useAppContext();
  const [name, setName] = useState('');
  const navigate = useNavigate();

  if (profile) {
    return <Navigate to="/dashboard" replace />;
  }

  const handleSubmit = (event) => {
    event.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) return;
    registerProfile(trimmed);
    navigate('/dashboard');
  };

  return (
    <section className="hero-grid">
      <div className="card hero-copy">
        <p className="eyebrow">Конкурс для 9–11 классов</p>
        <h1>Детективный квиз о правоохранительных органах Российской Федерации</h1>
        <p>
          Участник проходит по отделам расследования, раскрывает аббревиатуры, получает баллы,
          звание и попадает в таблицу лидеров.
        </p>
        <ul className="feature-list">
          <li>Три тематических блока, один уже заполнен стартовыми вопросами</li>
          <li>Архитектура готова к будущему API, изображениям и множественному выбору</li>
          <li>Сертификат участника, звания и локальная таблица лидеров</li>
        </ul>
      </div>

      <form className="card entry-form" onSubmit={handleSubmit}>
        <p className="eyebrow">Шаг 1</p>
        <h2>Введите имя участника</h2>
        <p>Имя будет сохранено на этом устройстве, поэтому при следующем входе ввод не понадобится.</p>
        <label className="field">
          <span>Имя</span>
          <input
            type="text"
            placeholder="Например, Виктория"
            value={name}
            onChange={(event) => setName(event.target.value)}
            maxLength={40}
          />
        </label>
        <button className="button primary" type="submit">
          Начать расследование
        </button>
      </form>
    </section>
  );
}

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
            два блока уже подготовлены под изображения и вопросы с несколькими ответами.
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

function BlockPage() {
  const { blockId } = useParams();
  const navigate = useNavigate();
  const { profile, saveBlockResult } = useAppContext();
  const [block, setBlock] = useState(null);
  const [loading, setLoading] = useState(true);
  const [answers, setAnswers] = useState({});
  const [result, setResult] = useState(null);

  useEffect(() => {
    let isMounted = true;

    async function loadBlock() {
      setLoading(true);
      setResult(null);
      setAnswers({});
      const nextBlock = await fetchBlockById(blockId);
      if (isMounted) {
        setBlock(nextBlock);
        setLoading(false);
      }
    }

    loadBlock();
    return () => {
      isMounted = false;
    };
  }, [blockId]);

  const unansweredCount = useMemo(() => {
    if (!block?.questions?.length) return 0;
    return block.questions.filter((question) => !(answers[question.id] || []).length).length;
  }, [block, answers]);

  const handleSelect = (question, option) => {
    setAnswers((current) => {
      const selected = current[question.id] || [];

      if (!question.multiple) {
        return { ...current, [question.id]: [option] };
      }

      const exists = selected.includes(option);
      return {
        ...current,
        [question.id]: exists ? selected.filter((item) => item !== option) : [...selected, option],
      };
    });
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    if (!block) return;

    const baseResult = calculateBlockResult(block.questions, answers);
    const savedResult = saveBlockResult({
      blockId: block.id,
      blockTitle: block.title,
      ...baseResult,
    });

    setResult({
      ...baseResult,
      rank: getRankByScore(baseResult.score),
      playerName: profile?.name || 'Участник',
      completedAt: savedResult.completedAt,
    });
  };

  if (loading) {
    return <Loader label="Открываем материалы блока..." />;
  }

  if (!block || block.status !== 'available') {
    return (
      <section className="card empty-state">
        <h1>Блок пока недоступен</h1>
        <p>Раздел уже зарезервирован в интерфейсе, но вопросы для него будут добавлены позже.</p>
        <button className="button primary" onClick={() => navigate('/dashboard')} type="button">
          Вернуться к блокам
        </button>
      </section>
    );
  }

  return (
    <section className="stack-lg">
      <div className="card block-header">
        <p className="eyebrow">{block.title}</p>
        <h1>{block.subtitle}</h1>
        <p>{block.description}</p>
        <div className="helper-row">
          <span>{block.questions.length} вопросов</span>
          <span>Неотвеченных: {unansweredCount}</span>
        </div>
      </div>

      {result ? (
        <ResultPanel
          result={result}
          onRetry={() => {
            setAnswers({});
            setResult(null);
          }}
          onBack={() => navigate('/dashboard')}
        />
      ) : (
        <form className="stack-lg" onSubmit={handleSubmit}>
          {block.questions.map((question, index) => (
            <QuestionCard
              key={question.id}
              index={index + 1}
              question={question}
              selectedAnswers={answers[question.id] || []}
              onSelect={handleSelect}
            />
          ))}

          <div className="card submit-panel">
            <p>Баллы начисляются после полной проверки ответов внутри выбранного блока.</p>
            <button className="button primary" type="submit">
              Завершить блок
            </button>
          </div>
        </form>
      )}
    </section>
  );
}

function LeaderboardPage() {
  const { leaderboard, deviceId } = useAppContext();
  const sortedLeaderboard = [...leaderboard].sort((a, b) => b.score - a.score);

  return (
    <section className="stack-lg">
      <div className="card intro-panel">
        <div>
          <p className="eyebrow">Таблица лидеров</p>
          <h1>Лучшие результаты расследований</h1>
          <p>
            Сейчас рейтинг хранится локально на устройстве и дополнен демонстрационными участниками,
            чтобы страница выглядела полноценно уже сейчас. После подключения API можно сделать общий
            рейтинг для всех школьников.
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

function NotFoundPage() {
  return (
    <section className="card empty-state">
      <h1>Страница не найдена</h1>
      <p>Похоже, нужная улика потерялась. Вернитесь на главную страницу и продолжите расследование.</p>
      <Link className="button primary" to="/">
        На главную
      </Link>
    </section>
  );
}

function App() {
  return (
    <HashRouter>
      <AppProvider>
        <Routes>
          <Route element={<Layout />}>
            <Route index element={<WelcomePage />} />
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <DashboardPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/blocks/:blockId"
              element={
                <ProtectedRoute>
                  <BlockPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/leaderboard"
              element={
                <ProtectedRoute>
                  <LeaderboardPage />
                </ProtectedRoute>
              }
            />
            <Route path="/404" element={<NotFoundPage />} />
            <Route path="*" element={<Navigate to="/404" replace />} />
          </Route>
        </Routes>
      </AppProvider>
    </HashRouter>
  );
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);
