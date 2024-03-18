import React, { FC, useEffect, useRef, useState } from 'react';
import {
  ProForm,
  ProFormText,
  ProFormCheckbox,
  ProFormGroup,
  ProFormSelect,
} from '@ant-design/pro-form';
import { Button, Form, FormInstance, Tabs, Upload, message } from 'antd';
import { ICompany } from '@/models/IUser';
import { useTranslation } from 'react-i18next';
import { getFilteredProjects, uploadFileServer } from '@/utils/api/thunks';
import { UploadOutlined } from '@ant-design/icons';
import { handleFileSelect } from '@/services/utilites';
import { Requirement } from '@/models/IRequirement';
import ContextMenuProjectSearchSelect from '@/components/shared/form/ContextMenuProjectSearchSelect';
import { useAppDispatch } from '@/hooks/useTypedSelector';
import {
  ProFormDatePicker,
  ProFormDigit,
  ProFormRadio,
  ProFormTextArea,
} from '@ant-design/pro-components';
import ContextMenuPNSearchSelect from '@/components/shared/form/ContextMenuPNSearchSelect';
import tooltip from 'antd/es/tooltip';

interface UserFormProps {
  requierement?: Requirement;
  onSubmit: (company: Requirement) => void;
  onDelete?: (companyId: string) => void;
  isCreatingV?: boolean;
}
interface Option {
  value: string;
  label: string;
}
const RequirementForm: FC<UserFormProps> = ({
  requierement,
  onSubmit,
  isCreatingV,
}) => {
  const [selectedRequirementState, setSelectedRequirementState] = useState<
    any | null
  >(null);
  const [isEditing, setIsEditing] = useState(true);
  const [isEditingView, setIsEditingView] = useState(false);

  const [isCreating, setIsCreating] = useState(isCreatingV);

  const [formReq] = Form.useForm();
  const [formBook] = Form.useForm();
  const [formAdd] = Form.useForm();
  const [options, setOptions] = useState<Option[]>([]);
  const [taskOptions, setTaskOptions] = useState<Option[]>([]);
  const dispatch = useAppDispatch();
  const formRef = useRef<FormInstance>(null);
  const [project, setProject] = useState<any>(null);
  const [isResetForm, setIsResetForm] = useState<boolean>(false);
  const [initialFormPN, setinitialFormPN] = useState<any>('');
  const [initialFormProject, setinitialFormProject] = useState<any>('');
  const [selectedSingleProject, setSecectedSingleProject] = useState<any>();

  const [form] = ProForm.useForm();

  useEffect(() => {
    const fetchProjects = async () => {
      const currentCompanyID = localStorage.getItem('companyID');
      if (currentCompanyID) {
        try {
          const result = await dispatch(
            getFilteredProjects({ companyID: currentCompanyID })
          ).unwrap();
          const projectOptions = result.map((item: any) => ({
            value: item._id,
            label: `${item.projectWO}-${item.projectName}`,
          }));
          setOptions(projectOptions);
        } catch (error) {
          message.error('Failed to fetch projects');
        }
      }
    };

    fetchProjects();
  }, [dispatch]);
  useEffect(() => {
    if (isCreatingV) {
      setIsCreating(true);
      form.resetFields();
      setinitialFormProject('');
      setinitialFormPN('');
      setProject(null);
      setSecectedSingleProject(null);
      setinitialFormProject('');
      setSecectedSingleProject({ projectWO: '' });
    } else {
      setinitialFormPN('');
      setinitialFormProject('');
    }
  }, [requierement, isCreatingV, form]);

  useEffect(() => {
    if (requierement) {
      form.setFieldsValue({
        // projectNumber: requierement.projectWO,
        partNumber: requierement.PN,
        projectState: requierement.status,
        description: requierement.nameOfMaterial,
        planedStartDate: requierement.plannedDate,
        unit: requierement.unit,
        qty: requierement.amout,
        partGroup: requierement.group,
        partType: requierement.type,
        task: requierement.projectTaskWO,
      });
      setinitialFormPN(requierement.PN);
      setinitialFormProject(requierement.projectWO);

      // Additional form field settings for formReq and formBook
    } else {
      setinitialFormPN('');
      form.setFieldsValue({
        // projectNumber: requierement.projectWO,
        partNumber: '',
      });
    }
  }, [requierement, form]);
  const [selectedProjectId, setSelectedProjectId] = useState<any | null>(null);

  const [selectedTask, setSelectedTask] = useState<any | null>(null);
  const [receiverType, setReceiverType] = useState<any>('MAIN_TASK');

  const { t } = useTranslation();

  const handleSubmit = async (values: any) => {
    try {
      // Perform any necessary data transformation or validation here
      const newRequirement: any = {
        // ...map the form values to the Requirement model
      };
      onSubmit(newRequirement);
      if (isCreating) {
        form.resetFields(); // Reset the form fields after creating a new requirement
      }
    } catch (error) {
      message.error(t('ERROR SAVING REQUIREMENT'));
    }
  };

  const handleUpload = async (file: File) => {
    if (!requierement || !requierement.id) {
      console.error(
        'Невозможно загрузить файл: компания не существует или не имеет id'
      );
      return;
    }

    const formData = new FormData();
    formData.append('file', file);
    try {
      const response = await uploadFileServer(formData);

      if (response) {
        const updatedCompany: Requirement = {
          ...requierement,
          // FILES: response,
        };

        onSubmit({
          ...requierement,
          // FILES: response
        });
      } else {
        message.error('Ошибка при загрузке файла: неверный ответ сервера');
      }
    } catch (error) {
      message.error('Ошибка при загрузке файла');
      throw error;
    }
  };
  const SubmitButton = () => (
    <Button type="primary" htmlType="submit">
      {requierement ? t('UPDATE') : t('CREATE')}
    </Button>
  );
  const [showSubmitButton, setShowSubmitButton] = useState(true);
  return (
    <ProForm
      onReset={() => {
        // setIsResetForm(true);

        // setTimeout(() => {
        //   setIsResetForm(false);
        // }, 0);
        setinitialFormPN('');
        setProject(null);
        setSecectedSingleProject(null);
        setinitialFormProject('');
        setSecectedSingleProject({ projectWO: '' });
      }}
      onValuesChange={(changedValues, allValues) => {
        // Handle changes in the form
        if (changedValues.receiverType) {
          setReceiverType(changedValues.receiverType);
        }
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
      <Tabs defaultActiveKey="1" type="card">
        <Tabs.TabPane tab="MAIN" key="1">
          <>
            <ProFormSelect
              showSearch
              rules={[{ required: true }]}
              name="projectState"
              label={t('REQUIREMENT STATE')}
              width="sm"
              initialValue={'draft'}
              valueEnum={{
                // inStockReserve: { text: t('RESERVATION'), status: 'SUCCESS' },
                //onPurchasing: { text: t('PURCHASING'), status: 'Processing' },
                planned: { text: t('PLANNED'), status: 'Default' },
                open: { text: t('NEW'), status: 'Error' },
                draft: { text: t('DRAFT'), status: 'Default' },
                // inStockReserve: { text: t('RESERVATION'), status: 'SUCCESS' },
                //onPurchasing: { text: t('PURCHASING'), status: 'Processing' },

                closed: { text: t('CLOSED'), status: 'Default' },
                canceled: { text: t('CANCELLED'), status: 'Error' },
                onOrder: { text: t('ISSUED'), status: 'Processing' },
              }}
            />
          </>

          <ProFormGroup>
            <ProForm.Group direction="horizontal">
              <ContextMenuProjectSearchSelect
                disabled={!isCreating}
                isResetForm={isResetForm}
                rules={[{ required: true }]}
                onSelectedProject={function (project: any): void {
                  setSelectedProjectId(project._id || project.id);
                  setProject(project);
                  setSecectedSingleProject(project);
                }}
                name={'projectNumber'}
                initialForm={
                  initialFormProject || selectedSingleProject?.projectWO
                  // ''
                }
                width={'sm'}
                label={`${t(`PROJECT LINK`)}`}
              ></ContextMenuProjectSearchSelect>{' '}
              <ProFormSelect
                // mode="multiple"
                name="requierementType"
                label={`${t('REQUIREMENT  TYPE')}`}
                width="sm"
                options={[
                  { value: 'PART_REQUEST', label: t('PART REQUEST') },
                  { value: 'WORK', label: t('WORK') },
                ]}
              />
            </ProForm.Group>

            {
              <ProForm.Group>
                <ProFormRadio.Group
                  name="receiverType"
                  disabled={!isCreating || !project}
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
                    disabled={!isCreating || !project}
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
                    disabled={!isCreating || !project}
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
                disabled={!isCreating}
                isResetForm={isResetForm}
                rules={[{ required: true }]}
                onSelectedPN={function (PN: any): void {
                  form.setFields([
                    { name: 'partNumber', value: PN.PART_NUMBER },
                  ]);
                  form.setFields([
                    {
                      name: 'description',
                      value: PN.DESCRIPTION || PN.nameOfMaterial,
                    },
                  ]);
                  form.setFields([{ name: 'unit', value: PN.UNIT_OF_MEASURE }]);
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
                initialFormPN={initialFormPN || ''}
                width={'lg'}
                label={`${t('PART No')}`}
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
                disabled={!isCreating}
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
                label={`${t('PART GROUP')}`}
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
          <ProFormTextArea
            fieldProps={{ style: { resize: 'none' } }}
            name="remarks"
            colSize={1}
            label={t('REMARKS')}
            width="xl"
          ></ProFormTextArea>
        </Tabs.TabPane>
      </Tabs>

      {/* <ProForm.Item>
        <Button type="primary" htmlType="submit">
          {company ? 'Update' : 'Create'}
        </Button>
      </ProForm.Item> */}
    </ProForm>
  );
};
export default RequirementForm;
