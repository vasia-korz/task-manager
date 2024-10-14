import axios from 'axios';
import moment from 'moment';

const API_BASE_URL = 'http://localhost:8080'; 

export const fetchTasks = async (showDone=NaN, deadlineProximity=NaN) => {
  try {
    let request = `${API_BASE_URL}/tasks/`;

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

    const response = await axios.get(request);
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
