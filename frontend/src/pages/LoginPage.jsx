import React, { useState } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import api from '../api';

export default function LoginPage() {
  const [code, setCode] = useState('');
  const [dni, setDni] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const token = localStorage.getItem('token');
  const role = localStorage.getItem('role');

  if (token && role) {
    if (role === 'student') return <Navigate to="/student" replace />;
    if (role === 'admin') return <Navigate to="/admin/period" replace />;
    if (role === 'teacher') return <Navigate to="/teacher/report" replace />;
  }

  const handleSubmit = async e => {
    e.preventDefault();
    setError('');
    try {
      const res = await api.post('/auth/login', { code, dni });
      const { token, user } = res.data;
      localStorage.setItem('token', token);
      localStorage.setItem('role', user.role);
      localStorage.setItem('name', user.name);
      localStorage.setItem('code', user.code);

      if (user.role === 'student') navigate('/student');
      else if (user.role === 'admin') navigate('/admin/period');
      else if (user.role === 'teacher') navigate('/teacher/report');
      else navigate('/login');
    } catch (err) {
      setError(
        err.response?.data?.message || 'Error al iniciar sesión. Intente nuevamente.'
      );
    }
  };

  return (
    <div className="page-centered">
      <div className="card">
        <h2>Evaluación Docente - FIIS UNAC</h2>
        <p className="subtitle">Accede con tu código de matrícula y DNI</p>
        <form onSubmit={handleSubmit} className="form">
          <label>
            Código de matrícula / DNI
            <input
              type="text"
              value={code}
              onChange={e => setCode(e.target.value)}
              placeholder="Ej: 212500001"
              required
            />
          </label>
          <label>
            DNI
            <input
              type="password"
              value={dni}
              onChange={e => setDni(e.target.value)}
              placeholder="Ingresa tu DNI"
              required
            />
          </label>
          {error && <div className="error">{error}</div>}
          <button className="btn primary" type="submit">
            Iniciar sesión
          </button>
          <p className="helper-text">
            ¿Olvidaste tu DNI? Contacta al área de sistemas / secretaría académica.
          </p>
        </form>
      </div>
    </div>
  );
}