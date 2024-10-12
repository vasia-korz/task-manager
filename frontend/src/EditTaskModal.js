import React from 'react';
import Modal from 'react-modal';
import './EditTaskModal.css';
import { useEffect } from 'react';
import { emptyTask } from './models/taskModel.js'

function EditTaskModal ({ isOpen, onRequestClose, selectedTask = emptyTask, onSubmit, isUpdateModal }) {
  const handleFormSubmit = (event) => {
    event.preventDefault();
    const updatedTask = {
      id: selectedTask.id,
      title: event.target.elements.title.value,
      priority: event.target.elements.priority.value,
      comment: event.target.elements.comment.value,
      deadline: new Date(event.target.elements.deadline.value).toISOString(),
    };

    onSubmit(updatedTask);
    onRequestClose();
  };

  useEffect(() => {
    Modal.setAppElement('#root');
  }, []);

  function convertToLocalDateTimeString(dateString) {
    const date = new Date(dateString);
    
    const offsetInMinutes = date.getTimezoneOffset();
    const localDate = new Date(date.getTime() - offsetInMinutes * 60000);
    return localDate.toISOString().slice(0, 16);
  }

  function Title() {
    if (isUpdateModal) {
        return <h2>Edit task</h2>;
    } else {
        return <h2>Add task</h2>;
    }
  }

  return (
    <Modal isOpen={isOpen} onRequestClose={onRequestClose}> 
      <Title></Title>
      {selectedTask && (
        <form onSubmit={handleFormSubmit}>
          <div className="input-list">
            <div className="input-box">
              <div>Title:</div>
              <input type="text" name="title" defaultValue={selectedTask.title} required />
            </div>
            <div className="input-box">
              <div>Comment:</div>
              <input type="text" name="comment" defaultValue={selectedTask.comment} />
            </div>
            <div className="input-box">
              <div>Priority:</div>
              <input type="text" name="priority" defaultValue={selectedTask.priority} />
            </div>
            <div className="input-box">
              <div>Deadline:</div>
              <input
                type="datetime-local"
                name="deadline"
                defaultValue={selectedTask.deadline ? convertToLocalDateTimeString(selectedTask.deadline) : ''}
              />
            </div>
          </div>
          <button type="submit">Save Changes</button>
          <div onClick={onRequestClose} className="close-btn">+</div>
        </form>
      )}
    </Modal>
  );
};

export default EditTaskModal;
