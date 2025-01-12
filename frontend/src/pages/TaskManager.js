import React, { useEffect, useState } from 'react';
import { fetchTasks, updateTask, createTask, deleteTask } from '../utils/api';
import EditTaskModal from '../components/EditTaskModal';
import TaskItem from '../components/TaskItem';
import './TaskManager.scss';
import Markdown from 'marked-react';

function TaskManager() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [operationTask, setOperationTask] = useState(null);
  const [selectedTask, setSelectedTask] = useState(null);
  const [isSelectedTask, setIsSelectedTask] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [isShowDoneChecked, setIsShowDoneChecked] = useState(false);

  const formatter = new Intl.DateTimeFormat('en-US', { hour: '2-digit', minute: '2-digit' });

  const loadTasks = async (showDone = NaN) => {
    try {
      const data = await fetchTasks(showDone);
      setTasks(data.data);
      setLoading(false);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTasks(isShowDoneChecked);
  }, [isShowDoneChecked]);

  const openUpdateModal = (task) => {
    closeSelectedTask();
    setOperationTask(task);
    setIsUpdateModalOpen(true);
  };

  const closeUpdateModal = () => {
    setIsUpdateModalOpen(false);
    setOperationTask(null);
  };

  const openCreateModal = () => {
    closeSelectedTask();
    setIsCreateModalOpen(true);
  };

  const closeCreateModal = () => {
    setIsCreateModalOpen(false);
  };

  const openSelectedTask = (task) => {
    setSelectedTask(task);
    setIsSelectedTask(true);
  };

  const closeSelectedTask = () => {
    setIsSelectedTask(false);
    setSelectedTask(null);
  };

  const handleDeleteTaskWithClose = async (id) => {
    closeSelectedTask();
    await handleDeleteTask(id);
  };

  const handleUpdateTask = async (data) => {
    try {
      await updateTask(data.id, data);
      await loadTasks(isShowDoneChecked);
    } catch (err) {
      console.error(err);
    }
    closeUpdateModal();
  };

  const handleCreateTask = async (data) => {
    try {
      await createTask(data);
      await loadTasks(isShowDoneChecked);
    } catch (err) {
      console.error(err);
    }
    closeCreateModal();
  };

  const handleDeleteTask = async (id) => {
    try {
      await deleteTask(id);
      await loadTasks(isShowDoneChecked);
    } catch (err) {
      console.error(err);
    }
  };

  const handleShowDoneChange = (event) => {
    setIsShowDoneChecked(event.target.checked);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    window.location.href = '/login';
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div className="container">
      <div className="first-col">
        <div className="control-panel">
          <div className="left-header-box">
            <div className="logout-button subheader" onClick={handleLogout}>Logout</div>
            <div className="check-control">
              <div>Show done</div>
              <input type="checkbox" checked={isShowDoneChecked} onChange={handleShowDoneChange}></input>
            </div>
          </div>
          <div className="subheader" onClick={() => openCreateModal()}>Add task</div>
        </div>
        <div className="table-box">
          <div className="table-grid header">
            <div>Title</div>
            <div>Deadline</div>
            <div className="center">Status</div>
            <div className="center">Edit</div>
            <div className="center">Delete</div>
          </div>
          {tasks.map((task) => (
            <TaskItem
              key={task.id}
              task={task}
              onEdit={openUpdateModal}
              onDelete={handleDeleteTaskWithClose}
              onSelect={openSelectedTask}
            />
          ))}
        </div>
      </div>
      <div className={`second-col ${isSelectedTask ? 'show' : ''}`}>
      {isSelectedTask ? (<>
        <div className="control-panel">
          <div className="subheader" onClick={() => closeSelectedTask()}>Hide</div>
        </div>
        <div className="content-box">
          <div className="header">
            <div className="title">{selectedTask.title}</div>
            <div className={`status-box ${selectedTask.done}`}>
              {selectedTask.done === 'done' ? 'Done' : selectedTask.done === "todo" ? 'To do' : 'In progress'}
            </div>
          </div>
          <div className="comment" markdown="1"><div className="lower">Comment:</div><Markdown>{selectedTask.comment !== "" ? selectedTask.comment : "No comment provided..."}</Markdown></div>
          <div className="deadline"><div className="lower second">Deadline:</div>
          {new Date(selectedTask.deadline).getDate()}-
          {new Date(selectedTask.deadline).getMonth() + 1}-
          {new Date(selectedTask.deadline).getFullYear()} at {}
          {formatter.format(new Date(selectedTask.deadline))}
          </div>
        </div>
        </>) : (<></>)}
      </div>
      
      <EditTaskModal
        isOpen={isUpdateModalOpen}
        onRequestClose={closeUpdateModal}
        selectedTask={operationTask}
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

export default TaskManager;
