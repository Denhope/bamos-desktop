import { Spin } from "antd";
import Title from "antd/es/typography/Title";
import WPList from "@/components/mantainance/base/wp/WPList";
import StatusList from "@/components/mantainance/mtx/airCraft/StatusList";
import PlaneTaskList from "@/components/mantainance/mtx/planeTask/PlaneTaskList";
import TaskNavigationPanel from "@/components/mantainance/mtx/planeTask/TaskNavigationPanel";
import { useAppDispatch, useTypedSelector } from "@/hooks/useTypedSelector";
import { IProjectInfo } from "@/models/IProject";
import React, { FC, useEffect } from "react";
import {
  fetchAllProjects,
  getAllPlanes,
  getFilteredProjects,
  getPlaneByID,
} from "@/utils/api/thunks";
type MTBWPPropsType = {
  onRowClick: (record: any) => void;
};
const MTBWP: FC<MTBWPPropsType> = ({ onRowClick }) => {
  const dispatch = useAppDispatch();

  useEffect(() => {
    const currentCompanyID = localStorage.getItem("companyID");
    if (currentCompanyID) {
      dispatch(
        getFilteredProjects({
          companyID: currentCompanyID,
          projectType: ["MAINTENANCE_AC_PROJECT"],
        })
      );
    }
  }, []);

  const { projects, isLoading } = useTypedSelector((state) => state.mtbase);
  return (
    <div className="flex my-0 mx-auto flex-col">
      <WPList
        data={projects}
        isLoading={false}
        onRowClick={onRowClick}
      ></WPList>
    </div>
  );
};

export default MTBWP;
