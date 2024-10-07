import React, { FC, useEffect, useState } from 'react';
import GoodsReceivingSrarchForm from './GoodsReceivingSrarchForm';
import OrderDetailsForm from './OrderDetailsForm';
import BookingOrderPartsList from './BookingOrderPartsList';
import OrderList from './OrderList';
import { IOrder, OrderType } from '@/models/IOrder';
type BookingPartSideType = {
  onSelectedOrder?: (record: any, rowIndex?: any) => void;
  onUpdateOrder?: any;
};
const BookingPartSide: FC<BookingPartSideType> = ({
  onSelectedOrder,
  onUpdateOrder,
}) => {
  const [orders, setOrders] = useState<IOrder[] | []>([]);
  const [data, setdata] = useState<IOrder[] | []>(orders);
  useEffect(() => {
    if (orders) {
      setdata(orders);
    }
  }, [orders]);

  useEffect(() => {
    if (onUpdateOrder && data) {
      const index = data.findIndex(
        (order: IOrder) => order._id === onUpdateOrder._id
      );
      if (index !== -1) {
        const newData = [...data];
        newData[index] = onUpdateOrder;
        setdata(newData);
      }
    }
  }, [onUpdateOrder, data]);

  return (
    <div className="  h-[78vh] flex flex-col gap-2 w-auto bg-white  rounded-md border-gray-400">
      <GoodsReceivingSrarchForm onOrdersSearch={setOrders} />
      <OrderList
        orders={data}
        scroll={16}
        onSelectedOrders={(record: any): void => {
          onSelectedOrder && onSelectedOrder(record);
        }}
      />
    </div>
  );
};

export default BookingPartSide;
