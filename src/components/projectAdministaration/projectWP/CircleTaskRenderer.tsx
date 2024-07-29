import React from 'react';
import { ICellRendererParams } from 'ag-grid-community';

const CircleTaskRenderer = (params: ICellRendererParams) => {
  const { data } = params;
  const taskNumberID = data.taskNumberID;

  let color = '';

  if (taskNumberID) {
    color = 'green';
  } else {
    color = 'red';
  }

  const circleStyle = {
    width: '15px',
    height: '15px',
    borderRadius: '50%',
    backgroundColor: color,
    display: 'inline-block',
  };

  return <div style={circleStyle}></div>;
};

export default CircleTaskRenderer;
