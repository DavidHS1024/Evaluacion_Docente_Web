import React, { useEffect, useMemo, useState } from 'react';
import { API_BASE_URL } from '../api';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from 'recharts';

const TeacherReport = ({ user, onBack }) => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/teacher/my-reports`, {
          headers: {
            'x-teacher-dni': user?.dni || ''
          }
        });
        if (!res.ok) {
          throw new Error('No autorizado o error del servidor');
        }
        const data = await res.json();
        setReports(data);
      } catch (err) {
        console.error(err);
        setError('No se pudo cargar el reporte del docente.');
      } finally {
        setLoading(false);
      }
    };
    if (user?.dni) load();
  }, [user]);

  const chartData = useMemo(() => {
    return reports.map(r => ([
      { name: 'Claridad', value: r.avg_p1 || 0 },
      { name: 'Participación', value: r.avg_p2 || 0 },
      { name: 'Puntualidad', value: r.avg_p3 || 0 },
      { name: 'Dominio', value: r.avg_p4 || 0 }
    ]));
  }, [reports]);

  return (
    <div className="content-card">
      <h2 className="section-title">Mis reportes</h2>
      <p className="subtitle">
        Vista de docente: {user?.name}
      </p>
      {loading && <p>Cargando información...</p>}
      {error && <div className="error-message">{error}</div>}
      {!loading && reports.length === 0 && <p className="helper-text">No se encontraron cursos asignados o respuestas.</p>}

      <div className="reports-grid">
        {reports.map((report, index) => (
          <div key={report.courseId} className="report-card">
            <div className="report-title">{report.courseName}</div>
            <p className="report-subtitle">Participación: {report.participationRate}% ({report.count} encuestas)</p>
            
            <div style={{ height: 240 }}>
              <ResponsiveContainer>
                <BarChart data={chartData[index]} margin={{ top: 10 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis domain={[0, 5]} />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="value" fill="#4f46e5" name="Promedio" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        ))}
      </div>

      <button className="btn ghost" style={{ width: '100%', marginTop: '12px' }} onClick={onBack}>
        Cerrar sesión
      </button>
    </div>
  );
};

export default TeacherReport;