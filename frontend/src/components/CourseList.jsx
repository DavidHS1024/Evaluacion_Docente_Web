import React from 'react';

function CourseList({ user, onLogout, onStartSurvey, onViewReports }) {
  return (
    <div>
      <h2>Bienvenido, {user.name}</h2>
      <h3>Tus Cursos Inscritos</h3>
      {user.courses.length === 0 ? (
        <p>No hay cursos para evaluar.</p>
      ) : (
        <table>
          <thead>
            <tr>
              <th>Curso</th>
              <th>Docente</th>
              <th>Estado</th>
              <th>Acción</th>
            </tr>
          </thead>
          <tbody>
            {user.courses.map(course => (
              <tr key={course.id}>
                <td>{course.name}</td>
                <td>{course.teacher}</td>
                <td>{course.responded ? 'Enviada' : 'Pendiente'}</td>
                <td>
                  {course.responded ? (
                    <span>✓ Enviada</span>
                  ) : (
                    <button onClick={() => onStartSurvey(course)}>Responder</button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      <div style={{ marginTop: '1em' }}>
        <button onClick={onLogout}>Cerrar Sesión</button>
        <button onClick={onViewReports} style={{ marginLeft: '1em' }}>
          Ver Reportes
        </button>
      </div>
    </div>
  );
}

export default CourseList;
