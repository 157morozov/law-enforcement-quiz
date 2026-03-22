import { Link } from 'react-router-dom';

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

export default NotFoundPage;
