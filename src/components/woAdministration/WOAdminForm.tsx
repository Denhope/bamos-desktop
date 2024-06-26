// ts-nocheck
import React, {
  FC,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import {
  ProForm,
  ProFormDigit,
  ProFormGroup,
  ProFormSelect,
  ProFormText,
  ProFormTextArea,
} from '@ant-design/pro-components';
import { Tabs, Form, message, notification, Empty, Button } from 'antd';
import { useTranslation } from 'react-i18next';
import {
  useAddStepMutation,
  useDeleteStepMutation,
  useGetFilteredStepsQuery,
} from '@/features/projectItemWO/stepApi';
import { useAddBookingMutation } from '@/features/bookings/bookingApi';
import StepContainer from './StepContainer';

import InstrumentContainer from './InstrumentContainer';
import WODescriptionSummary from './WODescriptionSummary';
import { IStep } from '@/models/IStep';
import { ITask } from '@/models/ITask';
import { useGetACTypesQuery } from '@/features/acTypeAdministration/acTypeApi';
import { useGetGroupTaskCodesQuery } from '@/features/tasksAdministration/taskCodesApi';
import { useGetMPDCodesQuery } from '@/features/MPDAdministration/mpdCodesApi';
import { useGetZonesByGroupQuery } from '@/features/zoneAdministration/zonesApi';
import { useGetPartNumbersQuery } from '@/features/partAdministration/partApi';
import { ColDef } from 'ag-grid-community';
import {
  ValueEnumType,
  getStatusColor,
  transformToIPartNumber,
  transformToIRequirement,
} from '@/services/utilites';
import PartContainer from './PartContainer';
import { IPartNumber } from '@/models/IUser';
import RequarementsList from './requirements/RequarementsList';
import { IRequirement } from '@/models/IRequirement';
import AutoCompleteEditor from '../shared/Table/ag-grid/AutoCompleteEditor';
import { useGetFilteredRequirementsQuery } from '@/features/requirementAdministration/requirementApi';
import CircleRenderer from '../userAdministration/requirementAdministration/CircleRenderer';
import { useGetAccessCodesQuery } from '@/features/accessAdministration/accessApi';

interface UserFormProps {
  order?: any;
  orderItem?: any | {};
  onCheckItems: (selectedKeys: React.Key[]) => void;
}

const WOAdminForm: FC<UserFormProps> = ({ order, orderItem, onCheckItems }) => {
  type CellDataType = 'text' | 'number' | 'date' | 'boolean'; // Определите возможные типы данных
  const { t } = useTranslation();
  interface ExtendedColDef extends ColDef {
    cellDataType: CellDataType; // Обязательное свойство
  }

  const { data: partNumbers } = useGetPartNumbersQuery({});
  const columnDefs = useMemo(
    () => [
      {
        field: 'DESCRIPTION',
        headerName: `${t('DESCRIPTION')}`,
        cellDataType: 'text',
      },
      {
        field: 'GROUP',
        headerName: `${t('GROUP')}`,
        cellDataType: 'text',
      },
      {
        field: 'TYPE',
        headerName: `${t('TYPE')}`,
        cellDataType: 'text',
      },
      {
        field: 'QUANTITY',
        editable: true,
        cellDataType: 'number',
        headerName: `${t('QUANTITY')}`,
      },
      {
        field: 'UNIT_OF_MEASURE',
        editable: false,
        filter: false,
        headerName: `${t('UNIT OF MEASURE')}`,
        cellDataType: 'text',
      },
      // Добавьте другие колонки по необходимости
    ],
    []
  );

  const valueEnum: ValueEnumType = {
    onShort: t('ON SHORT'),
    onQuatation: t('QUATATION'),
    open: t('OPEN'),
    closed: t('CLOSED'),
    canceled: t('CANCELLED'),
    onOrder: t('ON ORDER'),
    draft: t('DRAFT'),
    issued: t('ISSUED'),
    complete: t('COMPLETE'),
    progress: t('IN PROGRESS'),
  };
  const [columnRequirements, setColumnDefsRequirements] = useState<
    ExtendedColDef[]
  >([
    {
      field: 'readyStatus',
      headerName: ``,
      cellRenderer: CircleRenderer, // Использование кастомного рендерера
      width: 60,
      filter: false,
      cellRendererParams: {
        color: '', // Параметры, если необходимы
      },
      cellDataType: 'number',
    },

    {
      field: 'partRequestNumberNew',
      headerName: `${t('REQUIREMENT No')}`,
      cellDataType: 'number',
    },
    {
      field: 'status',
      headerName: `${t('Status')}`,
      cellDataType: 'text',
      width: 150,
      filter: true,
      valueGetter: (params: { data: { status: keyof ValueEnumType } }) =>
        params.data.status,
      valueFormatter: (params: { value: keyof ValueEnumType }) => {
        const status = params.value;
        return valueEnum[status] || '';
      },
      cellStyle: (params: { value: keyof ValueEnumType }) => ({
        backgroundColor: getStatusColor(params.value),
        color: '#ffffff', // Text color
      }),
    },

    {
      headerName: `${t('PART No')}`,
      field: 'PART_NUMBER',
      editable: true,
      cellEditor: AutoCompleteEditor,
      cellEditorParams: {
        options: partNumbers,
      },
      cellDataType: 'text',
    },
    {
      field: 'DESCRIPTION',
      headerName: `${t('DESCRIPTION')}`,
      cellDataType: 'text',
    },
    {
      field: 'GROUP',
      headerName: `${t('GROUP')}`,
      cellDataType: 'text',
    },
    {
      field: 'TYPE',
      headerName: `${t('TYPE')}`,
      cellDataType: 'text',
    },
    {
      field: 'amout',
      editable: true,
      width: 110,
      cellDataType: 'number',
      headerName: `${t('QUANTITY')}`,
    },
    {
      field: 'UNIT_OF_MEASURE',
      editable: false,
      filter: false,
      headerName: `${t('UNIT OF MEASURE')}`,
      cellDataType: 'text',
    },
    {
      field: 'plannedDate',
      editable: true,
      cellDataType: 'date',
      headerName: `${t('PLANNED DATE')}`,
      valueFormatter: (params: any) => {
        if (!params.value) return ''; // Проверка отсутствия значения
        const date = new Date(params.value);
        return date.toLocaleDateString('ru-RU', {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
        });
      },
    },
    {
      field: 'requestQuantity',

      cellDataType: 'number',
      headerName: `${t('REQUESTED QTY')}`,
    },
    {
      field: 'bookedQuantity',

      cellDataType: 'number',
      headerName: `${t('BOOKED QTY')}`,
    },
    {
      field: 'reservationQTY',

      cellDataType: 'number',
      headerName: `${t('LINK QTY')}`,
    },
    {
      field: 'availableQTY',

      cellDataType: 'number',
      headerName: `${t('STOCK QTY')}`,
    },
    {
      field: 'availableAllStoreQTY',

      cellDataType: 'number',
      headerName: `${t('AVAIL. ALL STORES QTY')}`,
    },
    {
      field: 'restrictedAllStoreQTY',

      cellDataType: 'number',
      headerName: `${t('RESTRICTED ALL STORES QTY')}`,
    },

    {
      field: 'materialAplicationNumber',

      cellDataType: 'number',
      headerName: `${t('PICKSLIP No')}`,
    },
    // Добавьте другие колонки по необходимости
  ]);
  const [form] = ProForm.useForm();

  const [addBooking] = useAddBookingMutation({});

  const [stepsSelected, setStepsSelected] = useState<React.Key[]>([]);
  const [activeTabKey, setActiveTabKey] = useState('3');
  const [tabTitles, setTabTitles] = useState({
    '1': `${t('WORKORDER INFO')}`,
    '2': `${t('PARTS')}`,
    '3': `${t('STEPS')}`,
    '4': `${t('INSTRUMENTS')}`,
    '5': `${t('REQUIREMENTS')}`,
  });

  const projectId = order?.projectId;
  const projectItemID = order?.projectItemID;

  const { data: steps, refetch } = useGetFilteredStepsQuery(
    { projectItemID: projectItemID },
    {
      skip: !projectItemID,
    }
  );

  const [addStep] = useAddStepMutation();
  const [deleteStep] = useDeleteStepMutation();

  useEffect(() => {
    updateTabTitle(orderItem, order);
  }, [orderItem, order]);

  const updateTabTitle = (selectedItem: any, order: any) => {
    if (order) {
      setTabTitles((prevTitles) => ({
        ...prevTitles,
        '1': `${t('WORKORDER')} №: ${order?.taskWO}`,
      }));
    }
    if (selectedItem) {
      setTabTitles((prevTitles) => ({
        ...prevTitles,
        '3': `${t('WORKORDER №:')} ${order?.orderNumberNew} POS:${
          selectedItem?.index + 1
        } - PART_NUMBER: ${selectedItem?.partID?.PART_NUMBER}`,
      }));
    }
  };

  const handleAddStep = async (newStep: IStep) => {
    try {
      const step = await addStep({
        step: newStep,
        projectId,
        projectItemID,
      }).unwrap();
      await refetch();
      await addBooking({
        booking: { voucherModel: 'ADD_STEP', data: step },
      }).unwrap(); // Передаем данные о новом шаге в addBooking
      notification.success({
        message: t('STEP SUCCESSFULLY ADDED'),
        description: t('The step has been successfully added.'),
      });
      // setIsModalVisible(false); // Если у вас есть функция для закрытия модального окна после добавления шага
    } catch (error) {
      notification.error({
        message: t('FAILED TO ADD STEP'),
        description: 'There was an error adding the step.',
      });
    }
  };

  const handleDeleteStep = async (stepIds: string[]) => {
    try {
      for (const stepId of stepIds) {
        const step = await deleteStep(stepId).unwrap();
        await addBooking({
          booking: { voucherModel: 'DELETE_STEP', data: step },
        }).unwrap();
      }
      await refetch();
      notification.success({
        message: t('STEP SUCCESSFULLY DELETED'),
        description: t('The step has been successfully deleted.'),
      });
    } catch (error) {
      notification.error({
        message: t('FAILED TO DELETE STEP'),
        description: t('There was an error deleting the step.'),
      });
    }
  };

  const [acTypeID, setACTypeID] = useState<any>(order?.acTypeId || '');
  const [taskType, setTaskType] = useState<string>(order?.taskType || '');
  const { data: zones, isLoading: loading } = useGetZonesByGroupQuery(
    { acTypeId: acTypeID },
    { skip: !acTypeID }
  );
  const stepsToRender = projectItemID ? steps : [];

  const { data: acTypes, isLoading: acTypesLoading } = useGetACTypesQuery({});
  const { data: mpdCodes, isLoading: mpdCodesLoading } = useGetMPDCodesQuery(
    { acTypeID },
    { skip: !acTypeID }
  );
  const { data: taskCodes } = useGetGroupTaskCodesQuery(
    { acTypeID },
    { skip: !acTypeID }
  );
  const acTypeValueEnum: Record<string, string> =
    acTypes?.reduce((acc, acType) => {
      acc[acType.id] = acType.name;
      return acc;
    }, {} as Record<string, string>) || {};

  const taskCodesValueEnum: Record<string, string> =
    taskCodes?.reduce((acc, mpdCode) => {
      acc[mpdCode.id] = mpdCode.code;
      return acc;
    }, {} as Record<string, string>) || {};
  const mpdCodesValueEnum: Record<string, string> =
    mpdCodes?.reduce((acc, mpdCode) => {
      acc[mpdCode.id] = mpdCode.code;
      return acc;
    }, {} as Record<string, string>) || {};

  const zonesValueEnum: Record<string, string> =
    zones?.reduce((acc1, majorZone) => {
      if (majorZone.subZonesCode) {
        return majorZone.subZonesCode.reduce((acc2, subZone) => {
          if (subZone.areasCode) {
            return subZone.areasCode.reduce((acc3, area) => {
              acc3[area.id] = String(area.areaNbr);
              return acc3;
            }, acc2);
          }
          return acc2;
        }, acc1);
      }
      return acc1;
    }, {} as Record<string, string>) || {};
  const { data: accessesData } = useGetAccessCodesQuery(
    { acTypeID: acTypeID },
    { skip: acTypeID }
  );
  const accessCodesValueEnum: Record<string, string> =
    accessesData?.reduce((acc, mpdCode) => {
      acc[mpdCode.id] = mpdCode.accessNbr;
      return acc;
    }, {} as Record<string, string>) || {};
  const partValueEnum: Record<string, any> = useMemo(() => {
    return (
      partNumbers?.reduce(
        (acc: Record<string, any>, partNumber: IPartNumber) => {
          acc[partNumber._id] = partNumber;
          return acc;
        },
        {}
      ) || {}
    );
  }, [partNumbers]);
  useEffect(() => {
    if (order) {
      form.resetFields();
      form.setFieldsValue(order);
      setACTypeID(order.acTypeId);
      setTaskType(order.taskType);
      form.setFieldsValue({
        partNumberID: order.partNumberID?._id,
        nameOfMaterial: order.partNumberID?.DESCRIPTION,
        WORKPIECE_DIMENSIONS: order.partNumberID?.WORKPIECE_DIMENSIONS,
        COATING: order.partNumberID?.COATING,
        MATERIAL: order.partNumberID?.MATERIAL,
        WEIGHT: order.partNumberID?.WEIGHT,
        SQUARE: order.partNumberID?.SQUARE,
        WORKPIECE_WEIGHT: order.partNumberID?.WORKPIECE_WEIGHT,
        WORKPIECE_MATERIAL_TYPE: order.partNumberID?.WORKPIECE_MATERIAL_TYPE,
      });
    } else {
      form.resetFields();
      setACTypeID(undefined);
      setTaskType('PART_PRODUCE');
    }
  }, [order, form]);

  const SubmitButton = () => (
    <Button type="primary" htmlType="submit">
      {order ? t('UPDATE') : t('CREATE')}
    </Button>
  );
  const { data: requirements, isLoading } = useGetFilteredRequirementsQuery(
    {
      projectTaskID: order?.id,
      ifStockCulc: true,
      includeAlternates: true,
    },
    {
      skip: !order?.id,
    }
  );
  const transformedRequirements = useMemo(() => {
    return transformToIRequirement(requirements || []);
  }, [requirements]);

  const handleCheckItems = useCallback(
    (selectedKeys: React.Key[]) => {
      // Управляем локальным состоянием, чтобы минимизировать вызовы onCheckItems
      setStepsSelected(selectedKeys);
      // onCheckItems(selectedKeys);
    },
    [onCheckItems]
  );
  return (
    <ProForm
      size="small"
      form={form}
      submitter={{
        render: (_, dom) => [
          activeTabKey !== '3' &&
            activeTabKey !== '4' &&
            activeTabKey !== '5' &&
            activeTabKey !== '2' && <SubmitButton key="submit" />,
          order &&
            activeTabKey !== '3' &&
            activeTabKey !== '4' &&
            activeTabKey !== '5' &&
            activeTabKey !== '2' &&
            dom.reverse()[1],
        ],
      }}
      layout="horizontal"
    >
      {/* <div className="h-[69vh] "> */}
      <Tabs
        activeKey={activeTabKey}
        onChange={(key) => setActiveTabKey(key)}
        defaultActiveKey="3"
        type="card"
      >
        <Tabs.TabPane tab={tabTitles['1']} key="1">
          {order ? (
            <div className=" h-[57vh] flex flex-col overflow-auto">
              <ProFormGroup>
                <ProFormGroup>
                  <ProFormSelect
                    disabled
                    showSearch
                    name="acTypeId"
                    label={t('AC TYPE')}
                    width="sm"
                    valueEnum={acTypeValueEnum}
                    onChange={(value: any) => setACTypeID(value)}
                  />
                  {taskType !== 'PART_PRODUCE' && (
                    <>
                      <ProFormSelect
                        disabled
                        mode={'multiple'}
                        showSearch
                        name="mpdDocumentationId"
                        label={t('MPD CODE')}
                        width="lg"
                        valueEnum={mpdCodesValueEnum}
                        // disabled={!acTypeID} // Disable the select if acTypeID is not set
                      />
                      <ProFormSelect
                        disabled
                        showSearch
                        // initialValue={['PART_PRODUCE']}
                        name="taskType"
                        label={t('TASK TYPE')}
                        width="xl"
                        valueEnum={{
                          SB: { text: t('SERVICE BULLETIN') },
                          SMC: { text: t('SHEDULED MAINTENENCE CHEACK') },
                          ADP: { text: t('ADP') },
                          AD: { text: t('AIRWORTHINESS DIRECTIVE') },
                          PN: { text: t('COMPONENT') },
                          PART_PRODUCE: { text: t('PART PRODUCE') },
                        }}
                        onChange={(value: string) => setTaskType(value)}
                      />
                    </>
                  )}
                  {taskType === 'PART_PRODUCE' && (
                    <>
                      <ProFormSelect
                        disabled
                        showSearch
                        name="taskType"
                        rules={[
                          {
                            required: true,
                          },
                        ]}
                        label={t('TASK TYPE')}
                        width="xl"
                        valueEnum={{
                          SB: { text: t('SERVICE BULLETIN') },
                          SMC: { text: t('SHEDULED MAINTENENCE CHEACK') },
                          ADP: { text: t('ADP') },
                          AD: { text: t('AIRWORTHINESS DIRECTIVE') },
                          PN: { text: t('COMPONENT') },
                          PART_PRODUCE: { text: t('PART PRODUCE') },
                        }}
                        onChange={(value: string) => setTaskType(value)}
                      />
                      <ProFormText
                        disabled
                        width={'lg'}
                        name="taskNumber"
                        label={t('TASK NUMBER')}
                        rules={[
                          {
                            required: true,
                          },
                        ]}
                      />
                      <ProFormTextArea
                        disabled
                        fieldProps={{
                          rows: 3,
                        }}
                        width="lg"
                        name="taskDescription"
                        label={t('DESCRIPTION')}
                        rules={[
                          {
                            required: true,
                          },
                        ]}
                      />
                      <ProFormTextArea
                        fieldProps={{
                          rows: 2,
                        }}
                        width="xl"
                        name="notes"
                        label={t('NOTE')}
                      />

                      <ProFormGroup>
                        <ProFormSelect
                          disabled
                          showSearch
                          rules={[{ required: true }]}
                          width={'sm'}
                          name="partNumberID"
                          label={`${t(`PART No`)}`}
                          // value={partNumber}
                          onChange={(value, data: any) => {
                            // console.log(data);
                            form.setFields([
                              {
                                name: 'nameOfMaterial',
                                value: data.data.DESCRIPTION,
                              },
                              {
                                name: 'unit',
                                value: data.data.UNIT_OF_MEASURE,
                              },
                              { name: 'type', value: data.data.TYPE },
                              { name: 'group', value: data.data.GROUP },
                              {
                                name: 'WORKPIECE_DIMENSIONS',
                                value: data.data.WORKPIECE_DIMENSIONS,
                              },
                              {
                                name: 'MATERIAL',
                                value: data.data.MATERIAL,
                              },
                              {
                                name: 'WEIGHT',
                                value: data.data.WEIGHT,
                              },
                              {
                                name: 'SQUARE',
                                value: data.data.SQUARE,
                              },
                              {
                                name: 'COATING',
                                value: data.data.COATING,
                              },
                              {
                                name: 'WORKPIECE_WEIGHT',
                                value: data.data.WORKPIECE_WEIGHT,
                              },
                              {
                                name: 'WORKPIECE_MATERIAL_TYPE',
                                value: data.data.WORKPIECE_MATERIAL_TYPE,
                              },
                            ]);
                          }}
                          options={Object.entries(partValueEnum).map(
                            ([key, part]) => ({
                              label: part.PART_NUMBER,
                              value: key,
                              data: part,
                            })
                          )}
                        />

                        <ProFormText
                          disabled
                          rules={[{ required: true }]}
                          name="nameOfMaterial"
                          label={t('DESCRIPTION')}
                          width="md"
                          tooltip={t('DESCRIPTION')}
                        ></ProFormText>
                        <ProFormText
                          disabled
                          width="sm"
                          name="WORKPIECE_DIMENSIONS"
                          label={t('WORKPIECE DIMENSIONS')}
                          rules={[
                            {
                              required: true,
                            },
                          ]}
                        />
                        <ProFormText
                          disabled
                          rules={[{ required: true }]}
                          name="COATING"
                          label={t('COATING')}
                          width="sm"
                          tooltip={t('COATING')}
                        ></ProFormText>
                        <ProFormText
                          disabled
                          rules={[{ required: true }]}
                          name="MATERIAL"
                          label={t('MATERIAL')}
                          width="sm"
                          tooltip={t('MATERIAL')}
                        ></ProFormText>
                        <ProFormText
                          disabled
                          rules={[{ required: true }]}
                          name="WEIGHT"
                          label={t('WEIGHT')}
                          width="md"
                          tooltip={t('WEIGHT')}
                        ></ProFormText>
                        <ProFormText
                          disabled
                          rules={[{ required: true }]}
                          name="SQUARE"
                          label={t('SQUARE')}
                          width="sm"
                          tooltip={t('SQUARE')}
                        ></ProFormText>
                        <ProFormText
                          disabled
                          rules={[{ required: true }]}
                          name="WORKPIECE_WEIGHT"
                          label={t('WORKPIECE_WEIGHT')}
                          width="sm"
                          tooltip={t('WORKPIECE_WEIGHT')}
                        ></ProFormText>

                        <ProFormText
                          disabled
                          rules={[{ required: true }]}
                          name="WORKPIECE_MATERIAL_TYPE"
                          label={t('WORKPIECE_MATERIAL_TYPE')}
                          width="sm"
                          tooltip={t('WORKPIECE_MATERIAL_TYPE')}
                        ></ProFormText>
                      </ProFormGroup>
                      <ProFormText
                        width={'xs'}
                        name="rev"
                        label={t('REVISION')}
                      />

                      <ProFormGroup>
                        <ProFormDigit
                          width={'xs'}
                          name="mainWorkTime"
                          label={t('PART TIME')}
                        />
                        {/* <ProFormDigit
                          width={'sm'}
                          name="machineWorkTimeHours"
                          label={t('MACHINE TIME')}
                        /> */}
                      </ProFormGroup>
                    </>
                  )}
                  {taskType !== 'PART_PRODUCE' && (
                    <>
                      <ProFormGroup>
                        <ProFormText
                          disabled
                          width={'xl'}
                          name="taskNumber"
                          label={t('TASK NUMBER')}
                        />
                        <ProFormText
                          disabled
                          width={'xs'}
                          name="rev"
                          label={t('REVISION')}
                        />
                        <ProFormDigit
                          disabled
                          width={'xs'}
                          name="allTaskTime"
                          label={t('MHS')}
                        />
                        <ProFormTextArea
                          fieldProps={{
                            style: { resize: 'none' },
                            rows: 6,
                          }}
                          width="xl"
                          name="taskDescription"
                          label={t('DESCRIPTION')}
                          rules={[
                            {
                              required: true,
                            },
                          ]}
                        />
                      </ProFormGroup>
                      <ProFormTextArea
                        disabled
                        width={'sm'}
                        fieldProps={{ style: { resize: 'none' } }}
                        name="amtoss"
                        label={t('AMM')}
                        rules={[
                          {
                            required: true,
                          },
                        ]}
                      />
                      <ProFormSelect
                        disabled
                        showSearch
                        name="zonesID"
                        mode={'multiple'}
                        label={t('ZONES')}
                        width="sm"
                        valueEnum={zonesValueEnum}
                        // disabled={!acTypeID}
                      />
                      <ProFormSelect
                        disabled
                        showSearch
                        name="accessID"
                        mode={'multiple'}
                        label={t('ACCESS')}
                        width="sm"
                        valueEnum={accessCodesValueEnum}
                        // disabled={!acTypeID}
                      />
                      <ProFormSelect
                        disabled
                        showSearch
                        name="code"
                        label={t('TASK CODE')}
                        width="sm"
                        valueEnum={taskCodesValueEnum}
                        // disabled={!acTypeID}
                      />
                      <ProFormTextArea
                        fieldProps={{
                          style: { resize: 'none' },
                          rows: 1,
                        }}
                        name="note"
                        label={t('REMARKS')}
                        width="lg"
                      />
                      <ProFormSelect
                        showSearch
                        name="status"
                        label={t('STATE')}
                        width="sm"
                        valueEnum={{
                          ACTIVE: { text: t('ACTIVE'), status: 'SUCCESS' },
                          INACTIVE: { text: t('INACTIVE'), status: 'Error' },
                        }}
                      />
                    </>
                  )}
                </ProFormGroup>
                {/* {taskType !== 'PART_PRODUCE' && (
                  <ProFormGroup>
                    <ProFormDigit
                      width={'xs'}
                      name="intervalDAYS"
                      label={t('INTERVAL DAYS')}
                    />
                    <ProFormDigit
                      width={'xs'}
                      name="toleranceDAY"
                      label={t('TOLERANCE DAY')}
                    />
                    <ProFormDigit
                      width={'xs'}
                      name="intervalMOS"
                      label={t('INTERVAL MOS')}
                    />
                    <ProFormDigit
                      width={'xs'}
                      name="toleranceMOS"
                      label={t('TOLERANCE MOS')}
                    />
                    <ProFormDigit
                      width={'xs'}
                      name="intervalHRS"
                      label={t('INTERVAL HRS')}
                    />
                    <ProFormDigit
                      width={'xs'}
                      name="toleranceMHS"
                      label={t('TOLERANCE MHS')}
                    />
                    <ProFormDigit
                      width={'xs'}
                      name="intervalAFL"
                      label={t('INTERVAL AFL')}
                    />
                    <ProFormDigit
                      width={'xs'}
                      name="intervalENC"
                      label={t('INTERVAL ENC')}
                    />
                    <ProFormDigit
                      width={'xs'}
                      name="intervalAPUS"
                      label={t('INTERVAL APUS')}
                    />
                  </ProFormGroup>
                )} */}
              </ProFormGroup>
            </div>
          ) : (
            <Empty />
          )}
        </Tabs.TabPane>
        <Tabs.TabPane tab={tabTitles['3']} key="3">
          {projectItemID ? (
            <div className=" h-[62vh] flex flex-col overflow-auto pb-3">
              <StepContainer
                steps={stepsToRender || []}
                onAddStep={handleAddStep}
                onDeleteStep={handleDeleteStep}
              />
            </div>
          ) : (
            <Empty></Empty>
          )}
        </Tabs.TabPane>
        <Tabs.TabPane tab={tabTitles['5']} key="5">
          <RequarementsList
            isIssueVisibale={true}
            order={order}
            isAddVisiable={false}
            isChekboxColumn={true}
            fetchData={transformedRequirements}
            columnDefs={columnRequirements}
            partNumbers={partNumbers || []}
            taskId={order?.id}
            onUpdateData={function (data: any[]): void {}}
            height={'54Vh'}
            onRowSelect={function (rowData: IRequirement | null): void {}}
            onCheckItems={function (selectedKeys: any[]): void {
              handleCheckItems(selectedKeys);
            }}
            onDelete={function (reqID: string): void {
              throw new Error('Function not implemented.');
            }}
            onSave={function (rowData: IRequirement): void {
              throw new Error('Function not implemented.');
            }}
          ></RequarementsList>
        </Tabs.TabPane>
        <Tabs.TabPane tab={tabTitles['2']} key="2">
          <div className=" h-[62vh] flex flex-col overflow-auto pb-3">
            <PartContainer
              isAddVisiable={true}
              height={'58vh'}
              columnDefs={columnDefs}
              partNumbers={partNumbers || []}
              onUpdateData={(data: any[]): void => {}}
              rowData={
                order?.partTaskID &&
                transformToIPartNumber(
                  order?.partTaskID || [], // Передаем массив `order.partTaskID`
                  ['CONS', 'ROT'] // Ваши группы инструментов
                )
              }
            />
          </div>
        </Tabs.TabPane>
        <Tabs.TabPane tab={tabTitles['4']} key="4">
          <div className=" h-[62vh] flex flex-col overflow-auto pb-3">
            <PartContainer
              isAddVisiable={true}
              height={'58vh'}
              columnDefs={columnDefs}
              partNumbers={partNumbers || []}
              onUpdateData={(data: any[]): void => {}}
              rowData={
                order?.partTaskID &&
                transformToIPartNumber(
                  order?.partTaskID || [], // Передаем массив `order.partTaskID`
                  ['TOOL', 'GSE'] // Ваши группы инструментов
                )
              }
            />
          </div>
        </Tabs.TabPane>
      </Tabs>
      {/* </div> */}
    </ProForm>
  );
};

export default WOAdminForm;
