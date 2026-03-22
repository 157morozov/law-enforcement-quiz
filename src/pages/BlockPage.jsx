import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Loader from '../components/Loader';
import QuestionCard from '../components/QuestionCard';
import ResultPanel from '../components/ResultPanel';
import { useAppContext } from '../context/AppContext';
import { fetchBlockById } from '../services/quizService';
import { calculateBlockResult, getRankByScore } from '../utils/scoring';

function BlockPage() {
  const { blockId } = useParams();
  const navigate = useNavigate();
  const { profile, saveBlockResult } = useAppContext();
  const [block, setBlock] = useState(null);
  const [loading, setLoading] = useState(true);
  const [answers, setAnswers] = useState({});
  const [result, setResult] = useState(null);

  useEffect(() => {
    let active = true;

    async function loadBlock() {
      setLoading(true);
      setAnswers({});
      setResult(null);
      const response = await fetchBlockById(blockId);
      if (active) {
        setBlock(response);
        setLoading(false);
      }
    }

    loadBlock();

    return () => {
      active = false;
    };
  }, [blockId]);

  const unansweredCount = useMemo(() => {
    if (!block?.questions?.length) {
      return 0;
    }

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

    if (!block) {
      return;
    }

    const baseResult = calculateBlockResult(block.questions, answers);
    const storedResult = saveBlockResult({
      blockId: block.id,
      blockTitle: block.title,
      ...baseResult,
    });

    setResult({
      ...baseResult,
      rank: getRankByScore(baseResult.score),
      playerName: profile?.name || 'Участник',
      completedAt: storedResult.completedAt,
    });
  };

  if (loading) {
    return <Loader label="Открываем материалы блока..." />;
  }

  if (!block || block.status !== 'available') {
    return (
      <section className="card empty-state">
        <h1>Блок пока недоступен</h1>
        <p>Этот раздел уже зарезервирован, но вопросы для него будут добавлены позже.</p>
        <button className="button primary" type="button" onClick={() => navigate('/dashboard')}>
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
            <p>Баллы начисляются после проверки всех ответов внутри выбранного блока.</p>
            <button className="button primary" type="submit">
              Завершить блок
            </button>
          </div>
        </form>
      )}
    </section>
  );
}

export default BlockPage;
