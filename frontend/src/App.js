import React, { useEffect, useState } from 'react';
import { fetchTasks, updateTask, createTask, deleteTask } from './api.js';
import EditTaskModal from './EditTaskModal.js';
import './App.css';

function App() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedTask, setSelectedTask] = useState(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);

  const loadTasks = async () => {
    try {
      const data = await fetchTasks();
      setTasks(data.data);
      setLoading(false);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTasks();
  }, []);

  const openUpdateModal = (task) => {
    setSelectedTask(task);
    setIsUpdateModalOpen(true);
  };

  const closeUpdateModal = () => {
    setIsUpdateModalOpen(false);
    setSelectedTask(null);
  };

  const openCreateModal = () => {
    setIsCreateModalOpen(true);
  };

  const closeCreateModal = () => {
    setIsCreateModalOpen(false);
  };

  const handleUpdateTask = async (data) => {
    try {
      const updatedData = await updateTask(data.id, data);
      await loadTasks();
    } catch {}

    closeUpdateModal();
  };

  const handleCreateTask = async (data) => {
    try {
      const createdData = await createTask(data);
      await loadTasks();
    } catch {}

    closeCreateModal();
  };

  const handleDeleteTask = async (id) => {
    try {
      await deleteTask(id);
      await loadTasks();
    } catch {}
  }

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div className="container">
      <div className="table-box">
        <div className="table-grid">
          <div>Title</div>
          <div>Priority</div>
          <div>Deadline</div>
          <div>Time left</div>
          <div>Edit</div>
          <div>Delete</div>
        </div>
        {tasks.map((task) => (
          <div key={task.id} className="table-elem table-grid">
            <div>{task.title}</div>
            <div>{task.priority}</div>
            <div>{new Date(task.deadline).toLocaleDateString()}</div>
            <div>01:03:21:43</div>
            <div onClick={() => openUpdateModal(task)}>...</div>
            <div onClick={() => handleDeleteTask(task.id)}>Del</div>
          </div>
        ))}
        <h1 onClick={() => openCreateModal()}>Add</h1>
      </div>

      <EditTaskModal
        isOpen={isUpdateModalOpen}
        onRequestClose={closeUpdateModal}
        selectedTask={selectedTask}
        onSubmit={handleUpdateTask}
        isUpdateModal={true}
      />

      <EditTaskModal
        isOpen={isCreateModalOpen}
        onRequestClose={closeCreateModal}
        onSubmit={handleCreateTask}
        isUpdateModal={false}
      />

    </div>
  );
}

export default App;
