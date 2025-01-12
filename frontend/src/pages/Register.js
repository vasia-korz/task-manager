import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { register, login } from '../utils/auth';
import './Auth.scss'

function Register() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();

    try {
      await register(username, password);
      setMessage('Registration successful! Logging you in...');

      const token = await login(username, password);
      localStorage.setItem('token', token);
      navigate('/tasks');
    } catch (err) {
      setError(err.message || 'Registration failed. Try again.');
    }
  };

  return (
    <div className="auth-container">
      <h2>Register</h2>
      <form onSubmit={handleRegister}>
        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button type="submit">Register</button>
      </form>
      <div className="auth-route" onClick={() => {navigate('/login');}}>Login</div>
      <div className="auth-info">
        {message && <p style={{ color: 'green' }}>{message}</p>}
        {error && <p style={{ color: 'red' }}>{error}</p>}
      </div>
    </div>
  );
}

export default Register;
