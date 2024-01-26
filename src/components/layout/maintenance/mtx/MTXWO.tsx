import { Row, Space, Spin } from "antd";
import Title from "antd/es/typography/Title";
import StatusList from "@/components/mantainance/mtx/airCraft/StatusList";
import PlaneTaskList from "@/components/mantainance/mtx/planeTask/PlaneTaskList";
import TaskNavigationPanel from "@/components/mantainance/mtx/planeTask/TaskNavigationPanel";
import WOList from "@/components/mantainance/mtx/wo/WOList";
import { useAppDispatch, useTypedSelector } from "@/hooks/useTypedSelector";
import { IPlaneWO } from "@/models/IPlaneWO";
import React, { FC, useEffect } from "react";
import {
  getAllPlanes,
  getFilteredPlanesWO,
  getPlaneByID,
} from "@/utils/api/thunks";
type MTXWOPropsType = {
  onRowClick: (record: any) => void;
};
const MTXWO: FC<MTXWOPropsType> = ({ onRowClick }) => {
  const dispatch = useAppDispatch();
  const { isLoading, planesWO } = useTypedSelector((state) => state.planes);

  useEffect(() => {
    const currentPlaneID = localStorage.getItem("currentPlaneID");
    if (currentPlaneID) {
      dispatch(getPlaneByID(JSON.parse(currentPlaneID)));
      dispatch(getFilteredPlanesWO({ planeID: JSON.parse(currentPlaneID) }));
    }
  }, [dispatch, localStorage.getItem("currentPlaneID")]);
  const { planes } = useTypedSelector((state) => state.planes);
  return (
    <div className="flex my-0 mx-auto flex-col">
      <Row className="my-0 py-0" justify={"space-between"}></Row>

      <WOList
        data={planesWO}
        isLoading={isLoading}
        onRowClick={onRowClick}
      ></WOList>
    </div>
  );
};

export default MTXWO;
