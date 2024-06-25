import { ICellRendererParams } from 'ag-grid-community';
import React from 'react';

const CircleRenderer = (params: ICellRendererParams) => {
  const { data } = params;
  const availableQTY = data.availableQTY || 0;
  const amout = data.amout || 0;
  const bookedQuantity = data.bookedQuantity || 0;
  const reservationQTY = data.reservationQTY || 0;
  const availableAllStoreQTY = data.availableAllStoreQTY || 0;

  const requiredQty = amout - bookedQuantity;
  let color = '';

  if (availableQTY >= requiredQty || reservationQTY === amout) {
    color = 'green';
  } else if (
    availableQTY < requiredQty &&
    availableAllStoreQTY >= requiredQty
  ) {
    color = 'orange';
  } else if (availableQTY < requiredQty) {
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

export default CircleRenderer;
