import { NavLink, Outlet } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';

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

export default Layout;
