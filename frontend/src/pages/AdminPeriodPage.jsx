import React, { useEffect, useState } from 'react';
import api from '../api';

export default function AdminPeriodPage() {
  const [form, setForm] = useState({
    start_date: '',
    end_date: '',
    is_active: true
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        const res = await api.get('/admin/evaluation-period');
        if (res.data) {
          setForm({
            start_date: res.data.start_date,
            end_date: res.data.end_date,
            is_active: res.data.is_active === 1
          });
        }
      } catch {
        // ignore
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const handleChange = e => {
    const { name, value, type, checked } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setError('');
    setMessage('');
    setSaving(true);
    try {
      const res = await api.post('/admin/evaluation-period', {
        start_date: form.start_date,
        end_date: form.end_date,
        is_active: form.is_active
      });
      setMessage('Periodo guardado correctamente.');
      setForm({
        start_date: res.data.start_date,
        end_date: res.data.end_date,
        is_active: res.data.is_active === 1
      });
    } catch (err) {
      setError(err.response?.data?.message || 'Error al guardar el periodo.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="page">
      <h2>Gestión de Fechas de Evaluación</h2>
      <p className="subtitle">
        Define las fechas de inicio y fin del periodo de evaluación. Solo se podrá responder
        encuestas dentro de este rango.
      </p>

      {loading ? (
        <p>Cargando periodo actual...</p>
      ) : (
        <form onSubmit={handleSubmit} className="form small">
          <label>
            Fecha de inicio
            <input
              type="date"
              name="start_date"
              value={form.start_date}
              onChange={handleChange}
              required
            />
          </label>
          <label>
            Fecha de fin
            <input
              type="date"
              name="end_date"
              value={form.end_date}
              onChange={handleChange}
              required
            />
          </label>
          <label className="checkbox-label">
            <input
              type="checkbox"
              name="is_active"
              checked={form.is_active}
              onChange={handleChange}
            />
            Periodo de evaluación activo
          </label>

          {message && <div className="success">{message}</div>}
          {error && <div className="error">{error}</div>}

          <button className="btn primary" type="submit" disabled={saving}>
            {saving ? 'Guardando...' : 'Guardar periodo'}
          </button>
        </form>
      )}
    </div>
  );
}