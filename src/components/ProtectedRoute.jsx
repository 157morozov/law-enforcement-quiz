import { Navigate, useLocation } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';

function ProtectedRoute({ children }) {
  const { profile } = useAppContext();
  const location = useLocation();

  if (!profile) {
    return <Navigate to="/" replace state={{ from: location.pathname }} />;
  }

  return children;
}

export default ProtectedRoute;
