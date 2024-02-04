import TabContent from '@/components/shared/Table/TabContent';

import { Button, Col, Form, FormInstance, Row, Space, message } from 'antd';
import React, { FC, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { v4 as originalUuidv4 } from 'uuid';
import { EditOutlined, SettingOutlined } from '@ant-design/icons';
import {
  ModalForm,
  ProForm,
  ProFormDatePicker,
  ProFormDigit,
  ProFormGroup,
  ProFormRadio,
  ProFormSelect,
  ProFormText,
} from '@ant-design/pro-components';
import { useAppDispatch } from '@/hooks/useTypedSelector';
import {
  createSingleRequirement,
  fetchProjectById,
  getFilteredAditionalTasks,
  getFilteredProjectTasks,
  getFilteredProjects,
  updateRequirementByID,
} from '@/utils/api/thunks';

import Title from 'antd/es/typography/Title';
import { IProjectTaskAll } from '@/models/IProjectTask';

import { IAdditionalTaskMTBCreate } from '@/models/IAdditionalTaskMTB';
import { USER_ID } from '@/utils/api/http';
import ContextMenuPNSearchSelect from '@/components/shared/form/ContextMenuPNSearchSelect';
type RequirementsDtailsType = {
  requierement: any;
  onEditRequirementsDtailsEdit: (data: any) => void;
};
interface Option {
  value: string;
  label: string;
}
const RequirementsDtails: FC<RequirementsDtailsType> = ({
  onEditRequirementsDtailsEdit,
  requierement,
}) => {
  const [selectedRequirementState, setSelectedRequirementState] = useState<
    any | null
  >(null);
  const [isEditing, setIsEditing] = useState(true);
  const [isEditingView, setIsEditingView] = useState(false);

  const [isCreating, setIsCreating] = useState(false);

  const { t } = useTranslation();

  const [form] = Form.useForm();
  const [formReq] = Form.useForm();
  const [formBook] = Form.useForm();
  const [formAdd] = Form.useForm();
  const [options, setOptions] = useState<Option[]>([]);
  const [taskOptions, setTaskOptions] = useState<Option[]>([]);
  const dispatch = useAppDispatch();
  const formRef = useRef<FormInstance>(null);
  const handleKeyPress = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter') {
      formRef.current?.submit(); // вызываем метод submit формы при нажатии Enter
    }
  };
  useEffect(() => {
    if (requierement && isEditingView) {
      setIsEditing(false);
    } else {
      setIsEditing(false);
    }
  }, [requierement]);

  useEffect(() => {
    if (isEditingView) {
      setIsEditing(true);
    } else {
      setIsEditing(false);
    }
  }, [isEditingView]);
  useEffect(() => {
    if (isCreating) {
      form.setFields([{ name: 'partNumber', value: '' }]);
    }
  }, [isCreating]);
  useEffect(() => {
    const fetchData = async () => {
      const currentCompanyID = localStorage.getItem('companyID');
      if (currentCompanyID) {
        const result = await dispatch(
          getFilteredProjects({ companyID: currentCompanyID || '' })
        );
        if (result.meta.requestStatus === 'fulfilled') {
          const options = result.payload.map((item: any) => ({
            value: item._id, // замените на нужное поле для 'PROJECT'
            label: `${item.projectWO}-${item.projectName}`, // замените на нужное поле для 'PROJECT'
          }));
          setOptions(options);
        }
      }
    };

    fetchData();
  }, [dispatch]);
  const [selectedProjectId, setSelectedProjectId] = useState<any | null>(null);
  const [selectedTask, setSelectedTask] = useState<any | null>(null);
  const [receiverType, setReceiverType] = useState<any>('MAIN_TASK');
  useEffect(() => {
    const currentCompanyID = localStorage.getItem('companyID');
    if (receiverType) {
      let action;
      let url;
      switch (receiverType) {
        case 'MAIN_TASK':
          action = getFilteredProjectTasks({
            projectId: selectedProjectId,
          });

          break;
        case 'NRC':
          action = getFilteredAditionalTasks({
            projectId: selectedProjectId,
            companyID: currentCompanyID || '',
          });

          break;
      }

      if (action) {
        dispatch(action)
          .then((action) => {
            const data: any[] = action.payload; // предполагаем, что payload содержит массив данных
            let options;
            switch (receiverType) {
              case 'MAIN_TASK':
                options = data.map((item: IProjectTaskAll) => ({
                  value: item._id || item.id, // замените на нужное поле для 'PROJECT'
                  label: `${item.projectTaskWO}`, // замените на нужное поле для 'PROJECT'
                }));
                break;
              case 'NRC':
                options = data.map((item: IAdditionalTaskMTBCreate) => ({
                  value: item._id || item.id, // замените на нужное поле для 'PROJECT'
                  label: `${item.additionalNumberId}`, // замените на нужное поле для 'PROJECT'
                }));
                break;

              default:
                options = data.map((item: any) => ({
                  value: item.defaultField1, // замените на нужное поле для 'default'
                  label: item.defaultField2, // замените на нужное поле для 'default'
                }));
            }
            setTaskOptions(options);
          })
          .catch((error) => {
            console.error('Ошибка при получении данных:', error);
          });
      }
    }
  }, [selectedProjectId, receiverType, dispatch]);

  const [project, setProject] = useState<any>(null);
  const [isResetForm, setIsResetForm] = useState<boolean>(false);
  const [initialFormPN, setinitialFormPN] = useState<any>('');

  useEffect(() => {
    if (requierement) {
      setinitialFormPN(requierement.PN);
      // onSelectSelectedStore && onSelectSelectedStore(selectedStore);
      form.setFields([
        { name: 'projectNumber', value: requierement?.projectWO },
        { name: 'partNumber', value: requierement?.PN },
        { name: 'projectState', value: requierement?.status },

        { name: 'department', value: requierement.department },
        { name: 'description', value: requierement.nameOfMaterial },
        { name: 'customer', value: requierement.customer },
        { name: 'startDate', value: requierement.startDate },
        { name: 'planedStartDate', value: requierement.plannedDate },
        { name: 'unit', value: requierement?.unit },
        { name: 'qty', value: requierement?.amout },
        { name: 'partGroup', value: requierement?.group },
        { name: 'partType', value: requierement?.type },
        { name: 'task', value: requierement?.projectTaskWO },
      ]);
      formReq.setFields([
        { name: 'qty', value: requierement?.issuedQuantity || 0 },
        { name: 'unit', value: requierement?.unit },
      ]);
      formBook.setFields([
        { name: 'qty', value: requierement?.requestQuantity || 0 },
        { name: 'unit', value: requierement?.unit },
      ]);

      // onFilterTransferprojects(form.getFieldsValue());
    }
  }, [requierement]);

  const tabs = [
    {
      content: (
        <div className="h-[70vh] bg-white px-4 py-3 rounded-md border-gray-400  ">
          <ProForm
            onReset={() => {
              setIsResetForm(true);
              setinitialFormPN('');
            }}
            onValuesChange={(changedValues, allValues) => {
              // Handle changes in the form
              if (changedValues.receiverType) {
                setReceiverType(changedValues.receiverType);
              }
            }}
            submitter={{
              render: (_, dom) =>
                isEditing || isCreating
                  ? [
                      ...dom,
                      <Button
                        key="cancel"
                        onClick={() => {
                          isEditing && setIsEditingView(!isEditingView);
                          isCreating && setIsCreating(false);
                          setSelectedRequirementState(
                            form.getFieldValue('projectState')
                          );
                        }}
                      >
                        {t('Cancel')}
                      </Button>,
                    ]
                  : [],
              submitButtonProps: {
                children: 'Search',
              },
            }}
            size="small"
            form={form}
            disabled={
              (!isEditing && !isCreating) ||
              requierement?.status === 'closed' ||
              requierement?.status === 'canceled'
            }
            layout="horizontal"
            // labelCol={{ span: 10 }}
            onFinish={async (values) => {
              const companyID = localStorage.getItem('companyID');
              if (isEditing && !isCreating) {
                // console.log(selectedTask);
                const result = await dispatch(
                  updateRequirementByID({
                    id: requierement.id || requierement._id,
                    updateUserID: USER_ID || '',
                    updateDate: new Date(),
                    companyID: companyID || '',
                    projectID: requierement?.projectID,
                    status: values.projectState,
                    // amout: values.qty,
                    // unit: values.unit,
                    // nameOfMaterial: values.description || '',
                    // group: values.partGroup,
                    // type: values.partType,
                    // PN: form.getFieldValue('partNumber'),
                    // projectTaskID:
                    //   receiverType === 'MAIN_TASK'
                    //     ? selectedTask
                    //     : requierement?.projectTaskID,
                    // additionalTaskID:
                    //   receiverType === 'NRC'
                    //     ? selectedTask
                    //     : requierement?.additionalTaskID,
                    // projectTaskWO:
                    //   Number(form.getFieldValue('task')) ||
                    //   Number(form.getFieldValue('addTask')),
                  })
                );
                if (result.meta.requestStatus === 'fulfilled') {
                  onEditRequirementsDtailsEdit(result.payload);
                  message.success(t('SUCCESS'));
                  setIsEditing(false);
                  setIsCreating(false);
                }
              }
              if (isCreating) {
                const result = await dispatch(
                  createSingleRequirement({
                    status: values.projectState,
                    companyID: companyID || '',
                    createUserID: USER_ID || '',
                    projectID: selectedProjectId || '',
                    projectTaskID: selectedTask,
                    quantity: values.qty,
                    unit: values.unit,
                    description: values.description || '',
                    group: values.partGroup,
                    type: values.partType,
                    partNumber: form.getFieldValue('partNumber'),
                    isNewAdded: false,
                    createDate: new Date(),
                    taskNumber: values.task || values.addTask,
                    issuedQuantity: 0,
                    plannedDate: values.planedStartDate || new Date(),
                    registrationNumber: project?.acRegistrationNumber,
                  })
                );
                if (result.meta.requestStatus === 'fulfilled') {
                  onEditRequirementsDtailsEdit(result.payload);
                  message.success(t('SUCCESS'));
                  setIsEditing(false);
                  setIsCreating(false);
                }
              }
            }}
          >
            {isEditing && !isCreating && (
              <ProFormSelect
                showSearch
                rules={[{ required: true }]}
                name="projectState"
                label={t('REQUIREMENT STATE')}
                width="sm"
                // initialValue={planned}
                valueEnum={{
                  // inStockReserve: { text: t('RESERVATION'), status: 'Success' },
                  //onPurchasing: { text: t('PURCHASING'), status: 'Processing' },
                  planned: { text: t('PLANNED'), status: 'Default' },
                  open: { text: t('NEW'), status: 'Error' },
                  closed: { text: t('CLOSED'), status: 'Default' },
                  canceled: { text: t('CANCELLED'), status: 'Error' },
                  onOrder: { text: t('ISSUED'), status: 'Processing' },
                }}
              />
            )}
            {isCreating && (
              <ProFormSelect
                showSearch
                rules={[{ required: true }]}
                name="projectState"
                label={t('REQUIREMENT STATE')}
                width="sm"
                // initialValue={planned}
                valueEnum={{
                  // inStockReserve: { text: t('RESERVATION'), status: 'Success' },
                  //onPurchasing: { text: t('PURCHASING'), status: 'Processing' },
                  planned: { text: t('PLANNED'), status: 'Default' },
                  open: { text: t('NEW'), status: 'Error' },
                }}
              />
            )}
            {!isCreating && !isEditing && (
              <ProFormSelect
                disabled
                showSearch
                rules={[{ required: true }]}
                name="projectState"
                label={t('REQUIREMENT STATE')}
                width="sm"
                // initialValue={planned}
                valueEnum={{
                  // inStockReserve: { text: t('RESERVATION'), status: 'Success' },
                  //onPurchasing: { text: t('PURCHASING'), status: 'Processing' },
                  planned: { text: t('PLANNED'), status: 'Default' },
                  open: { text: t('NEW'), status: 'Error' },
                  closed: { text: t('CLOSED'), status: 'Default' },
                  canceled: { text: t('CANCELLED'), status: 'Error' },
                  onOrder: { text: t('ISSUED'), status: 'Processing' },
                }}
              />
            )}
            <ProFormGroup>
              <ProFormSelect
                disabled={!isCreating}
                rules={[{ required: true }]}
                name="projectNumber"
                label={`${t(`PROJECT LINK`)}`}
                width="sm"
                options={options}
                onChange={async (value: any) => {
                  setSelectedProjectId(value);
                  const companyID = localStorage.getItem('companyID');
                  const result = await dispatch(fetchProjectById(value));
                  if (result.meta.requestStatus === 'fulfilled') {
                    setProject(result.payload);
                  }
                }}
              />

              {
                <ProForm.Group>
                  <ProFormRadio.Group
                    name="receiverType"
                    disabled={!isCreating}
                    label={`${t('TASK TYPE')}`}
                    options={[
                      { value: 'MAIN_TASK', label: `${t(`MAIN TASK`)}` },
                      { value: 'NRC', label: 'NRC' },
                    ]}
                    initialValue="MAIN_TASK"
                  />
                  {receiverType === 'MAIN_TASK' && (
                    <ProFormSelect
                      showSearch
                      disabled={!isCreating}
                      mode="single"
                      name="task"
                      label={`${t(`TASK`)}`}
                      width="sm"
                      options={taskOptions}
                      onChange={(value: any) => {
                        setSelectedTask(value);
                      }}
                    />
                  )}
                  {receiverType === 'NRC' && (
                    <ProFormSelect
                      showSearch
                      disabled={!isCreating}
                      mode="single"
                      name="addTask"
                      label={`${t(`TASK`)}`}
                      width="sm"
                      options={taskOptions}
                      onChange={(value: any) => {
                        setSelectedTask(value);
                      }}
                    />
                  )}
                </ProForm.Group>
              }
            </ProFormGroup>

            <ProFormGroup direction="horizontal">
              <ProFormGroup>
                <ContextMenuPNSearchSelect
                  isResetForm={isResetForm}
                  rules={[{ required: true }]}
                  onSelectedPN={function (PN: any): void {
                    form.setFields([
                      { name: 'partNumber', value: PN.PART_NUMBER },
                    ]);
                    form.setFields([
                      { name: 'description', value: PN.DESCRIPTION },
                    ]);
                    form.setFields([
                      { name: 'unit', value: PN.UNIT_OF_MEASURE },
                    ]);
                    form.setFields([
                      { name: 'addPartNumber', value: PN.PART_NUMBER },
                    ]);
                    form.setFields([
                      { name: 'addDescription', value: PN.DESCRIPTION },
                    ]);

                    form.setFields([{ name: 'partGroup', value: PN.GROUP }]);
                    form.setFields([{ name: 'partType', value: PN.TYPE }]);
                  }}
                  name={'partNumber'}
                  initialFormPN={initialFormPN}
                ></ContextMenuPNSearchSelect>
                <ProFormText
                  disabled
                  rules={[{ required: true }]}
                  name="description"
                  label={t('DESCRIPTION')}
                  width="sm"
                  tooltip={t('DESCRIPTION')}
                ></ProFormText>
              </ProFormGroup>
              <ProFormGroup>
                <ProFormDigit
                  name="qty"
                  disabled={!isCreating || !isEditing}
                  rules={[{ required: true }]}
                  label={t('QTY')}
                  width="xs"
                  tooltip={t('QTY')}
                ></ProFormDigit>

                <ProFormSelect
                  rules={[{ required: true }]}
                  label={t('UNIT')}
                  disabled
                  name="unit"
                  width="sm"
                  valueEnum={{
                    EA: `EA/${t('EACH').toUpperCase()}`,
                    M: `M/${t('Meters').toUpperCase()}`,
                    ML: `ML/${t('Milliliters').toUpperCase()}`,
                    SI: `SI/${t('Sq Inch').toUpperCase()}`,
                    CM: `CM/${t('Centimeters').toUpperCase()}`,
                    GM: `GM/${t('Grams').toUpperCase()}`,
                    YD: `YD/${t('Yards').toUpperCase()}`,
                    FT: `FT/${t('Feet').toUpperCase()}`,
                    SC: `SC/${t('Sq Centimeters').toUpperCase()}`,
                    IN: `IN/${t('Inch').toUpperCase()}`,
                    SH: `SH/${t('Sheet').toUpperCase()}`,
                    SM: `SM/${t('Sq Meters').toUpperCase()}`,
                    RL: `RL/${t('Roll').toUpperCase()}`,
                    KT: `KT/${t('Kit').toUpperCase()}`,
                    LI: `LI/${t('Liters').toUpperCase()}`,
                    KG: `KG/${t('Kilograms').toUpperCase()}`,
                    JR: `JR/${t('Jar/Bottle').toUpperCase()}`,
                  }}
                ></ProFormSelect>
              </ProFormGroup>
              <ProFormGroup>
                <ProFormSelect
                  disabled
                  rules={[{ required: true }]}
                  name="partGroup"
                  label={`${t('PART SPESIAL GROUP')}`}
                  width="sm"
                  tooltip={`${t('SELECT SPESIAL GROUP')}`}
                  options={[
                    { value: 'CONS', label: t('CONS') },
                    { value: 'TOOL', label: t('TOOL') },
                    { value: 'CHEM', label: t('CHEM') },
                    { value: 'ROT', label: t('ROT') },
                    { value: 'GSE', label: t('GSE') },
                  ]}
                />
                <ProFormSelect
                  disabled
                  rules={[{ required: true }]}
                  name="partType"
                  label={`${t('PART TYPE')}`}
                  width="sm"
                  tooltip={`${t('SELECT PART TYPE')}`}
                  options={[
                    { value: 'ROTABLE', label: t('ROTABLE') },
                    { value: 'CONSUMABLE', label: t('CONSUMABLE') },
                  ]}
                />
              </ProFormGroup>
            </ProFormGroup>
            <ProFormGroup>
              <ProFormDatePicker
                label={t('PLANNED START DATE')}
                name="planedStartDate"
                width="sm"
              ></ProFormDatePicker>
            </ProFormGroup>
          </ProForm>
        </div>
      ),
      title: `${t(
        `${
          (requierement && requierement?.partRequestNumber) ||
          t('NEW REQUIREMENT')
        }`
      )}`,
    },
  ];
  // useEffect(() => {
  //   if (requierement && isEditingView) {
  //     setIsEditing(false);
  //   } else {
  //     setIsEditing(false);
  //   }
  // }, [requierement]);
  // useEffect(() => {
  //   if (isEditingView) {
  //     setIsEditing(true);
  //   } else {
  //     setIsEditing(false);
  //   }
  // }, [isEditingView]);
  return (
    <Row gutter={{ xs: 8, sm: 11, md: 24, lg: 32 }} className="gap-4">
      <Col
        xs={5}
        sm={6}
        className="h-[75vh] bg-white px-4 py-3 rounded-md brequierement-gray-400 "
      >
        <Space direction="vertical">
          <Space
            className={`cursor-pointer transform transition px-3 ${
              isEditing || isCreating
                ? 'opacity-50 cursor-not-allowed'
                : 'hover:text-blue-500'
            }`}
            onClick={() => {
              if (!isEditing || !isCreating) {
                setIsEditingView(!isEditingView);
                form.resetFields();
                formAdd.resetFields();
                setIsCreating(true);
                setIsEditing(false);
                onEditRequirementsDtailsEdit(null);
              }
            }}
          >
            <SettingOutlined
              className={`${
                isEditing || !isCreating
                  ? 'cursor-not-allowed'
                  : 'cursor-pointer'
              }`}
            />
            <div
              className={`${
                isEditing || !isCreating
                  ? 'cursor-not-allowed'
                  : 'cursor-pointer'
              }`}
            >
              {t('NEW REQUIREMENT')}
            </div>
          </Space>
          <Space
            onClick={() =>
              requierement &&
              requierement._id &&
              setIsEditingView(!isEditingView)
            }
            className={`cursor-pointer transform transition px-3 ${
              !requierement || !requierement._id
                ? 'opacity-50 cursor-not-allowed'
                : 'hover:text-blue-500'
            }`}
          >
            <EditOutlined />
            <>{t('EDIT')}</>
          </Space>
          {requierement && (
            <>
              <ProForm
                form={formReq}
                className="p-3 mx-4  bg-yellow-50 "
                disabled
                layout="horizontal"
                size={'small'}
                submitter={false}
              >
                <ProFormGroup>
                  <Title className="py-0 my-0" level={5}>
                    REQUESTED
                  </Title>
                  <ProFormDigit
                    name="qty"
                    disabled
                    label={t('QTY')}
                    width="xs"
                  ></ProFormDigit>
                  <ProFormSelect
                    label={t('UNIT')}
                    disabled
                    name="unit"
                    width="sm"
                    valueEnum={{
                      EA: `EA/${t('EACH').toUpperCase()}`,
                      M: `M/${t('Meters').toUpperCase()}`,
                      ML: `ML/${t('Milliliters').toUpperCase()}`,
                      SI: `SI/${t('Sq Inch').toUpperCase()}`,
                      CM: `CM/${t('Centimeters').toUpperCase()}`,
                      GM: `GM/${t('Grams').toUpperCase()}`,
                      YD: `YD/${t('Yards').toUpperCase()}`,
                      FT: `FT/${t('Feet').toUpperCase()}`,
                      SC: `SC/${t('Sq Centimeters').toUpperCase()}`,
                      IN: `IN/${t('Inch').toUpperCase()}`,
                      SH: `SH/${t('Sheet').toUpperCase()}`,
                      SM: `SM/${t('Sq Meters').toUpperCase()}`,
                      RL: `RL/${t('Roll').toUpperCase()}`,
                      KT: `KT/${t('Kit').toUpperCase()}`,
                      LI: `LI/${t('Liters').toUpperCase()}`,
                      KG: `KG/${t('Kilograms').toUpperCase()}`,
                      JR: `JR/${t('Jar/Bottle').toUpperCase()}`,
                    }}
                  ></ProFormSelect>
                </ProFormGroup>
              </ProForm>
              <ProForm
                form={formBook}
                className="p-3 mx-4 rounded-s  bg-lime-100 "
                disabled
                layout="horizontal"
                size={'small'}
                submitter={false}
              >
                <ProFormGroup>
                  <Title className="py-0 my-0" level={5}>
                    BOOKED
                  </Title>
                  <ProFormDigit
                    name="qty"
                    disabled
                    label={t('QTY')}
                    width="xs"
                  ></ProFormDigit>
                  <ProFormSelect
                    label={t('UNIT')}
                    disabled
                    name="unit"
                    width="sm"
                    valueEnum={{
                      EA: `EA/${t('EACH').toUpperCase()}`,
                      M: `M/${t('Meters').toUpperCase()}`,
                      ML: `ML/${t('Milliliters').toUpperCase()}`,
                      SI: `SI/${t('Sq Inch').toUpperCase()}`,
                      CM: `CM/${t('Centimeters').toUpperCase()}`,
                      GM: `GM/${t('Grams').toUpperCase()}`,
                      YD: `YD/${t('Yards').toUpperCase()}`,
                      FT: `FT/${t('Feet').toUpperCase()}`,
                      SC: `SC/${t('Sq Centimeters').toUpperCase()}`,
                      IN: `IN/${t('Inch').toUpperCase()}`,
                      SH: `SH/${t('Sheet').toUpperCase()}`,
                      SM: `SM/${t('Sq Meters').toUpperCase()}`,
                      RL: `RL/${t('Roll').toUpperCase()}`,
                      KT: `KT/${t('Kit').toUpperCase()}`,
                      LI: `LI/${t('Liters').toUpperCase()}`,
                      KG: `KG/${t('Kilograms').toUpperCase()}`,
                      JR: `JR/${t('Jar/Bottle').toUpperCase()}`,
                    }}
                  ></ProFormSelect>
                </ProFormGroup>
              </ProForm>
              <ProForm
                className="p-3 mx-4  bg-green-200"
                disabled
                layout="horizontal"
                size={'small'}
                submitter={false}
              >
                <ProFormGroup>
                  <Title className="py-0 my-0" level={5}>
                    STOCK
                  </Title>
                  <ProFormDigit
                    name="qty"
                    disabled
                    label={t('QTY')}
                    width="xs"
                  ></ProFormDigit>
                  <ProFormSelect
                    label={t('UNIT')}
                    disabled
                    name="unit"
                    width="sm"
                    valueEnum={{
                      EA: `EA/${t('EACH').toUpperCase()}`,
                      M: `M/${t('Meters').toUpperCase()}`,
                      ML: `ML/${t('Milliliters').toUpperCase()}`,
                      SI: `SI/${t('Sq Inch').toUpperCase()}`,
                      CM: `CM/${t('Centimeters').toUpperCase()}`,
                      GM: `GM/${t('Grams').toUpperCase()}`,
                      YD: `YD/${t('Yards').toUpperCase()}`,
                      FT: `FT/${t('Feet').toUpperCase()}`,
                      SC: `SC/${t('Sq Centimeters').toUpperCase()}`,
                      IN: `IN/${t('Inch').toUpperCase()}`,
                      SH: `SH/${t('Sheet').toUpperCase()}`,
                      SM: `SM/${t('Sq Meters').toUpperCase()}`,
                      RL: `RL/${t('Roll').toUpperCase()}`,
                      KT: `KT/${t('Kit').toUpperCase()}`,
                      LI: `LI/${t('Liters').toUpperCase()}`,
                      KG: `KG/${t('Kilograms').toUpperCase()}`,
                      JR: `JR/${t('Jar/Bottle').toUpperCase()}`,
                    }}
                  ></ProFormSelect>
                </ProFormGroup>
              </ProForm>
            </>
          )}
        </Space>
      </Col>

      <Col
        className="h-[82vh] px-4  rounded-md brequierement-gray-400"
        xs={15}
        sm={17}
      >
        <TabContent tabs={tabs}></TabContent>
      </Col>
    </Row>
  );
};

export default RequirementsDtails;
