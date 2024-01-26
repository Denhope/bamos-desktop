import { IProjectTask } from "@/models/IProjectTaskMTB";
import React, { FC } from "react";
type CloseContentProps = {
  task?: IProjectTask | null;
};
const CloseContent: FC<CloseContentProps> = ({ task }) => {
  return <div></div>;
};

export default CloseContent;
