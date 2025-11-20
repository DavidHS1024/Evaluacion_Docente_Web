import React, { useEffect, useState } from 'react';
import api from '../api';

export default function TeacherReportPage() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        const res = await api.get('/teacher/report');
        setReports(res.data);
      } catch (err) {
        setError('No se pudo cargar el reporte.');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  return (
    <div className="page">
      <h2>Reporte de Evaluación Docente</h2>
      <p className="subtitle">
        Resultados agregados por curso e indicador. Los datos son completamente anónimos.
      </p>
      {loading && <p>Cargando reporte...</p>}
      {error && <div className="error">{error}</div>}
      {!loading && reports.length === 0 && <p>Aún no hay encuestas registradas.</p>}

      <div className="reports-list">
        {reports.map(course => {
          const generalAvg =
            course.indicators.reduce((sum, i) => sum + i.avg_score, 0) /
            course.indicators.length;

          return (
            <div key={course.course_id} className="card">
              <h3>{course.course_name}</h3>
              <p className="subtitle">Promedio general: {generalAvg.toFixed(2)} / 5</p>
              <ul className="indicators-list">
                {course.indicators.map(ind => (
                  <li key={ind.question_id}>
                    <strong>{ind.question_text}</strong>
                    <span>{ind.avg_score.toFixed(2)} / 5</span>
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
      </div>
    </div>
  );
}