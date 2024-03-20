import React, { FC, useState } from 'react';
import PickslipRequestForm from '../pickslipRequest/PickslipRequestForm';
import { Button, Col, Input, Row, Space, message } from 'antd';
import PickSlipRequestPartList from '../pickslipRequest/PickSlipRequestPartList';
import { ProColumns } from '@ant-design/pro-components';
import DoubleClickPopover from '@/components/shared/form/DoubleClickProper';
import PartNumberSearch from '@/components/store/search/PartNumberSearch';
import { useTranslation } from 'react-i18next';
import { v4 as originalUuidv4 } from 'uuid';
import { CloseCircleOutlined, SaveOutlined } from '@ant-design/icons';
import { USER_ID } from '@/utils/api/http';
import { useAppDispatch } from '@/hooks/useTypedSelector';
import {
  createProjectTaskMaterialAplication,
  createSingleRequirement,
  updateRequirementsByBody,
  updatedMaterialOrdersById,
} from '@/utils/api/thunks';

const PickslipRequest: FC = () => {
  const { t } = useTranslation();
  const [selectedPN, setSelectedPN] = React.useState<any>();
  const [currentPickData, setCurrentPickData] = React.useState<any>();
  const [isEditing, setIsEditing] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [isCancel, setCancel] = useState(false);
  const [partData, setPartData] = useState<any>(null);
  const initialColumns: ProColumns<any>[] = [
    {
      title: `${t('PART No')}`,
      dataIndex: 'PN',
      key: 'PN',
      tip: ' Click open Store search',
      ellipsis: true,
      width: '14%',
      formItemProps: (form, { rowIndex }) => {
        return {
          rules: rowIndex > 1 ? [{ required: true }] : [],
        };
      },

      editable: (text, record, index) => {
        return index !== 0;
      },

      renderFormItem: (item2, { onChange }) => {
        return (
          <DoubleClickPopover
            content={
              <div className="flex my-0 mx-auto  h-[44vh] flex-col relative overflow-hidden">
                <PartNumberSearch
                  initialParams={{ partNumber: '' }}
                  scroll={18}
                  onRowClick={function (record: any, rowIndex?: any): void {
                    // setOpenStoreFind(false);
                    setSelectedPN(record);
                    // setInitialPN(record.PART_NUMBER);
                  }}
                  isLoading={false}
                  onRowSingleClick={function (
                    record: any,
                    rowIndex?: any
                  ): void {
                    setSelectedPN(record);
                  }}
                />
              </div>
            }
            overlayStyle={{ width: '70%' }}
          >
            <Input
              value={selectedPN.PART_NUMBER}
              onChange={(e) => {
                setSelectedPN({
                  ...selectedPN,
                  PART_NUMBER: e.target.value,
                });
                if (onChange) {
                  onChange(e.target.value);
                }
              }}
            />
          </DoubleClickPopover>
        );
      },

      // responsive: ['sm'],
    },
    {
      title: `${t('QTY REQ ')}`,
      dataIndex: 'amout',
      key: 'amout',
      width: '7%',
    },
    {
      title: `${t('REQUESTED SERIAL')}`,
      dataIndex: 'serialNumber',
      key: 'serialNumber',
      width: '10%',
    },
    {
      title: `${t('AVAIL QTY')}`,
      dataIndex: 'availableQTY',
      key: 'availableQTY',
      width: '7%',
      responsive: ['sm'],
      // sorter: (a, b) => a.unit.length - b.unit.length,
    },
    {
      title: `${t('DESCRIPTION')}`,
      dataIndex: 'nameOfMaterial',
      key: 'nameOfMaterial',
      // responsive: ['sm'],

      ellipsis: true, //
      width: '14%',
    },
    {
      title: `${t('UNIT')}`,
      dataIndex: 'unit',
      key: 'unit',
      width: '4%',
      responsive: ['sm'],
      // sorter: (a, b) => a.unit.length - b.unit.length,
    },
    {
      title: `${t('GROUP')}`,
      dataIndex: 'group',
      key: 'group',
      // responsive: ['sm'],

      ellipsis: true, //
      width: '6%',
    },
  ];
  const isAmountUndefined = () => {
    if (partData) {
      return Object.values(partData).some(
        (value: any) => value && value?.amount === undefined
      );
    }
    return false; // Если data не определено, вернуть false
  };
  const dispatch = useAppDispatch();
  const uuidv4: () => string = originalUuidv4;
  return (
    <div className="h-[82vh]   px-4 py-3 gap-4  overflow-hidden flex flex-col justify-between ">
      <div className="flex flex-col gap-4">
        <div className="py-4 bg-white">
          <Row gutter={{ xs: 8, sm: 11, md: 24, lg: 32 }}>
            <Col sm={18}>
              <PickslipRequestForm
                data={currentPickData}
                onFilterPickSlip={function (record: any): void {
                  setCurrentPickData(record);
                }}
                onCurrentPickSlip={function (data: any): void {
                  setCurrentPickData(data);
                }}
                setCancel={isCancel}
                onCreate={function (data: boolean): void {
                  setIsCreating(data);
                }}
              />
            </Col>
            <Col sm={6}>
              <Button
                onClick={async () => {
                  const companyID = localStorage.getItem('companyID');
                  const result1 = await dispatch(
                    updatedMaterialOrdersById({
                      status: 'issued',
                      _id: currentPickData._id || currentPickData.id,
                      updateUserID: USER_ID,
                      updateDate: new Date(),
                    })
                  );
                  if (result1.meta.requestStatus === 'fulfilled') {
                    setCurrentPickData(result1.payload);

                    const updatedMaterialsData = result1.payload.materials.map(
                      (item: any) => {
                        if (typeof item === 'object' && item !== null) {
                          return {
                            ...(item as object), // Явно указываем, что item является объектом
                            materialOrderID:
                              result1.payload.id || result1.payload._id,
                            status: 'onOrder',

                            // requestQuantity: item?.amout,
                          };
                        }
                        return item;
                      }
                    );
                    console.log(updatedMaterialsData);

                    const result2 = await dispatch(
                      updateRequirementsByBody({
                        companyID: companyID || '',
                        newData: {
                          updatedMaterialsData,
                        },
                        neededOn: result1?.payload?.neededOn,
                        status: 'onOrder',
                        plannedDate: result1?.payload?.plannedDate,
                      })
                    );
                    message.success(t('SUCCESS'));
                  }
                }}
                disabled={
                  !currentPickData ||
                  (currentPickData && currentPickData?.status !== 'open')
                }
                type="primary"
                className="w-11/12"
                size="large"
              >
                {t(`SEND TO STORE (ISSUE)`)}
              </Button>
            </Col>
          </Row>
        </div>
        <PickSlipRequestPartList
          data={currentPickData?.materials || null}
          isLoading={false}
          onRowClick={function (record: any, rowIndex?: any): void {}}
          onSave={function (data: any): void {
            setPartData(data);
          }}
          yScroll={48}
          setCancel={isCancel}
          setCreating={isCreating}
        />
      </div>
      <div className="flex justify-between">
        <Space align="center">
          <Button
            disabled={!isEditing && !isCreating}
            onClick={async () => {
              // console.log(currentPickData, partData);
              const companyID = localStorage.getItem('companyID');
              if (
                partData &&
                currentPickData?.projectId &&
                currentPickData?.getFrom &&
                currentPickData?.neededOn
              ) {
                // Отфильтруйте partData, чтобы исключить элементы, у которых нет PN или amout
                const filteredPartData = partData.filter(
                  (part: { PN: any; amout: any }) => part.PN && part.amout
                );

                const promises = filteredPartData.map(
                  (part: {
                    amout: any;
                    alternative: any;
                    unit: any;
                    description: any;
                    group: any;
                    type: any;
                    PN: any;
                    taskNumber: any;
                    serialNumber?: any;
                  }) =>
                    dispatch(
                      createSingleRequirement({
                        status: currentPickData.status,
                        companyID: companyID || '',
                        createUserID: USER_ID || '',
                        projectID: currentPickData.projectId,
                        quantity: part.amout,
                        serialNumber: part?.serialNumber,
                        alternative: part.alternative,
                        unit: part.unit,
                        description: part.description || '',
                        group: part.group,
                        type: part.type,
                        partNumber: part.PN || '',
                        isNewAdded: false,
                        createDate: new Date(),
                        taskNumber: currentPickData?.selectedTask?.taskNumber,
                        issuedQuantity: 0,
                        projectTaskID:
                          currentPickData?.receiverType === 'MAIN_TASK'
                            ? currentPickData?.taskId
                            : null,
                        additionalTaskID:
                          currentPickData?.receiverType === 'NRC'
                            ? currentPickData?.taskId
                            : null,
                        additionalTaskWO:
                          currentPickData?.receiverType === 'NRC'
                            ? currentPickData?.selectedTask?.additionalNumberId
                            : null,
                        registrationNumber: currentPickData?.reciver,
                        plannedDate: currentPickData?.plannedDate,
                      })
                    )
                );
                try {
                  const results = await Promise.all(promises);
                  // const resultTask = await dispatch(
                  //   updateProjectTask({
                  //     id: currentPickData?.taskId,
                  //     requirementItemsIds: [
                  //       ...(projectTaskData &&
                  //       Array.isArray(projectTaskData.requirementItemsIds)
                  //         ? projectTaskData.requirementItemsIds
                  //         : []),
                  //       result.payload._id,
                  //     ],
                  //   })
                  // );
                  // Все промисы успешно разрешены
                  // console.log('Все промисы успешно разрешены:', results);
                  const updatedRequirements = results.map((result) => {
                    const { payload } = result; // Доступ к данным из payload
                    return {
                      id: uuidv4(), // уникальный ключ для каждой вкладки
                      requirementID: payload._id,
                      group: payload.group,
                      type: payload.type,
                      serialNumber: payload.serialNumber,
                      onOrderQuantity:
                        payload.amout - (payload.issuedQuantity || 0),
                      required: payload.amout,
                      PN: payload.PN,
                      description: payload.nameOfMaterial,
                      unit: payload.unit,
                      issuedQuantity: payload.issuedQuantity,
                      status: 'open',
                      onBlock: [],
                    };
                  });
                  console.log(currentPickData);
                  const result = await dispatch(
                    createProjectTaskMaterialAplication({
                      materials: updatedRequirements,
                      createDate: new Date(),
                      createUserId: USER_ID || '',
                      mechSing: currentPickData && currentPickData?.neededOn,
                      additionalTaskID:
                        currentPickData?.receiverType === 'NRC'
                          ? currentPickData?.taskId
                          : null,

                      projectTaskId:
                        currentPickData?.receiverType === 'MAIN_TASK'
                          ? currentPickData?.taskId
                          : null,
                      projectId: currentPickData?.projectId || '',
                      projectWO: currentPickData?.selectedProject?.projectWO,
                      projectTaskWO:
                        currentPickData?.receiverType === 'MAIN_TASK'
                          ? currentPickData?.selectedTask?.projectTaskWO
                          : currentPickData?.receiverType === 'NRC'
                          ? currentPickData?.selectedTask?.additionalNumberId
                          : null,
                      planeType: currentPickData?.type,
                      registrationNumber: currentPickData?.reciver,
                      status: 'open',
                      companyID: companyID || '',
                      taskNumber: currentPickData?.selectedTask?.taskNumber,
                      plannedDate:
                        currentPickData && currentPickData?.plannedDate,
                      getFrom: currentPickData && currentPickData?.getFrom,
                      remarks: currentPickData && currentPickData?.remarks,
                      neededOn: currentPickData && currentPickData?.neededOn,
                    })
                  );

                  if (result.meta.requestStatus === 'fulfilled') {
                    setCurrentPickData(result.payload);
                    setIsCreating(false);
                    setCancel(true);
                    setTimeout(() => {
                      setCancel(false);
                    }, 0);
                    const updatedMaterialsData = result.payload.materials.map(
                      (item: any) => {
                        if (typeof item === 'object' && item !== null) {
                          return {
                            ...(item as object), // Явно указываем, что item является объектом
                            materialOrderID:
                              result.payload.id || result.payload._id,
                          };
                        }
                        return item;
                      }
                    );

                    const result1 = await dispatch(
                      updateRequirementsByBody({
                        companyID: companyID || '',
                        newData: {
                          updatedMaterialsData,
                        },
                        status: 'open',
                        neededOn: currentPickData && currentPickData?.neededOn,

                        plannedDate:
                          currentPickData && currentPickData?.plannedDate,
                      })
                    );
                  }

                  // Обработка массива результатов, если это необходимо
                  message.success(t('SUCCESS'));
                } catch (error) {
                  // Одна или несколько промисов были отклонены
                  console.error(
                    'Ошибка при выполнении одного или нескольких промисов:',
                    error
                  );
                  // Обработка ошибки, если это необходимо
                }
              } else {
                message.error(t('ERROR'));
                // console.log(*)
              }
            }}
            size="small"
            icon={<SaveOutlined />}
          >
            {t('SAVE')}
          </Button>
        </Space>
        <Space>
          <Button
            disabled={!isEditing && !isCreating}
            icon={<CloseCircleOutlined />}
            onClick={() => {
              setCancel(true);
              setTimeout(() => {
                setCancel(false);
              }, 0);
              setIsCreating(false);
              setIsEditing(false);
              setPartData(null);
            }}
            size="small"
          >
            {t('CANCEL')}
          </Button>
        </Space>
      </div>
    </div>
  );
};

export default PickslipRequest;
