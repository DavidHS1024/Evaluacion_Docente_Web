import React, { useState } from 'react';
import Login from './components/Login';
import CourseList from './components/CourseList';
import SurveyForm from './components/SurveyForm';
import Reports from './components/Reports';

function App() {
  const [user, setUser] = useState(null);
  const [currentCourse, setCurrentCourse] = useState(null);
  const [page, setPage] = useState('login');

  const handleLogin = (studentData) => {
    setUser(studentData);
    setPage('courses');
  };

  const handleLogout = () => {
    setUser(null);
    setCurrentCourse(null);
    setPage('login');
  };

  const startSurvey = (course) => {
    setCurrentCourse(course);
    setPage('survey');
  };

  const submitSurvey = (courseId) => {
    // Marcar el curso como respondido en la lista del usuario
    setUser(prevUser => {
      if (!prevUser) return prevUser;
      const updatedCourses = prevUser.courses.map(c =>
        c.id === courseId ? { ...c, responded: true } : c
      );
      return { ...prevUser, courses: updatedCourses };
    });
    setCurrentCourse(null);
    setPage('courses');
  };

  return (
    <>
      {page === 'login' && <Login onLogin={handleLogin} />}
      {page === 'courses' && user && (
        <CourseList 
          user={user} 
          onLogout={handleLogout} 
          onStartSurvey={startSurvey} 
          onViewReports={() => setPage('report')} 
        />
      )}
      {page === 'survey' && user && currentCourse && (
        <SurveyForm 
          course={currentCourse} 
          user={user} 
          onSubmitSurvey={submitSurvey} 
        />
      )}
      {page === 'report' && (
        <Reports onBack={() => setPage(user ? 'courses' : 'login')} />
      )}
    </>
  );
}

export default App;
