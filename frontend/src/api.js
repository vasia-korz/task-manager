import axios from 'axios';

const API_BASE_URL = 'http://localhost:8080'; 

export const fetchTasks = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/tasks/`);
    return response.data;
  } catch (error) {
    console.error('Error fetching tasks:', error);
    throw error;
  }
};

export const createTask = async (taskData) => {
  try {
    console.log("createTask", `${API_BASE_URL}/tasks/create`, taskData);
    const response = await axios.post(`${API_BASE_URL}/tasks/create`, taskData);
    return response.data;
  } catch (error) {
    console.error('Error creating task:', error);
    throw error;
  }
};

export const updateTask = async (id, taskData) => {
  try {
    console.log("updateTask", `${API_BASE_URL}/tasks/update/${id}`, taskData);
    const response = await axios.post(`${API_BASE_URL}/tasks/update/${id}`, taskData);
    return response.data;
  } catch (error) {
    console.error('Error updating task:', error);
    throw error;
  }
};

export const deleteTask = async (id) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/tasks/delete/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error deleting task:', error);
    throw error;
  }
};
