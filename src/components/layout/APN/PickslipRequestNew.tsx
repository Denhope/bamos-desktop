import React, { FC, useState } from 'react';

import { Button, Col, Input, Row, Space, message } from 'antd';

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
import PickslipRequestForm from '@/components/pickSlipRequest/PickslipRequestForm';

import PickSlipRequestPartList from '@/components/pickSlipRequest/PickSlipRequestPartList';
import {
  useAddRequirementMutation,
  useUpdateRequirementMutation,
} from '@/features/requirementAdministration/requirementApi';
import { IRequirement } from '@/models/IRequirement';
const PickslipRequest: FC = () => {
  const { t } = useTranslation();
  const [selectedPN, setSelectedPN] = React.useState<any>();
  const [currentPickData, setCurrentPickData] = React.useState<any>();
  const [isEditing, setIsEditing] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [isCancel, setCancel] = useState(false);
  const [partData, setPartData] = useState<any>(null);

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
  const [addRequirement] = useAddRequirementMutation();
  const [updateRequirement] = useUpdateRequirementMutation();

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
                  console.log(data);
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

                    updatedMaterialsData.map(async (item: any) => {
                      await updateRequirement({
                        id: item.requirementID,
                        forIssuedQuantity: item.required,
                        _id: item.requirementID,
                        status: 'onOrder',
                      }).unwrap();
                      // dispatch(
                      //   updateRequirementByID({
                      //     id: item.requirementID?._id,
                      //     // requestQuantity: -item.QUANTITY,
                      //     issuedQuantity: item.QUANTITY,
                      //     updateUserID: USER_ID || '',
                      //     updateDate: new Date(),
                      //     companyID: localStorage.getItem('companyID') || '',
                      //     projectID: result.payload.projectId,
                      //     // status: 'closed',
                      //   })
                      // );
                    });
                    console.log(updatedMaterialsData);
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
            console.log(data);
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
                currentPickData?.projectID
                //  &&
                // currentPickData?.getFrom &&
                // currentPickData?.neededOn
              ) {
                // Отфильтруйте partData, чтобы исключить элементы, у которых нет PN или amout
                const filteredPartData = partData.filter(
                  (part: { PN: any; amout: any }) => part.PN && part.amout
                );

                const promises = filteredPartData.map(
                  async (part: {
                    amout: any;
                    alternative: any;
                    unit: any;
                    description: any;
                    group: any;
                    type: any;
                    PN: any;
                    taskNumber: any;
                    serialNumber?: any;
                    partID: string | number;
                  }) =>
                    await addRequirement({
                      requirement: {
                        neededOnID: currentPickData?.neededOnID,
                        reqTypesID: currentPickData?.reqTypesID,
                        reqCodesID: currentPickData?.reqCodesID,
                        status: 'open',
                        projectID: currentPickData.projectID,
                        serialNumber: part?.serialNumber,
                        partNumberID: part.partID,
                        amout: part.amout,
                        issuedAmout: 0,

                        projectTaskID: currentPickData?.projectTaskID
                          ? currentPickData?.projectTaskID
                          : null,
                        plannedDate: currentPickData?.plannedDate,

                        unit: part?.unit,
                        description: part?.description || '',
                        group: part?.group,
                        type: part?.type,
                        PN: part?.PN || '',
                        issuedQuantity: 0,
                        bookedQuantity: 0,
                        nameOfMaterial: part?.description || '',
                      },
                    }).unwrap()
                );
                try {
                  // const results = await Promise.all(promises);

                  const results = await Promise.all(promises)
                    .then(async (results) => {
                      console.log(results);
                      // Остальная логика обработки результатов
                      const updatedRequirements = results.map((result) => {
                        // Доступ к данным из payload
                        return {
                          id: uuidv4(), // уникальный ключ для каждой вкладки
                          requirementID: result.id,
                          group: result.group,
                          type: result.type,
                          serialNumber: result.serialNumber,
                          onOrderQuantity:
                            result.amout - (result.issuedQuantity || 0),
                          required: result.amout,
                          PN: result.PN,
                          description: result.nameOfMaterial,
                          unit: result.unit,
                          issuedQuantity: result.issuedQuantity,
                          status: 'open',
                          onBlock: [],
                        };
                      });

                      const result = await dispatch(
                        createProjectTaskMaterialAplication({
                          materials: updatedRequirements,
                          createDate: new Date(),
                          createUserId: USER_ID || '',
                          // mechSing: currentPickData && currentPickData?.neededOn,
                          projectTaskId: currentPickData?.projectTaskID
                            ? currentPickData?.projectTaskID
                            : null,
                          projectId: currentPickData?.projectID || '',
                          status: 'open',
                          companyID: companyID || '',
                          plannedDate:
                            currentPickData && currentPickData?.plannedDate,
                          getFrom: currentPickData && currentPickData?.getFrom,
                          remarks: currentPickData && currentPickData?.remarks,
                          neededOnID:
                            currentPickData && currentPickData?.neededOnID,
                          reqTypesID: currentPickData?.reqTypesID,
                          reqCodesID: currentPickData?.reqCodesID,
                        })
                      );

                      if (result.meta.requestStatus === 'fulfilled') {
                        setCurrentPickData({
                          ...currentPickData,
                          materialAplicationNumber:
                            result.payload.materialAplicationNumber,
                        });
                        setIsCreating(false);
                        setCancel(true);
                        setTimeout(() => {
                          setCancel(false);
                        }, 0);

                        results.map(async (result: IRequirement) => {
                          await updateRequirement({
                            ...result,
                            status: 'open',
                          });
                        });
                      }

                      // Обработка массива результатов, если это необходимо
                      message.success(t('SUCCESS'));
                    })
                    .catch((error) => {
                      console.error('Произошла ошибка:', error);
                    });
                  // console.log(results);
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
