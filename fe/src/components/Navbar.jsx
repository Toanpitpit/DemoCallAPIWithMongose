import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user, logout, isAdmin, isAdminOrChef } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="navbar">
      <div className="nav-brand">
        <Link to="/">Restaurant</Link>
      </div>
      <div className="nav-links">
        <Link to="/">Dishes</Link>
        <Link to="/categories">Categories</Link>
        <Link to="/chefs">Chefs</Link>
        <Link to="/ingredients">Ingredients</Link>
        {isAdminOrChef && (
          <div className="nav-dropdown">
            <span className="nav-dropdown-trigger">
              {isAdmin ? 'Admin' : 'Dashboard'}
            </span>
            <div className="nav-dropdown-menu">
              {isAdmin && <Link to="/admin/dishes">Dishes</Link>}
              {isAdmin && <Link to="/admin/categories">Categories</Link>}
              <Link to="/admin/chefs">Chefs</Link>
              <Link to="/admin/ingredients">Ingredients</Link>
            </div>
          </div>
        )}
      </div>
      <div className="nav-auth">
        {user ? (
          <>
            <span className="nav-user">{user.fullname} ({user.role})</span>
            <button onClick={handleLogout} className="btn-logout">Logout</button>
          </>
        ) : (
          <Link to="/login" className="btn-login">Login</Link>
        )}
      </div>
    </nav>
  );
}
