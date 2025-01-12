import { api } from './api';

export const login = async (username, password) => {
  try {
    const response = await api.post('/auth/login', { username, password });
    return response.data.token;
  } catch (err) {
    console.error('Error during login:', err);
    if (err.response && err.response.status === 401) {
      throw new Error('Invalid username or password');
    }
    throw new Error('Something went wrong. Please try again later.');
  }
};

export const register = async (username, password) => {
  try {
    const response = await api.post('/auth/register', { username, password });
    return response.data;
  } catch (err) {
    console.error('Error during registration:', err);
    throw new Error('Registration failed. Try a different username.');
  }
};
