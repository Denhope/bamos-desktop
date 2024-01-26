import RemovedItemsList from "@/components/mantainance/removeInstallComponents/RemovedItemsList";

import ProjectListView from "@/components/views/project/ProjectListView";

import { useAppDispatch, useTypedSelector } from "@/hooks/useTypedSelector";
import React, { FC, useEffect, useState } from "react";
import { getAllProjectRemovedItems } from "@/utils/api/thunks";

const RemoveItemsCheack = () => {
  const dispatch = useAppDispatch();
  const [open, setOpen] = useState(false);

  const onClose = () => {
    setOpen(false);
  };
  const { currentProject } = useTypedSelector((state) => state.projects);
  const { removedItems } = useTypedSelector((state) => state.removedItems);

  useEffect(() => {
    dispatch(getAllProjectRemovedItems(currentProject.projectWO));
  }, [dispatch, currentProject.projectWO]);
  return (
    <div
      className="flex flex-col mx-auto"
      style={{
        width: "93%",
      }}
    >
      {" "}
      {removedItems.length > 2 ? (
        <div
          className="flex my-0 mx-auto flex-col h-[86vh]"
          style={{
            width: "99%",
          }}
        >
          <RemovedItemsList data={removedItems} />
        </div>
      ) : (
        <div
          className="flex flex-col mx-auto"
          style={{
            width: "99%",
          }}
        >
          <ProjectListView />
        </div>
      )}
    </div>
  );
};

export default RemoveItemsCheack;
