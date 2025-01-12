import React from 'react';
import CountdownTimer from './CountdownTimer';
import editImg from '../assets/edit.svg';
import trashImg from '../assets/trash.svg';
import starImg from '../assets/star.svg';
import './TaskItem.scss'

function TaskItem({ task, onEdit, onDelete, onSelect }) {
  return (
    <div
      key={task.id}
      className="table-elem table-grid"
      onClick={() => onSelect(task)}
    >
      <div className="title-col">
        {task.planned && <img className="star" src={starImg} alt="star" />}
        <span>{task.title}</span>
      </div>
      <CountdownTimer targetDate={new Date(task.deadline)} />
      <div className={`status-box ${task.done}`}>
        {task.done === 'done' ? 'Done' : task.done === 'todo' ? 'To do' : 'In progress'}
      </div>
      <div
        onClick={(event) => {
          event.stopPropagation();
          onEdit(task);
        }}
        className="edit-box"
      >
        <div className="edit">
          <img src={editImg} alt="edit" />
        </div>
      </div>
      <div
        onClick={(event) => {
          event.stopPropagation();
          onDelete(task.id);
        }}
        className="edit-box"
      >
        <div className="edit">
          <img src={trashImg} alt="delete" />
        </div>
      </div>
    </div>
  );
}

export default TaskItem;