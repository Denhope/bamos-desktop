import { Steps } from "antd";
import React, { FC, useEffect, useState } from "react";
import {
  EditOutlined,
  FormOutlined,
  OrderedListOutlined,
  ToolOutlined,
} from "@ant-design/icons";
import WOTypeForm from "./WOTypeForm";
import HeaderInformation from "./HeaderInformation";
import WorkStepForm from "./WorkStepForm";
import WorkStepClassifications from "./WorkStepClassifications";
import LinkForm from "./LinkForm";
import { IAdditionalTask } from "@/models/IAdditionalTask";
import MaterialAddForm from "./MaterialAddForm";
import WorkPerformedForm from "./WorkPerformedForm";
import AddActionForm from "./NRCAddActionForm";
import ActionDetailsForm from "./actions/NRCActionDetails";
import FinalActionForm from "./finalActions/FinalActionForm";
import { useAppDispatch, useTypedSelector } from "@/hooks/useTypedSelector";
import WorkStepEditForm from "./WorkStepEditForm";

export interface INRCADDFormForm {
  currentDefault: number;
  taskData: IAdditionalTask;
}

const NRCEditForm: FC<INRCADDFormForm> = ({ currentDefault, taskData }) => {
  const { currentAdditionalTask } = useTypedSelector(
    (state) => state.additioonalTasks
  );
  useEffect(() => {
    setCurrent(1);
  }, [currentAdditionalTask._id, currentAdditionalTask.id]);
  const [current, setCurrent] = useState(1);
  // setCurrent(currentDefault);

  const onFinishWOTypeForm = () => {
    setCurrent(1);
  };
  const onFinishHeaderInfoForm = () => {
    setCurrent(2);
  };
  const onFinishWorkStepForm = () => {
    setCurrent(3);
  };
  const WorkStepClassificationsForm = () => {
    setCurrent(4);
  };
  const onFinishLinkFormForm = () => {
    // setCurrent(5);
  };
  const onFinishMatForm = () => {
    setCurrent(5);
  };

  const onFinishWActionForm = () => {
    setCurrent(6);
  };
  const onFinishActionDetailsForm = () => {
    setCurrent(7);
  };
  const onFinishWorkPerformedForm = () => {
    setCurrent(8);
  };
  const onFinishWFinalActionForm = () => {
    setCurrent(9);
  };

  const forms = [
    <WOTypeForm onFinish={onFinishWOTypeForm} />,
    <HeaderInformation onFinish={onFinishHeaderInfoForm} taskData={taskData} />,
    <WorkStepEditForm taskData={taskData} onFinish={onFinishWorkStepForm} />,
    <WorkStepClassifications onFinish={WorkStepClassificationsForm} />,
    // <LinkForm onFinish={onFinishLinkFormForm} taskData={taskData} />,
    <MaterialAddForm onFinish={onFinishMatForm} />,
    <AddActionForm onFinish={onFinishWActionForm} />,
    <ActionDetailsForm
      onFinish={onFinishActionDetailsForm}
      data={taskData.actions}
    />,
    <WorkPerformedForm onFinish={onFinishWorkPerformedForm} />,
    <FinalActionForm onFinish={onFinishWFinalActionForm} />,
  ];

  return (
    <div className="flex justify-between">
      <div className="flex w-1/2">
        <Steps direction="vertical" onChange={setCurrent} current={current}>
          <Steps.Step
            title="Select W/O Type / Выберите тип работы"
            icon={<EditOutlined />}
          ></Steps.Step>
          <Steps.Step
            title="Header Information / Основная информация"
            icon={<FormOutlined />}
          ></Steps.Step>
          <Steps.Step
            title="Add Work Step / Добавить описание"
            icon={<OrderedListOutlined />}
          ></Steps.Step>
          <Steps.Step
            title="Work ТResources, Requests / Требования"
            icon={<OrderedListOutlined />}
          ></Steps.Step>
          {/* <Steps.Step
            title="Work References, Links / Ссылки"
            icon={<OrderedListOutlined />}
          ></Steps.Step> */}
          <Steps.Step
            title="Part, mateial Requests / Необходимые компоненты, Оборудование"
            icon={<OrderedListOutlined />}
          ></Steps.Step>
          <Steps.Step
            title=" Action / Действия"
            icon={<OrderedListOutlined />}
          ></Steps.Step>
          <Steps.Step
            title=" Action Details / Просмотр деталей действия"
            icon={<OrderedListOutlined />}
          ></Steps.Step>
          <Steps.Step
            title="Work Performed / Работа выполнена"
            icon={<ToolOutlined />}
          ></Steps.Step>

          <Steps.Step
            title="Final Action / Финальное действие"
            icon={<ToolOutlined />}
          ></Steps.Step>
        </Steps>
      </div>

      <div className="flex  w-1/2 justify-items-center ">{forms[current]}</div>
    </div>
  );
};

export default NRCEditForm;
