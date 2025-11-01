import React, { useContext } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthContext, AuthProvider } from './context/AuthContext';
import Login from './pages/Login';
import Register from './pages/Register';
import StudentDashboard from './pages/StudentDashboard';
import AdminDashboard from './pages/AdminDashboard';
import StaffDashboard from './pages/StaffDashboard';

const PrivateRoute = ({ children, roles }) => {
  const { auth } = useContext(AuthContext);
  if (!auth.token || !roles.includes(auth.role)) {
    return <Navigate to="/login" />;
  }
  return children;
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route 
            path="/student" 
            element={<PrivateRoute roles={['student']}><StudentDashboard /></PrivateRoute>} 
          />
          <Route 
            path="/admin" 
            element={<PrivateRoute roles={['admin']}><AdminDashboard /></PrivateRoute>} 
          />
          <Route 
            path="/staff" 
            element={<PrivateRoute roles={['staff']}><StaffDashboard /></PrivateRoute>} 
          />
          <Route path="*" element={<Navigate to="/login" />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
