import { Descriptions, Divider, List, QRCode } from "antd";
import Title from "antd/es/typography/Title";
import InstrumentListActiveTask from "@/components/projectask/projectTaskForm/InstrumentListActiveTask";
import JobDescriptionList from "@/components/projectask/projectTaskForm/JobDescriptionList";
import MaterialListActiveTask from "@/components/projectask/projectTaskForm/MaterialListActiveTask";

import { useTypedSelector } from "@/hooks/useTypedSelector";
import moment from "moment";

import React, { FC } from "react";
import { ITaskType } from "@/types/TypesData";

const WOCardView: FC = () => {
  interface IAmtossDTO1 {
    amtoss?: string;
  }
  const { currentProjectTask } = useTypedSelector((state) => state.projectTask);
  const { currentProject } = useTypedSelector((state) => state.projects);

  const objArr = currentProjectTask.taskId?.ammtossArrNew?.map(
    (e: string) =>
      ({
        amtoss: e,
      } || [])
  );
  return (
    <div className="flex  flex-col gap-1  mx-auto ">
      <Descriptions
        className="my-0"
        size="small"
        layout="vertical"
        bordered
        column={{ xxl: 5, xl: 5, lg: 5, md: 2, sm: 1, xs: 1 }}
      >
        <Descriptions.Item>
          <p className="text-xl font-semibold">
            Minsk Civil Aviation Plant No. 407
          </p>
        </Descriptions.Item>
        <Descriptions.Item className="flex">
          <p className="text-xs font-semibold my-0 py-0 "> Minsk, </p>{" "}
          <p className="text-xs font-semibold my-0 py-0 ">the territory of</p>
          <p className="text-xs font-semibold my-0 py-0 ">
            the National Airport “Minsk” 134
          </p>
          <p className="text-xs font-semibold my-0 py-0 ">
            225320 Republic of Belarus
          </p>
        </Descriptions.Item>
        <Descriptions.Item className="flex align-top">
          <p className="text-xs my-0 p-0 px-0 mx-0">WO/Заказ</p>
          <p className="text-xl font-semibold">
            {currentProjectTask._id || currentProjectTask.id}
          </p>
        </Descriptions.Item>
        <Descriptions.Item>
          <p className="text-xs my-0 py-1 px-0 mx-0">Barcode / Штрихкод</p>
          <div className="flex justify-items-center mx-auto my-0">
            <QRCode
              className="justify-items-center mx-auto"
              size={96}
              value={currentProjectTask._id || currentProjectTask.id || ""}
            />
          </div>
          <p className="text-xs py-1 font-semibold my-0 text-center ">
            WO-{currentProjectTask._id || currentProjectTask.id || ""}
          </p>
        </Descriptions.Item>
        <Descriptions.Item>
          <p className="text-xs my-0 p-0 px-0 mx-0">
            Registration / Рег. номер
          </p>
          <p className="text-xl font-semibold">
            RA-{currentProject.aplicationId.planeNumber}
          </p>
          <p className="text-sm font-semibold">
            {currentProject.aplicationId.planeType}
          </p>
        </Descriptions.Item>
        <Descriptions.Item>
          <p className="text-xs my-0 p-0 px-0 mx-0">Type / Тип</p>
          <p className="text-xl font-semibold">{currentProjectTask.taskType}</p>
        </Descriptions.Item>
        <Descriptions.Item className="flex align-top">
          <p className="text-xs my-0 p-0 px-0 mx-0">Origin / Источник</p>
          <p className="text-xl font-semibold"></p>
        </Descriptions.Item>
        <Descriptions.Item className="flex align-top">
          <p className="text-xs my-0 p-0 px-0 mx-0">ATA</p>
          <p className="text-xl font-semibold">
            {currentProjectTask.taskId?.amtossNewRev}
          </p>
          <p className="text-xs my-0 p-0 px-0 mx-0"></p>
        </Descriptions.Item>

        <Descriptions.Item className="flex align-top">
          <p className="text-xs my-0 p-0 px-0 mx-0">Zone / Зона</p>
          <p className="text-xl font-semibold">
            {currentProjectTask.taskId?.area}
          </p>
          <p className="text-xs my-0 p-0 px-0 mx-0"></p>
        </Descriptions.Item>
        <Descriptions.Item className="flex items-start align-top">
          <p className="text-xs my-0 p-0 px-0 mx-0">Area / Область</p>
          <p className="text-xl font-semibold"></p>
          <p className="text-xs my-0 p-0 px-0 mx-0"></p>
        </Descriptions.Item>
        <Descriptions.Item label="Workpackage / Пакет">
          <p className="text-xs my-0 p-0 px-0 mx-0">Workpackage No. / Номер</p>
          <p className="text-lg font-semibold">
            {currentProject.aplicationId.aplicationName}
          </p>
        </Descriptions.Item>
        <Descriptions.Item className="flex align-top">
          <p className="text-xs my-0 p-0 px-0 mx-0">
            План. Дата начала - План. Дата окончания
          </p>
          <p className="text-xl font-semibold">{null}</p>
        </Descriptions.Item>
        <Descriptions.Item className="flex align-top">
          <p className="text-xs my-0 p-0 px-0 mx-0">
            Maintenance Provider / Поставщик услуг ТО
          </p>
          <p className="text-xl font-semibold">
            Minsk Civil Aviation Plant No. 407
          </p>
        </Descriptions.Item>
      </Descriptions>

      <Descriptions
        size="small"
        layout="vertical"
        bordered
        column={{ xxl: 1, xl: 1, lg: 1, md: 1, sm: 1, xs: 1 }}
      >
        <Descriptions.Item
          label={
            <div className="flex justify-between my-0 py-0">
              <p className="my-0  border-4">
                Description Step/Описание работы, дефекта
              </p>
              <p className="my-0">
                пользователь(1799){" "}
                {moment(currentProjectTask.createDate).format(
                  "Do MMM  YYYY, h:mm:a"
                )}
              </p>
            </div>
          }
        >
          <p className="text-lg font-semibold py-0 my-0">
            TASKCARD/Задача: {currentProjectTask.taskId?.taskNumber}
          </p>
          <p>TITLE: {currentProjectTask.taskId?.taskDescription}</p>
        </Descriptions.Item>
      </Descriptions>
      <Descriptions
        layout="vertical"
        size="small"
        bordered
        column={{ xxl: 2, xl: 2, lg: 2, md: 2, sm: 1, xs: 1 }}
      >
        <Descriptions.Item label="Type / Тип">AMM</Descriptions.Item>
        <Descriptions.Item label="Ссылка">
          <List>
            <div>
              {objArr?.map((item: ITaskType) => (
                <li className="">{item.amtoss} </li>
              ))}
            </div>
          </List>
        </Descriptions.Item>
      </Descriptions>
      <JobDescriptionList data={currentProjectTask.actions} />

      <Title className="my-0" level={5}>
        Part Request / Необходимые компоненты и материалы
      </Title>

      <MaterialListActiveTask
        taskNumber={currentProjectTask.taskId?.taskNumber || ""}
      ></MaterialListActiveTask>
      <Title className="my-0" level={5}>
        Part Request / Необходимый инструмент
      </Title>
      <InstrumentListActiveTask
        taskNumber={currentProjectTask.taskId?.taskNumber || ""}
      ></InstrumentListActiveTask>
      {/* <div className="flex mt-2"> */}
      <Descriptions
        className=" my-0 py-0"
        layout="vertical"
        size="small"
        title={
          <div className="flex justify-between">
            <p className="my-0 py-0">
              Planning Qualifications / Плановые трудозатраты
            </p>
            <p className="px-10 my-0 py-0">Times / Фактические трудозатраты</p>
          </div>
        }
        bordered
        column={{ xxl: 6, xl: 6, lg: 3, md: 2, sm: 1, xs: 1 }}
      >
        <Descriptions.Item
          label="PSkill / Scope
Категории исполнителей"
        >
          {null}
        </Descriptions.Item>
        <Descriptions.Item
          label="Est. Man
План. кол-во исполн."
        >
          {currentProjectTask.taskId?.workerNumber}
        </Descriptions.Item>
        <Descriptions.Item
          label="Est. MHRS
          План. трудозатраты"
        >
          <p className="h-2">{currentProjectTask.taskId?.mainWorkTime}</p>
        </Descriptions.Item>
        <Descriptions.Item label={<p className="py-3 my-0">Sign / Подпись</p>}>
          <p className="h-1"></p>
          {null}
        </Descriptions.Item>
        <Descriptions.Item
          label="Duration /
            Продолжительность"
        >
          {null}
        </Descriptions.Item>
        <Descriptions.Item
          label="Date /
            Дата"
        >
          {/* {(currentProjectTask.finishDate &&
            moment(currentProjectTask.finishDate).format(
              'Do MMM  YYYY, h:mm:a'
            )) ||
            null} */}
          {null}
        </Descriptions.Item>
      </Descriptions>
      {/* <Descriptions
          className="w-1/2"
          layout="vertical"
          size="small"
          title="Times / Фактические трудозатраты"
          bordered
          column={{ xxl: 3, xl: 3, lg: 3, md: 3, sm: 3, xs: 3 }}
        >
          <Descriptions.Item
            label={<p className="py-3 my-0">Sign / Подпись</p>}
          >
            <p className="h-1"></p>
            {null}
          </Descriptions.Item>
          <Descriptions.Item
            label="Duration /
            Продолжительность"
          >
            {null}
          </Descriptions.Item>
          <Descriptions.Item
            label="Date /
            Дата"
          >
            {(currentProjectTask.finishDate &&
              moment(currentProjectTask.finishDate).format(
                'Do MMM  YYYY, h:mm:a'
              )) ||
              null}
          </Descriptions.Item>
        </Descriptions> */}
      {/* </div> */}

      <Descriptions
        className="w-full mt-2 py-0"
        layout="vertical"
        size="small"
        title="Work Performed / Работа выполнена Заказ закрыт"
        bordered
        column={{ xxl: 4, xl: 4, lg: 4, md: 2, sm: 2, xs: 2 }}
      >
        <Descriptions.Item label="Date(UTC) Time / Дата Время(UTC)">
          {(currentProjectTask.finishDate &&
            moment(currentProjectTask.finishDate).format(
              "Do MMM  YYYY, h:mm:a"
            )) ||
            null}
        </Descriptions.Item>
        <Descriptions.Item label="Place / Station Место / Станция">
          MSQ
        </Descriptions.Item>
        <Descriptions.Item label="Closing Sign / Stamp Закрыл (Подпись / Штамп)">
          <p className="h-2">
            {currentProjectTask.optional?.finalAction?.closingSing}
          </p>
        </Descriptions.Item>
        <Descriptions.Item label="Double Inspection / Двойной контроль">
          <p className="h-2">
            {currentProjectTask.optional?.finalAction?.DIClosingSing}
          </p>
        </Descriptions.Item>
      </Descriptions>
      {/* <Descriptions
        size="small"
        layout="vertical"
        bordered
        column={{ xxl: 1, xl: 1, lg: 1, md: 1, sm: 1, xs: 1 }}
      > */}
      {/* <Descriptions.Item
          label={
            <div className="flex justify-between my-0 py-0">
              <p className="my-0  border-4">
                Released To Service / Допуск к эксплуатации
              </p>
            </div>
          }
        >
          <p className="text-sm py-0 my-0">
            CRS for the work caried out, either for single workorder or for the
            complete workpack, to be issued in Aircraft Technical Logbook - for
            line maintenance or in MRO CRS Form - for base maintenance.
            Свидетельство о ТО ВС (единичный заказ или весь пакет) должно быть
            оформлено для Оперативного ТО - в Бортовом Журнале, для
            Периодического ТО - на бланке Свидетельства о ТО ВС Организации по
            ТО.
          </p>
        </Descriptions.Item> */}
      {/* </Descriptions> */}
    </div>
  );
};

export default WOCardView;
