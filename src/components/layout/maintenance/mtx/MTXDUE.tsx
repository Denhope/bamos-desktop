import { Row, Space, Spin } from "antd";
import Title from "antd/es/typography/Title";
import StatusList from "@/components/mantainance/mtx/airCraft/StatusList";
import PlaneTaskList from "@/components/mantainance/mtx/planeTask/PlaneTaskList";
import TaskNavigationPanel from "@/components/mantainance/mtx/planeTask/TaskNavigationPanel";
import WOList from "@/components/mantainance/mtx/wo/WOList";
import { useAppDispatch, useTypedSelector } from "@/hooks/useTypedSelector";
import { IPlaneWO } from "@/models/IPlaneWO";
import { IPlaneTaskResponce } from "@/models/ITask";
import React, { FC, useEffect } from "react";
import { ITaskTypeUpdate } from "@/types/TypesData";
import {
  getAllPlanes,
  getFilteredPlanesWO,
  getFilteredPlanesTasksForDue,
  getPlaneByID,
} from "@/utils/api/thunks";
type MTXDUEPropsType = {
  onRowClick: (record: any) => void;
};
const MTXDUE: FC<MTXDUEPropsType> = ({ onRowClick }) => {
  const dispatch = useAppDispatch();

  useEffect(() => {
    const currentPlaneID = localStorage.getItem("currentPlaneID");

    if (currentPlaneID) {
      dispatch(getPlaneByID(JSON.parse(currentPlaneID)));
    }
  }, [dispatch]);
  useEffect(() => {
    const currentPlaneID = localStorage.getItem("currentPlaneID");

    if (currentPlaneID) {
      dispatch(getFilteredPlanesWO({ planeID: JSON.parse(currentPlaneID) }));
    }
  }, []);

  const { dueTasks, isLoading } = useTypedSelector((state) => state.planes);
  return (
    <div
      className="flex my-0 px-0  mx-auto flex-col"
      // style={{
      //   width: '100%',
      // }}
    >
      <Row className="my-0 py-0" justify={"space-between"}></Row>
      <PlaneTaskList
        onRowClick={onRowClick}
        data={dueTasks}
        isLoading={isLoading}
      ></PlaneTaskList>
    </div>
  );
};

export default MTXDUE;
