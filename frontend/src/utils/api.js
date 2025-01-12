import axios from 'axios';
import moment from 'moment';

const API_BASE_URL = 'http://localhost:8080';

export const api = axios.create({
  baseURL: API_BASE_URL,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token && config.url !== '/auth/login' && config.url !== '/auth/register') {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle 401 errors globally
api.interceptors.response.use(
  (response) => response, // Pass through successful responses
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error); // Forward the error for further handling
  }
);

export const fetchTasks = async (showDone=NaN, deadlineProximity=NaN) => {
  try {
    let request = `/tasks/`;

    let deadlineProximityRequest;
    let showDoneRequest;

    if (!isNaN(showDone)) {
      showDoneRequest = `showDone=${showDone}`
    }
    if (!isNaN(deadlineProximity)) {
      const date = moment(deadlineProximity);
      const formattedDate = date.utc().format("YYYY-MM-DDTHH:mm:ss[Z]")
      deadlineProximityRequest = `?deadlineProximity=${formattedDate}`
    }

    if (!isNaN(showDone) && isNaN(deadlineProximity)) {
      request = request + '?' + showDoneRequest
    } else if (isNaN(showDone) && !isNaN(deadlineProximity)) {
      request = request + '?' + deadlineProximityRequest
    } else if (!isNaN(showDone) && !isNaN(deadlineProximity)) {
      request = request + '?' + showDoneRequest + '&' + deadlineProximityRequest
    }

    const response = await api.get(request);
    return response.data;
  } catch (error) {
    console.error('Error fetching tasks:', error);
    throw error;
  }
};

export const createTask = async (taskData) => {
  try {
    const response = await api.post(`/tasks/create`, taskData);
    return response.data;
  } catch (error) {
    console.error('Error creating task:', error);
    throw error;
  }
};

export const updateTask = async (id, taskData) => {
  try {
    const response = await api.post(`/tasks/update/${id}`, taskData);
    return response.data;
  } catch (error) {
    console.error('Error updating task:', error);
    throw error;
  }
};

export const deleteTask = async (id) => {
  try {
    const response = await api.get(`/tasks/delete/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error deleting task:', error);
    throw error;
  }
};
