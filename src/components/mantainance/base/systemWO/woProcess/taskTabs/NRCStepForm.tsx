import { IProjectTask } from "@/models/IProjectTaskMTB";
import React, { FC } from "react";
type NRCStepFormProps = {
  task?: IProjectTask | null;
  disabled?: boolean;
};
const NRCStepForm: FC<NRCStepFormProps> = ({ task, disabled }) => {
  return <div></div>;
};

export default NRCStepForm;
