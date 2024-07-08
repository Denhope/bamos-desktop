//@ts-nocheck

import React, { FC, useEffect, useMemo, useRef, useState } from 'react';
import { useGetGroupUsersQuery } from '@/features/userAdministration/userApi';
import {
  ProForm,
  ProFormText,
  ProFormGroup,
  ProFormSelect,
} from '@ant-design/pro-form';

import { Button, Space, Tabs } from 'antd';
import { useTranslation } from 'react-i18next';
import { IRequirement, Requirement } from '@/models/IRequirement';
import {
  ProFormDatePicker,
  ProFormDigit,
  ProFormTextArea,
} from '@ant-design/pro-components';
// import ContextMenuPNSearchSelect from '@/components/shared/form/ContextMenuPNSearchSelect';
import { useGetREQTypesQuery } from '@/features/requirementsTypeAdministration/requirementsTypeApi';
import { useGetREQCodesQuery } from '@/features/requirementsCodeAdministration/requirementsCodesApi';
import { useGetProjectsQuery } from '@/features/projectAdministration/projectsApi';
import { useGetPartNumbersQuery } from '@/features/partAdministration/partApi';
// import BookedPartContainer from '../../layout/APN/PickSlipConfirmationNew';
import { useGetProjectTasksQuery } from '@/features/projectTaskAdministration/projectsTaskApi';
import { useGetProjectItemsWOQuery } from '@/features/projectItemWO/projectItemWOApi';
import PartContainer from '@/components/woAdministration/PartContainer';
import { ColDef } from 'ag-grid-community';
import {
  useGetPickSlipItemsQuery,
  useUpdatePickSlipItemsMutation,
} from '@/features/pickSlipAdministration/pickSlipItemsApi';
import {
  transformToIAltPartNumber,
  transformToIRequirement,
  transformToPickSlipItemBooked,
  transformToPickSlipItemItem,
} from '@/services/utilites';
import { Split } from '@geoffcox/react-splitter';
import Title from 'antd/lib/typography/Title';
import BookedPartContainer from '@/components/layout/pickSlipConfirmationNew/BookedPartContainer';

interface UserFormProps {
  requierement?: any;
  onSubmit: (company: any) => void;
  onDelete?: (companyId: string) => void;
}

