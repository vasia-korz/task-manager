import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import TaskManager from './pages/TaskManager';
import PrivateRoute from './PrivateRoute'

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<PrivateRoute><TaskManager /></PrivateRoute>} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/tasks" element={<PrivateRoute><TaskManager /></PrivateRoute>} />
      </Routes>
    </Router>
  );
}

export default App;
