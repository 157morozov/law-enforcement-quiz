import { useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';

function WelcomePage() {
  const { profile, registerProfile } = useAppContext();
  const navigate = useNavigate();
  const [name, setName] = useState('');

  if (profile) {
    return <Navigate to="/dashboard" replace />;
  }

  const handleSubmit = (event) => {
    event.preventDefault();
    const trimmedName = name.trim();

    if (!trimmedName) {
      return;
    }

    registerProfile(trimmedName);
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
          <li>3 тематических блока с возможностью дальнейшего расширения</li>
          <li>Персонализация по устройству без повторного ввода имени</li>
          <li>Сертификат участника, звания и таблица лидеров</li>
        </ul>
      </div>

      <form className="card entry-form" onSubmit={handleSubmit}>
        <p className="eyebrow">Шаг 1</p>
        <h2>Введите имя участника</h2>
        <p>Имя сохранится на этом устройстве. При следующем входе вводить его повторно не придётся.</p>
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

export default WelcomePage;
