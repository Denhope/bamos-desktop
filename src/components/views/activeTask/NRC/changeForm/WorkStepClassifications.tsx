import { Button, Checkbox, Col, Form, Row, Space } from 'antd';

import Title from 'antd/es/typography/Title';
import { useTypedSelector } from '@/hooks/useTypedSelector';
import React, { FC, useState } from 'react';

import { updateResourcesRequests } from '@/store/reducers/AdditionalTaskSlice';
import { useDispatch } from 'react-redux';
export interface IWorkStepClassificationProps {
  onFinish?: () => void;
}

const WorkStepClassifications: FC<IWorkStepClassificationProps> = ({
  onFinish,
}) => {
  const dispatch = useDispatch();
  const { currentAdditionalTask } = useTypedSelector(
    (state) => state.additioonalTasks
  );
  const defaultCheckedList = currentAdditionalTask?.resourcesRequests;

  const [checkedList, setCheckedList] = useState<any[]>(defaultCheckedList);
  const onChange = (list: any[]) => {
    setCheckedList(list);
  };

  return (
    <div className="flex flex-col">
      <Form
        onFinish={onFinish}
        autoComplete="off"
        labelCol={{ span: 12 }}
        wrapperCol={{ span: 24 }}
      >
        <Title level={5}>ТResources, Requests / Требования</Title>
        <Form.Item rules={[{ required: true }]}>
          <Checkbox.Group onChange={onChange} value={checkedList}>
            <Space direction="vertical">
              {' '}
              <Checkbox value="powerlessRequired">
                Power Off / Обесточивание
              </Checkbox>
              <Checkbox value="defuel">Defuel / Слив Топлива</Checkbox>
              <Checkbox value="tankEntry">
                Tank Entry / Доступ в Т Баки
              </Checkbox>
              <Checkbox value="weightBalance">
                Weight & Balance / Загрузка и Центровка
              </Checkbox>
              <Checkbox value="engineChange">
                Engine Change / Замена Двигателя
              </Checkbox>
              <Checkbox value="taxi">Taxi / Руление</Checkbox>
              <Checkbox value="jacks">Jacks / Домкрат</Checkbox>
              <Checkbox value="troubleshootin">
                Troubleshooting / Поиск Неисправности
              </Checkbox>
              <Checkbox value="idleTestRun">
                Idle / Test Run Гонка Двигателей
              </Checkbox>
              <Checkbox value="SRMRepair">
                SRM / Repair Структурный Ремонт
              </Checkbox>
              <Checkbox value="powerRun">
                Power Run / Запуск Двигателей
              </Checkbox>
              <Checkbox value="externalHydraulic">
                Powerless Required / Откл Гидросистем
              </Checkbox>
              <Checkbox value="boroscope">Boroscope / Бороскоп</Checkbox>
              <Checkbox value="testFlightRequired">
                Test Flight / Required Контрольный Полет
              </Checkbox>
              <Checkbox value="rampActivity">
                Ramp Activity / Наземное Обслуживание
              </Checkbox>
              <Checkbox value="accessDock">
                Access/Dock / Тех Cооружения
              </Checkbox>
              <Checkbox value="NDTRequirement">
                NDT Requirement / Неразрушающий Контроль
              </Checkbox>
            </Space>
          </Checkbox.Group>
          <div className="flex gap-3">
            <Button
              type="primary"
              htmlType="submit"
              onClick={() => {
                dispatch(updateResourcesRequests(checkedList));
              }}
              style={{ marginTop: 16 }}
            >
              Дальше
            </Button>
          </div>
        </Form.Item>
      </Form>
    </div>
  );
};

export default WorkStepClassifications;