const PickSlipAdministrationForm: FC<UserFormProps> = ({
  requierement,
  onSubmit,
}) => {
  const [reqTypeID, setReqTypeID] = useState<any>('');
  const [form] = ProForm.useForm();
  const [projectId, setSelectedProjectId] = useState<any>();
  const [partNumberId, setPartNumberId] = useState<any>();
  // requierement?.projectID || ''

  const [selectedTask, setSelectedTask] = useState<any | null>(null);

  useEffect(() => {
    if (requierement) {
      form.resetFields();
      form.setFieldsValue(requierement);
      // setinitialFormPN(requierement.PN);
      setReqTypeID(requierement.reqTypesID);
      setSelectedProjectId(requierement.projectID?._id);
      setPartNumberId(requierement.partNumberID?._id);
      form.setFieldsValue({
        partNumberID: requierement.partNumberID?._id,
        group: requierement.partNumberID?.GROUP,
        nameOfMaterial: requierement.partNumberID?.DESCRIPTION,
        unit: requierement.partNumberID?.UNIT_OF_MEASURE,
        projectTaskID: requierement.projectTaskID?._id,
        projectID: requierement.projectID?._id,
        neededOnID: requierement?.neededOnID?._id,
        type: requierement?.type,
      });
    } else {
      form.resetFields();
      setSelectedProjectId(undefined);
    }
  }, [requierement, form]);

  const { t } = useTranslation();
  const [activeTabKey, setActiveTabKey] = useState('1'); // Default to the first tab
  const handleSubmit = async (values: any) => {
    const newUser: IRequirement = requierement
      ? { ...requierement, ...values }
      : { ...values };

    onSubmit(newUser);
  };

  const SubmitButton = () => (
    <Button disabled type="primary" htmlType="submit">
      {requierement ? t('UPDATE') : t('CREATE')}
    </Button>
  );

  const { data: usersGroups } = useGetGroupUsersQuery({});
  const { data: reqTypes } = useGetREQTypesQuery({});

  const { data: reqCodes } = useGetREQCodesQuery(
    {
      reqTypeID,
    },
    { skip: !reqTypeID }
  );
  const { data: projectTasks } = useGetProjectItemsWOQuery(
    { projectId },
    { skip: !projectId }
  );
  const { data: pickSlipItems } = useGetPickSlipItemsQuery(
    { pickSlipID: requierement?.id },
    { skip: !requierement }
  );
  const transformedBooked = useMemo(() => {
    return (
      requierement?.id && transformToPickSlipItemBooked(pickSlipItems || [])
    );
  }, [requierement?.id, pickSlipItems]);
  const { data: partNumbers, isLoading, isError } = useGetPartNumbersQuery({});
  const [rowDataForSecondContainer, setRowDataForSecondContainer] = useState<
    any[]
  >([]);

  useEffect(() => {
    if (transformedBooked && transformedBooked.length > 0) {
      setRowDataForSecondContainer(transformedBooked);
      // onUpdateData(fetchData);
    }
  }, [transformedBooked]);
  const { data: projects } = useGetProjectsQuery({});
  const [showSubmitButton, setShowSubmitButton] = useState(true);
  useEffect(() => {
    setShowSubmitButton(activeTabKey === '1');
  }, [activeTabKey]);
  const neededCodesValueEnum: Record<string, string> =
    usersGroups?.reduce((acc, usersGroup) => {
      acc[usersGroup.id] = usersGroup.title;
      return acc;
    }, {}) || {};

  // const partValueEnum: Record<string, any> =
  //   partNumbers?.reduce((acc, partNumber) => {
  //     acc[partNumber._id] = partNumber; // Store the entire partNumber object
  //     return acc;
  //   }, {}) || {};

  const projectTasksCodesValueEnum: Record<string, string> = (
    projectTasks ?? []
  ).reduce<Record<string, string>>((acc, projectTask) => {
    const taskCode =
      projectTask.taskWO ||
      projectTask.taskWo ||
      projectTask.projectTaskWO ||
      '';
    acc[projectTask.id] = taskCode;
    return acc;
  }, {});

  const projectsValueEnum: Record<string, string> = (projects ?? []).reduce<
    Record<string, string>
  >((acc, project) => {
    acc[project._id] = `${project.projectWO} - ${project.projectName}`;
    return acc;
  }, {});

  // const requirementTypesValueEnum: Record<string, string> =
  //   reqTypes?.reduce((acc, reqType) => {
  //     acc[reqType.id] = reqType.code;
  //     return acc;
  //   }, {}) || {};
  type CellDataType = 'text' | 'number' | 'date' | 'boolean'; // Определите возможные типы данных

  interface ExtendedColDef extends ColDef {
    cellDataType: CellDataType; // Обязательное свойство
  }
  const [columnDefs, setColumnDefs] = useState<ExtendedColDef[]>([
    {
      headerName: `${t('PART No')}`,
      field: 'PART_NUMBER',
      editable: false,

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
      field: 'requestedQty',
      headerName: `${t('REQUESTED QTY')}`,
      cellDataType: 'number',
    },
    {
      field: 'UNIT_OF_MEASURE',
      editable: false,
      filter: false,
      headerName: `${t('UNIT OF MEASURE')}`,
      cellDataType: 'text',
    },
    // Добавьте другие колонки по необходимости
  ]);
  const [columnBookedDefs, setColumnBookedDefs] = useState<ExtendedColDef[]>([
    {
      headerName: `${t('LOCAL_ID')}`,
      field: 'LOCAL_ID',
      editable: false,
      cellDataType: 'text',
    },
    {
      headerName: `${t('PART No')}`,
      field: 'PART_NUMBER_REQUEST',
      editable: false,

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
      field: 'bookedQty',
      headerName: `${t('BOOKED QTY')}`,
      cellDataType: 'number',
    },
    {
      field: 'canceledQty',
      headerName: `${t('CANCELED QTY')}`,
      cellDataType: 'number',
    },
    {
      field: 'UNIT_OF_MEASURE',
      editable: false,
      filter: false,
      headerName: `${t('UNIT OF MEASURE')}`,
      cellDataType: 'text',
    },
    {
      field: 'PRODUCT_EXPIRATION_DATE',
      editable: false,
      filter: false,
      headerName: `${t('EXPIRY DATE')}`,
      cellDataType: 'date',
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
      field: 'STORE',
      editable: false,
      filter: false,
      headerName: `${t('STORE')}`,
      cellDataType: 'text',
    },
    {
      field: 'LOCATION',
      editable: false,
      filter: false,
      headerName: `${t('LOCATION')}`,
      cellDataType: 'text',
    },
    {
      field: 'SERIAL_NUMBER',
      editable: false,
      filter: false,
      headerName: `${t('BATCH/SERIAL')}`,
      cellDataType: 'text',
    },
    {
      field: 'CONDITION',
      editable: false,
      filter: false,
      headerName: `${t('CONDITION')}`,
      cellDataType: 'text',
    },
    {
      field: 'OWNER',
      editable: false,
      filter: false,
      headerName: `${t('OWNER')}`,
      cellDataType: 'text',
    },
    // {
    //   field: 'RECEIVING_NUMBER',
    //   editable: false,
    //   filter: false,
    //   headerName: `${t('RECEIVING')}`,
    //   cellDataType: 'text',
    // },
    // {
    //   field: 'RECEIVED_DATE',
    //   editable: false,
    //   filter: false,
    //   headerName: `${t('RECEIVED DATE')}`,
    //   cellDataType: 'date',
    //   valueFormatter: (params: any) => {
    //     if (!params.value) return ''; // Проверка отсутствия значения
    //     const date = new Date(params.value);
    //     return date.toLocaleDateString('ru-RU', {
    //       year: 'numeric',
    //       month: '2-digit',
    //       day: '2-digit',
    //     });
    //   },
    // },
    // {
    //   field: 'DOC_NUMBER',
    //   editable: false,
    //   filter: false,
    //   headerName: `${t('DOC_NUMBER')}`,
    //   cellDataType: 'text',
    // },
    // {
    //   field: 'DOC_TYPE',
    //   editable: false,
    //   filter: false,
    //   headerName: `${t('DOC_TYPE')}`,
    //   cellDataType: 'text',
    // },
    // Добавьте другие колонки по необходимости
  ]);
  const transformedRequirements = useMemo(() => {
    return requierement?.id && transformToPickSlipItemItem(pickSlipItems || []);
  }, [requierement?.id, pickSlipItems]);
  const transformedBookedItems = useMemo(() => {
    return requierement?.id && transformToPickSlipItemItem(pickSlipItems || []);
  }, [requierement?.id, pickSlipItems]);
  return (
    <ProForm
      onReset={() => {
        form.resetFields();
        setSelectedProjectId(null);
      }}
      size="small"
      form={form}
      onFinish={handleSubmit}
      submitter={{
        render: (_, dom) => {
          if (showSubmitButton) {
            return [<SubmitButton key="submit" />, dom.reverse()[1]];
          }
          return null;
        },
      }}
      initialValues={requierement}
      layout="horizontal"
    >
      <Tabs
        activeKey={activeTabKey}
        defaultActiveKey="1"
        type="card"
        onChange={(key) => {
          setActiveTabKey(key);
          form.setFieldsValue({ activeTabKey: key });
        }}
      >
        <Tabs.TabPane tab={t('PICKSLIP INFORMATION')} key="1">
          <div className=" h-[57vh] flex flex-col overflow-auto">
            <ProFormGroup>
              <ProFormSelect
                disabled
                showSearch
                rules={[{ required: true }]}
                name="status"
                label={t('PICKSLIP STATE')}
                width="sm"
                initialValue={'draft'}
                options={[
                  { value: 'draft', label: t('DRAFT') },
                  // { value: 'planned', label: t('PLANNED') },
                  { value: 'open', label: t('OPEN') },
                  { value: 'issued', label: t('ISSUED') },
                  { value: 'onQuatation', label: t('QUATATION') },
                  { value: 'onShort', label: t('ON SHORT') },
                  { value: 'closed', label: t('CLOSED') },
                  { value: 'canceled', label: t('CANCELED') },
                  // { value: 'transfer', label: t('TRANSFER') },
                ]}
              />
              <ProFormSelect
                showSearch
                disabled
                name="type"
                label={t('PICKSLIP TYPE')}
                width="sm"
                options={[
                  { value: 'partRequest', label: t('PART REQUEST') },
                  // { value: 'planned', label: t('PLANNED') },
                ]}
                // valueEnum={requirementTypesValueEnum}
                onChange={(value: any) => setReqTypeID(value)}
              />
            </ProFormGroup>
            <ProFormGroup>
              <ProForm.Group direction="horizontal">
                <ProFormSelect
                  rules={[{ required: true }]}
                  // mode="multiple"
                  name="projectID"
                  disabled
                  label={`${t(`PROJECT`)}`}
                  width="lg"
                  valueEnum={projectsValueEnum}
                  onChange={async (value: any) => {
                    setSelectedProjectId(value);
                  }}
                />
                <ProFormSelect
                  showSearch
                  rules={[{ required: true }]}
                  name="neededOnID"
                  label={t('NEEDED ON')}
                  width="sm"
                  valueEnum={neededCodesValueEnum || []}
                  disabled
                />
              </ProForm.Group>

              {
                <ProForm.Group>
                  {
                    <ProFormSelect
                      showSearch
                      // rules={[{ required: true }]}
                      // disabled={!projectId}
                      disabled
                      mode="single"
                      name="projectTaskID"
                      label={`${t(`TRACE No`)}`}
                      width="sm"
                      valueEnum={projectTasksCodesValueEnum}
                      onChange={(value: any) => {
                        setSelectedTask(value);
                      }}
                    />
                  }
                </ProForm.Group>
              }
            </ProFormGroup>

            <ProFormTextArea
              fieldProps={{
                style: { resize: 'none' },
                rows: 3,
              }}
              name="note"
              colSize={1}
              label={t('REMARKS')}
              width="xl"
            ></ProFormTextArea>
          </div>
        </Tabs.TabPane>
        <Tabs.TabPane tab={t('PICKSLIP PARTS')} key="2">
          <Split initialPrimarySize="50%" splitterSize="20px">
            <div className="flex flex-col">
              <Title className="my-0" level={4}>
                {t('REQUESTED PARTS')}
              </Title>
              <PartContainer
                isChekboxColumn={false}
                isVisible={true}
                pagination={false}
                isAddVisiable={true}
                isButtonVisiable={false}
                isEditable={true}
                height={'55vh'}
                columnDefs={columnDefs}
                partNumbers={[]}
                onUpdateData={(data: any[]): void => {}}
                rowData={transformedRequirements}
              />
            </div>
            <div className="flex flex-col">
              <Title className="my-0" level={4}>
                {t('BOOKED PARTS')}
              </Title>
              <BookedPartContainer
                isFilesVisiable={true}
                isChekboxColumn={false}
                isVisible={false}
                pagination={false}
                isAddVisiable={true}
                isButtonVisiable={false}
                isEditable={true}
                height={'55vh'}
                columnDefs={columnBookedDefs}
                partNumbers={[]}
                onRowSelect={(data: any[]): void => {
                  console.log(data);
                }}
                onUpdateData={(data: any[]): void => {}}
                fetchData={rowDataForSecondContainer}
              />
            </div>
          </Split>
        </Tabs.TabPane>
      </Tabs>
    </ProForm>
  );
};
export default PickSlipAdministrationForm;
