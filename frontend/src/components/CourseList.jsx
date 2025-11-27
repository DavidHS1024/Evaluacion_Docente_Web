import React, { useEffect, useState } from 'react';
import { API_BASE_URL } from '../api';

function CourseList({ user, onLogout, onStartSurvey, onViewReports }) {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    // Si no hay código de usuario, no podemos cargar cursos
    if (!user?.code) return;

    const fetchCourses = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/student/courses`, {
          headers: {
            'x-student-code': user.code // Enviamos el código en la cabecera
          }
        });
        
        if (!res.ok) throw new Error('Error al cargar cursos');
        
        const data = await res.json();
        setCourses(data);
      } catch (err) {
        console.error(err);
        setError('No se pudieron cargar tus cursos asignados.');
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, [user]);

  return (
    <div className="content-card">
      <div className="section-header">
        <h2 className="section-title">Mis cursos</h2>
        <p className="subtitle">Selecciona un curso para responder la encuesta.</p>
      </div>

      {loading && <p className="helper-text">Cargando asignaturas...</p>}
      {error && <div className="error-message">{error}</div>}
      
      {!loading && !error && courses.length === 0 && (
        <p className="helper-text">No tienes cursos matriculados actualmente.</p>
      )}

      <div className="courses-list">
        {courses.map((course, index) => (
          <div key={course.id} className="course-card">
            <div className="course-number">{index + 1}</div>
            <div className="course-info">
              <h3>{course.name}</h3>
              <p className="course-meta">{course.code}</p>
              <p className="course-meta">{course.teacher}</p>
              {course.responded && <span className="status-pill">Encuesta enviada</span>}
              {course.isSurveyActive === false && (
                <span className="status-pill warning">Encuesta inactiva</span>
              )}
            </div>
            <button
              className="btn primary"
              disabled={course.isSurveyActive === false || course.responded}
              onClick={() => onStartSurvey(course)}
            >
              {course.responded ? 'Completado' : 'Responder'}
            </button>
          </div>
        ))}
      </div>

    <div className="action-stack">
        <button className="btn primary" style={{ width: '100%' }} onClick={onViewReports}>
          Ver Reportes
        </button>
        <button className="btn ghost" style={{ width: '100%' }} onClick={onLogout}>
          Cerrar sesión
        </button>
      </div>
    </div>
  );
}

export default CourseList;