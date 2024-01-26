import { Steps } from "antd";
import React, { FC, useState } from "react";
import {
  EditOutlined,
  FormOutlined,
  OrderedListOutlined,
  ToolOutlined,
} from "@ant-design/icons";

import { useTypedSelector } from "@/hooks/useTypedSelector";

import { IProjectTaskAll } from "@/models/IProjectTask";
import HeaderWOInfo from "./HeaderWOInfo";

import ActionDetailsFormView from "./WOActionsDetailsFormView";
import ReferenceLinkFormView from "./ReferenceLinkFormView";
import WorkPerformedFormView from "./WPWorkForm";
import WOTypeFormView from "./WOTypeFormView";
import AddActionForm from "./WOAddActionFormView";
import WOFinalActionForm from "./finalActions/WOFinalActionsFormView";

export interface INRCADDFormForm {
  currentDefault: number;
  taskData: IProjectTaskAll;
}

const WOFormChangeView: FC<INRCADDFormForm> = ({
  currentDefault,
  taskData,
}) => {
  const [current, setCurrent] = useState(currentDefault);

  const onFinishWOTypeForm = () => {
    setCurrent(1);
  };
  const onFinishHeaderInfoForm = () => {
    setCurrent(2);
  };

  // const onFinishLinkFormForm = () => {
  //   setCurrent(3);
  // };

  const onFinishWorkPerformedForm = () => {
    setCurrent(3);
  };
  const onFinishWActionForm = () => {
    setCurrent(5);
  };
  const onFinishActionDetailsForm = () => {
    setCurrent(4);
  };

  const forms = [
    <WOTypeFormView onFinish={onFinishWOTypeForm} />,
    <HeaderWOInfo onFinish={onFinishHeaderInfoForm} taskData={taskData} />,

    // <ReferenceLinkFormView
    //   onFinish={onFinishLinkFormForm}
    //   taskData={taskData}
    // />,

    <WorkPerformedFormView onFinish={onFinishWorkPerformedForm} />,
    <ActionDetailsFormView
      onFinish={onFinishActionDetailsForm}
      data={taskData.actions || []}
    />,
    <AddActionForm onFinish={onFinishWActionForm} />,

    <WOFinalActionForm />,
  ];

  return (
    <div className="flex justify-between">
      <div className="flex w-1/2">
        <Steps direction="vertical" onChange={setCurrent} current={current}>
          <Steps.Step
            title="Select W/O Type / Тип работы"
            icon={<EditOutlined />}
          ></Steps.Step>
          <Steps.Step
            title="Header Information / Основная информация"
            icon={<FormOutlined />}
          ></Steps.Step>
          {/* <Steps.Step
            title="Work References, Links / Ссылки"
            icon={<OrderedListOutlined />}
          ></Steps.Step> */}
          <Steps.Step
            title="Work Performed / Работа выполнена"
            icon={<ToolOutlined />}
          ></Steps.Step>{" "}
          <Steps.Step
            title=" Action Details / Редактирование действия"
            icon={<OrderedListOutlined />}
          ></Steps.Step>
          <Steps.Step
            title=" Add new Action / Добавить новое действие"
            icon={<OrderedListOutlined />}
          ></Steps.Step>
          <Steps.Step
            title=" Final Action / Финальное действие"
            icon={<OrderedListOutlined />}
          ></Steps.Step>
        </Steps>
      </div>

      <div className="flex  w-1/2 justify-items-center ">{forms[current]}</div>
    </div>
  );
};

export default WOFormChangeView;
