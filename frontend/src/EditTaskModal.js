import React from 'react';
import Modal from 'react-modal';
import './EditTaskModal.scss';
import { useEffect } from 'react';
import { emptyTask } from './models/taskModel.js';
import closeImg from "./assets/close.svg";

function EditTaskModal ({ isOpen, onRequestClose, selectedTask = emptyTask, onSubmit, isUpdateModal }) {
  const handleFormSubmit = (event) => {
    console.log(event);
    event.preventDefault();
    const updatedTask = {
      id: selectedTask.id,
      title: event.target.elements.title.value,
      done: event.target.elements.done.checked,
      planned: event.target.elements.planned.checked,
      comment: event.target.elements.comment.value,
      deadline: new Date(event.target.elements.deadline.value).toISOString()
    };

    console.log("updatedTask", updatedTask);

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
      <div className="modal">
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
                  <textarea type="text" name="comment" defaultValue={selectedTask.comment} />
                </div>
                <div className="input-box">
                  <div>Deadline:</div>
                  <input
                      type="datetime-local"
                      name="deadline"
                      defaultValue={selectedTask.deadline ? convertToLocalDateTimeString(selectedTask.deadline) : ''}
                  />
                </div>
                <div className="input-box check">
                  <div>Done:</div>
                  <input type="checkbox" name="done" defaultChecked={selectedTask.done} />
                </div>
                <div className="input-box check">
                  <div>STARed:</div>
                  <input type="checkbox" name="planned" defaultChecked={selectedTask.planned} />
                </div>
            </div>
            <button type="submit">Save</button>
            <img onClick={onRequestClose} className="close-btn" src={closeImg} />
            </form>
        )}
      </div>
    </Modal>
  );
};

export default EditTaskModal;
