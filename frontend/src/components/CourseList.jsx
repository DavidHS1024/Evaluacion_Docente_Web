import React from 'react';
import { useNavigate, Link } from 'react-router-dom';

export default function Navbar() {
  const navigate = useNavigate();
  const role = localStorage.getItem('role');
  const name = localStorage.getItem('name');

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  return (
    <header className="navbar">
      <div className="navbar-left">
        <span className="navbar-title">Evaluación Docente - FIIS UNAC</span>
      </div>
      <nav className="navbar-right">
        {role === 'student' && <Link to="/student">Mis cursos</Link>}
        {role === 'admin' && <Link to="/admin/period">Fechas evaluación</Link>}
        {role === 'teacher' && <Link to="/teacher/report">Mis reportes</Link>}
        {name && <span className="navbar-user">{name}</span>}
        {role ? (
          <button className="btn" onClick={handleLogout}>
            Cerrar sesión
          </button>
        ) : (
          <button className="btn" onClick={() => navigate('/login')}>
            Iniciar sesión
          </button>
        )}
      </nav>
    </header>
  );
}
