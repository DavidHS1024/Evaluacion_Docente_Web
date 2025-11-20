import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';

export default function StudentDashboard() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const loadCourses = async () => {
      try {
        const res = await api.get('/student/courses');
        setCourses(res.data);
      } catch (err) {
        setError('No se pudo cargar tus cursos.');
      } finally {
        setLoading(false);
      }
    };
    loadCourses();
  }, []);

  return (
    <div className="page">
      <h2>Mis cursos</h2>
      <p className="subtitle">Selecciona un curso para responder la encuesta.</p>
      {loading && <p>Cargando cursos...</p>}
      {error && <div className="error">{error}</div>}
      <div className="courses-grid">
        {courses.map(c => (
          <div
            key={c.id}
            className="card clickable"
            onClick={() => navigate(`/student/course/${c.id}`)}
          >
            <h3>{c.name}</h3>
            <p className="course-code">{c.code}</p>
            <p className="course-teacher">{c.teacher_name}</p>
          </div>
        ))}
        {!loading && courses.length === 0 && (
          <p>No tienes cursos matriculados en el sistema.</p>
        )}
      </div>
    </div>
  );
}
