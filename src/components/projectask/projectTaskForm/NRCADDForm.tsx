import { Steps } from "antd";
import React, { FC, useEffect, useState } from "react";
import {
  EditOutlined,
  FormOutlined,
  OrderedListOutlined,
  ToolOutlined,
} from "@ant-design/icons";
import WOTypeForm from "../../views/activeTask/NRC/changeForm/WOTypeForm";
import HeaderInformation from "../../views/activeTask/NRC/changeForm/HeaderInformation";
import WorkStepForm from "../../views/activeTask/NRC/changeForm/WorkStepForm";
import WorkStepClassifications from "../../views/activeTask/NRC/changeForm/WorkStepClassifications";

import { useTypedSelector } from "@/hooks/useTypedSelector";
import { IAdditionalTask } from "@/models/IAdditionalTask";
import MaterialAddForm from "../../views/activeTask/NRC/changeForm/MaterialAddForm";

import AddActionForm from "../../views/activeTask/NRC/changeForm/NRCAddActionForm";

export interface INRCADDFormForm {
  currentDefault: number;
  taskData: IAdditionalTask;
}

const NRCADDForm: FC<INRCADDFormForm> = ({ currentDefault, taskData }) => {
  const { currentProjectTask } = useTypedSelector((state) => state.projectTask);

  useEffect(() => {
    setCurrent(1);
  }, [currentProjectTask._id || currentProjectTask.id]);
  const [current, setCurrent] = useState(currentDefault);

  const [WOTypeDetails, setWOTypeDetails] = useState(null);
  const [HeaderInfoDetails, setHeaderInfoDetails] = useState(null);
  const [WorkStepFormDetails, setWorkStepFormDetails] = useState(null);
  const [WorkStepClassificationDetails, setWorkStepClassificationDetails] =
    useState(null);

  const onFinishWOTypeForm = () => {
    // setWOTypeDetails;
    setCurrent(1);
  };
  const onFinishHeaderInfoForm = () => {
    // setHeaderInfoDetails(values);
    // console.log(HeaderInfoDetails);
    setCurrent(2);
  };
  const onFinishWorkStepForm = () => {
    // setWorkStepFormDetails;
    setCurrent(3);
  };
  const WorkStepClassificationsForm = () => {
    // setWorkStepClassification;
    setCurrent(4);
  };
  const onFinishLinkFormForm = () => {
    // setWorkStepClassification;
    setCurrent(5);
  };
  const onFinishMatForm = () => {
    // setWorkStepClassification;
    setCurrent(5);
  };

  const onFinishWActionForm = () => {
    // setWorkStepClassification;
    setCurrent(7);
  };
  // const onFinishActionDetailsForm = () => {
  //   // setWorkStepClassification;
  //   setCurrent(8);
  // };
  const onFinishWorkPerformedForm = () => {
    // setWorkStepClassification;s
    setCurrent(8);
  };

  const forms = [
    <WOTypeForm onFinish={onFinishWOTypeForm} />,
    <HeaderInformation onFinish={onFinishHeaderInfoForm} taskData={taskData} />,
    <WorkStepForm taskData={taskData} onFinish={onFinishWorkStepForm} />,
    <WorkStepClassifications onFinish={WorkStepClassificationsForm} />,
    // <LinkForm onFinish={onFinishLinkFormForm} taskData={taskData} />,
    <MaterialAddForm onFinish={onFinishMatForm} />,
    <AddActionForm onFinish={onFinishWActionForm} />,
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
          {/* <Steps.Step
            title=" Action Details / Просмотр деталей действия"
            icon={<OrderedListOutlined />}
          ></Steps.Step>
          <Steps.Step
            title="Work Performed / Работа выполнена"
            icon={<ToolOutlined />}
          ></Steps.Step> */}
          {/* <Steps.Step
            title="Action Details"
            icon={<OrderedListOutlined />}
          ></Steps.Step> */}
          {/* <Steps.Step title="Final Action" icon={<ToolOutlined />}></Steps.Step>
          <Steps.Step title="Close W/O" icon={<ToolOutlined />}></Steps.Step> */}
        </Steps>
      </div>

      <div className="flex  w-1/2 justify-items-center ">{forms[current]}</div>
    </div>
  );
};

export default NRCADDForm;
