import React, { useEffect, useState } from 'react';
import { fetchTasks, updateTask, createTask, deleteTask } from './api.js';
import EditTaskModal from './EditTaskModal.js';
import './App.scss';
import editImg from './assets/edit.svg';
import trashImg from './assets/trash.svg';
import starImg from './assets/star.svg';
import Markdown from 'marked-react';

const CountdownTimer = ({ targetDate }) => {
  const [timeLeft, setTimeLeft] = useState(calculateTimeLeft());

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    return () => clearInterval(timer);
  }, [targetDate]);

  function calculateTimeLeft() {
    const difference = new Date(targetDate) - new Date();
    if (difference <= 0) return null;

    const time = {
      days: Math.floor(difference / (1000 * 60 * 60 * 24)),
      hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
      minutes: Math.floor((difference / 1000 / 60) % 60),
      seconds: Math.floor((difference / 1000) % 60),
    };

    return time;
  }

  return (
    <div>
      {timeLeft ? (
        <div>
          {timeLeft.days > 0 ? <span>{timeLeft.days}d </span> : <></>}
          {timeLeft.hours > 0 ? <span>{timeLeft.hours}h </span> : <></>}
          {timeLeft.minutes > 0 ? <span>{timeLeft.minutes}m </span> : <></>}
        </div>
      ) : (
        <div>Time's up</div>
      )}
    </div>
  );
};

function App() {
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

  const loadTasks = async (showDone=NaN) => {
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
  }, []);

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

  const handleUpdateTask = async (data) => {
    try {
      const updatedData = await updateTask(data.id, data);
      await loadTasks(isShowDoneChecked);
    } catch {}

    closeUpdateModal();
  };

  const handleCreateTask = async (data) => {
    try {
      const createdData = await createTask(data);
      await loadTasks(isShowDoneChecked);
    } catch {}

    closeCreateModal();
  };

  const handleDeleteTask = async (id) => {
    closeSelectedTask();
    try {
      await deleteTask(id);
      await loadTasks(isShowDoneChecked);
    } catch {}
  }

  const handleShowDoneChange = (event) => {
    try {
      setIsShowDoneChecked(event.target.checked);
      loadTasks(event.target.checked);
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
      <div className="first-col">
        <div className="control-panel">
          <div className="check-control">
            <div>Show done</div>
            <input type="checkbox" checked={isShowDoneChecked} onChange={handleShowDoneChange}></input>
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
            <div key={task.id} className="table-elem table-grid" onClick={() => openSelectedTask(task)}>
              <div class="title-col">
                {task.planned ? (
                <img className="star" src={starImg} />
                ) : (<></>)}
                <span>{task.title}</span></div>
              <CountdownTimer targetDate={new Date(task.deadline)} />
              <div className={`status-box ${!task.done ? 'todo' : 'done'}`}>
                {!task.done ? 'To do' : 'Done'}
              </div>
              <div onClick={(event) => {event.stopPropagation(); openUpdateModal(task)}} className="edit-box"><div className="edit"><img src={editImg} /></div></div>
              <div onClick={(event) => {event.stopPropagation(); handleDeleteTask(task.id)}} className="edit-box"><div className="edit"><img src={trashImg} /></div></div>
            </div>
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
            <div className={`status-box ${!selectedTask.done ? 'todo' : 'done'}`}>
              {!selectedTask.done ? 'To do' : 'Done'}
            </div>
          </div>
          <div className="comment" markdown="1"><div className="lower">Comment:</div><Markdown>{selectedTask.comment != "" ? selectedTask.comment : "No comment provided..."}</Markdown></div>
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

export default App;
