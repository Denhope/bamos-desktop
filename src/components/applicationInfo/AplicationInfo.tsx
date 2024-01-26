import React, { FC, useState } from "react";
import { Button, Descriptions, Modal, Space } from "antd";
import { useTypedSelector } from "@/hooks/useTypedSelector";
import { includeTasks } from "@/services/utilites";
import TaskViewList from "@/components/shared/TaskViewList";
import AccessList from "@/components/access/AccessList";
import HardAccessList from "@/components/access/HardAccessList";
import { useNavigate } from "react-router-dom";
import { RouteNames } from "@/router";

const AplicationInfo: FC = () => {
  const { routineTasks, additionalTasks, hardTimeTasks, aplicationName } =
    useTypedSelector((state) => state.application.currentAplication);
  const { allTasks } = useTypedSelector((state) => state.tasks);
  const { currentAplication, isSetCurrentAplication } = useTypedSelector(
    (state) => state.application
  );
  const history = useNavigate();
  const filteredRoutineItems = includeTasks(allTasks, routineTasks);
  const filteredAdditionalItems = includeTasks(allTasks, additionalTasks);
  const filteredHardTimesItems = includeTasks(allTasks, hardTimeTasks);
  const allCheackTasks = [...filteredRoutineItems, ...filteredAdditionalItems];
  const [open, setOpen] = useState(false);
  const [open1, setOpen1] = useState(false);
  const [open2, setOpen2] = useState(false);
  const [open3, setOpen3] = useState(false);
  const [open4, setOpen4] = useState(false);

  return (
    <>
      {isSetCurrentAplication ? (
        <div>
          <div>
            <Descriptions
              title="Основные данные о заявке"
              bordered
              column={{ xxl: 3, xl: 2, lg: 2, md: 2, sm: 1, xs: 1 }}
            >
              <Descriptions.Item label="Найменование">
                {currentAplication.aplicationName}
              </Descriptions.Item>

              <Descriptions.Item label="Заказчик">
                {currentAplication.companyName}
              </Descriptions.Item>
              <Descriptions.Item label="Тип ВС">
                {currentAplication.planeType}
              </Descriptions.Item>
              <Descriptions.Item label="Заводской номер">
                {currentAplication.planeNumber}
              </Descriptions.Item>
              <Descriptions.Item label="Тип ТО">
                {currentAplication.serviceType}
              </Descriptions.Item>
              <Descriptions.Item label="Дата поступления заявки">
                {currentAplication.dateOfAplication}
              </Descriptions.Item>
            </Descriptions>
            <Descriptions
              bordered
              className="mt-5"
              column={{ xxl: 3, xl: 2, lg: 2, md: 2, sm: 2, xs: 1 }}
            ></Descriptions>

            <Descriptions
              className="mt-5"
              bordered
              column={{ xxl: 3, xl: 2, lg: 2, md: 2, sm: 1, xs: 1 }}
            >
              <Descriptions.Item label="Рутинные задачи">
                <Space className="flex  flex-col">
                  {" "}
                  всего: {currentAplication.routineTasks.length}
                  <Button
                    block
                    type="primary"
                    size="small"
                    onClick={() => setOpen(true)}
                  >
                    просмотреть
                  </Button>
                  <Modal
                    title="Список рутинных задач"
                    centered
                    open={open}
                    okType={"default"}
                    cancelText="отмена"
                    okText="просмотр трудоемкости"
                    onOk={() => {
                      setOpen(false);
                      history(`${RouteNames.CHEACK_LABORCOAST}`);
                    }}
                    onCancel={() => setOpen(false)}
                    width={"90%"}
                  >
                    <TaskViewList
                      filteredItems={filteredRoutineItems}
                      fileName={`Рутинные задачи-${aplicationName}`}
                    />
                  </Modal>
                </Space>
              </Descriptions.Item>

              <Descriptions.Item label="Дополнительные работы ">
                <Space className="flex  flex-col">
                  {" "}
                  всего: {currentAplication.additionalTasks.length}
                  <Button
                    block
                    type="primary"
                    size="small"
                    onClick={() => setOpen1(true)}
                  >
                    просмотреть
                  </Button>
                  <Modal
                    title="Список Бюллетеней и распоряжений"
                    centered
                    open={open1}
                    cancelText="отмена"
                    okType={"default"}
                    okText="просмотр трудоемкости"
                    onOk={() => {
                      setOpen1(false);
                      history(`${RouteNames.CHEACK_LABORCOAST}`);
                    }}
                    onCancel={() => setOpen1(false)}
                    width={"90%"}
                  >
                    <TaskViewList
                      filteredItems={filteredAdditionalItems}
                      fileName={`Бюллетени и распоряжения-${aplicationName}`}
                    />
                  </Modal>
                </Space>
              </Descriptions.Item>
              <Descriptions.Item label="Работы ВНЕ ВС ">
                <Space className="flex  flex-col">
                  {" "}
                  всего: {currentAplication.hardTimeTasks.length}
                  <Button
                    block
                    type="primary"
                    size="small"
                    onClick={() => setOpen2(true)}
                  >
                    просмотреть
                  </Button>
                  <Modal
                    title="Список работ ВНЕ ВС"
                    centered
                    open={open2}
                    cancelText="отмена"
                    okType={"default"}
                    okText="просмотр трудоемкости"
                    onOk={() => {
                      setOpen2(false);
                      history(`${RouteNames.CHEACK_LABORCOAST}`);
                    }}
                    onCancel={() => setOpen2(false)}
                    width={"90%"}
                  >
                    <TaskViewList
                      filteredItems={filteredHardTimesItems}
                      fileName={`Работы ВНЕ ВС-${aplicationName}`}
                    />
                  </Modal>
                </Space>
              </Descriptions.Item>
            </Descriptions>
            <Descriptions
              className="mt-5"
              bordered
              column={{ xxl: 3, xl: 2, lg: 2, md: 2, sm: 1, xs: 1 }}
            >
              <Descriptions.Item label="Рутинные доступы ">
                <Space>
                  {" "}
                  <Button
                    block
                    type="primary"
                    size="small"
                    onClick={() => setOpen3(true)}
                  >
                    просмотреть
                  </Button>
                  <Modal
                    title="Список рутинных доступов"
                    centered
                    open={open3}
                    okType={"default"}
                    cancelText="отмена"
                    okText="просмотр трудоемкости"
                    onOk={() => {
                      setOpen3(false);
                      history(`${RouteNames.CHEACK_LABORCOAST}`);
                    }}
                    onCancel={() => setOpen3(false)}
                    width={"50%"}
                  >
                    <AccessList
                      data={allCheackTasks}
                      fileName={`panels-${currentAplication.aplicationName}`}
                    />
                  </Modal>
                </Space>
              </Descriptions.Item>

              <Descriptions.Item label="Тяжелые доступы ">
                <Space>
                  {" "}
                  <Button
                    block
                    type="primary"
                    size="small"
                    onClick={() => setOpen4(true)}
                  >
                    просмотреть
                  </Button>
                  <Modal
                    title="Список тяжелых доступов"
                    centered
                    open={open4}
                    cancelText="отмена"
                    okType={"default"}
                    okText="просмотр трудоемкости"
                    onOk={() => {
                      setOpen4(false);
                      history(`${RouteNames.CHEACK_LABORCOAST}`);
                    }}
                    onCancel={() => setOpen4(false)}
                    width={"50%"}
                  >
                    <HardAccessList
                      data={allCheackTasks}
                      fileName={`hardAccess-${currentAplication.aplicationName}`}
                    />
                  </Modal>
                </Space>
              </Descriptions.Item>
            </Descriptions>
            <Descriptions
              bordered
              className="mt-5"
              column={{ xxl: 4, xl: 3, lg: 3, md: 3, sm: 1, xs: 1 }}
            >
              <Descriptions.Item label="Трудоемкость">
                <Space className="flex justify-center">
                  <Button
                    size="small"
                    type="primary"
                    onClick={() => {
                      history(RouteNames.CHEACK_LABORCOAST);
                    }}
                  >
                    Трудоемкость
                  </Button>
                </Space>
              </Descriptions.Item>
              <Descriptions.Item label="Материалы">
                <Space className="flex justify-center">
                  {" "}
                  <Button
                    size="small"
                    type="primary"
                    onClick={() => {
                      history(RouteNames.CHEACK_MATERIAL_TASKS);
                    }}
                  >
                    Материалы
                  </Button>
                </Space>
              </Descriptions.Item>
              <Descriptions.Item label="Инструмент">
                <Space className="flex justify-center">
                  {" "}
                  <Button
                    size="small"
                    type="primary"
                    onClick={() => {
                      history(RouteNames.CHEACK_INSTRUMENT_TASKS);
                    }}
                  >
                    Инструмент
                  </Button>
                </Space>
              </Descriptions.Item>
            </Descriptions>
          </div>
        </div>
      ) : (
        <></>
      )}
    </>
  );
};

export default AplicationInfo;
