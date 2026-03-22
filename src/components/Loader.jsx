function Loader({ label = 'Загружаем данные...' }) {
  return (
    <div className="loader-card" role="status" aria-live="polite">
      <span className="loader-spinner" />
      <p>{label}</p>
    </div>
  );
}

export default Loader;
