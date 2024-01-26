import { Spin } from "antd";
import Title from "antd/es/typography/Title";
import StatusList from "@/components/mantainance/mtx/airCraft/StatusList";
import PlaneTaskList from "@/components/mantainance/mtx/planeTask/PlaneTaskList";
import TaskNavigationPanel from "@/components/mantainance/mtx/planeTask/TaskNavigationPanel";
import { useAppDispatch, useTypedSelector } from "@/hooks/useTypedSelector";
import React, { useEffect } from "react";
import { getAllPlanes, getPlaneByID } from "@/utils/api/thunks";

const MTXStatus = () => {
  const dispatch = useAppDispatch();

  useEffect(() => {
    const currentPlaneID = localStorage.getItem("currentPlaneID");
    dispatch(getAllPlanes());
    if (currentPlaneID) {
      dispatch(getPlaneByID(JSON.parse(currentPlaneID)));

      // navigate(storedKey);
    }
  }, [dispatch]);
  const { planes } = useTypedSelector((state) => state.planes);
  return (
    <div
      className="flex my-0 mx-auto flex-col"
      // style={{
      //   width: '95%',
      // }}
    >
      {/* <Title className="my-0 text-gray-500 py-0" level={5}>
        STATUS LIST
      </Title> */}
      {planes && planes.length ? (
        <StatusList data={planes}></StatusList>
      ) : (
        <Spin
          style={{ height: "74vh" }}
          className="flex  flex-col items-center justify-center"
          tip="Loading"
          size="large"
        ></Spin>
      )}
    </div>
  );
};

export default MTXStatus;
