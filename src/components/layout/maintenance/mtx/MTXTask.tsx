import { Row, Space, Spin } from "antd";
import Title from "antd/es/typography/Title";
import PlaneTaskList from "@/components/mantainance/mtx/planeTask/PlaneTaskList";

import { useAppDispatch, useTypedSelector } from "@/hooks/useTypedSelector";
import { IPlaneWO } from "@/models/IPlaneWO";
import React, { FC, useEffect } from "react";
import { getFilteredPlanesWO, getPlaneByID } from "@/utils/api/thunks";
type MTXTaskPropsType = {
  onRowClick: (record: IPlaneWO) => void;
};
const MTXTask: FC<MTXTaskPropsType> = ({ onRowClick }) => {
  const dispatch = useAppDispatch();

  useEffect(() => {
    const currentPlaneID = localStorage.getItem("currentPlaneID");

    if (currentPlaneID) {
      dispatch(getPlaneByID(JSON.parse(currentPlaneID)));
      // dispatch(getFilteredPlanesWO({ planeID: JSON.parse(currentPlaneID) }));
    }
  }, [dispatch]);
  useEffect(() => {
    const currentPlaneID = localStorage.getItem("currentPlaneID");

    if (currentPlaneID) {
      dispatch(getFilteredPlanesWO({ planeID: JSON.parse(currentPlaneID) }));
    }
  }, []);

  const { planesTasks, isLoading } = useTypedSelector((state) => state.planes);
  return (
    <div className="flex my-0 mx-auto flex-col  ">
      <Row className="my-0 py-0" justify={"space-between"}></Row>
      <PlaneTaskList
        data={planesTasks}
        isLoading={isLoading}
        onRowClick={onRowClick}
      ></PlaneTaskList>
    </div>
  );
};

export default MTXTask;
