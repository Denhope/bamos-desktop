//@ts-nocheck

import React, { FC, useEffect, useState } from 'react';
import { useGetGroupUsersQuery } from '@/features/userAdministration/userApi';
import {
  ProForm,
  ProFormText,
  ProFormGroup,
  ProFormSelect,
} from '@ant-design/pro-form';
import { Button, Tabs, Checkbox } from 'antd';
import { useTranslation } from 'react-i18next';
import { IRequirement } from '@/models/IRequirement';
import {
  ProFormDatePicker,
  ProFormDigit,
  ProFormTextArea,
} from '@ant-design/pro-components';
import { useGetREQTypesQuery } from '@/features/requirementsTypeAdministration/requirementsTypeApi';
import { useGetREQCodesQuery } from '@/features/requirementsCodeAdministration/requirementsCodesApi';
import { useGetProjectsQuery } from '@/features/projectAdministration/projectsApi';
import { useGetPartNumbersQuery } from '@/features/partAdministration/partApi';
import { useGetProjectItemsWOQuery } from '@/features/projectItemWO/projectItemWOApi';
import PermissionGuard, { Permission } from '@/components/auth/PermissionGuard';
import { useGetfilteredWOQuery } from '@/features/wpAdministration/wpApi';

// Реализация хука useLocalStorage
function useLocalStorage<T>(
  key: string,
  initialValue: T
): [T, (value: T) => void] {
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.log(error);
      return initialValue;
    }
  });

  const setValue = (value: T) => {
    try {
      const valueToStore =
        value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      window.localStorage.setItem(key, JSON.stringify(valueToStore));
    } catch (error) {
      console.log(error);
    }
  };

  return [storedValue, setValue];
}

interface RequirementFormProps {
  requierement?: IRequirement;
  onSubmit: (requirement: IRequirement) => void;
  onDelete?: (requirementId: string) => void;
}

const RequirementForm: FC<RequirementFormProps> = ({
  requierement,
  onSubmit,
}) => {
  const [reqTypeID, setReqTypeID] = useState<any>('');
  const [form] = ProForm.useForm();
  const [projectId, setSelectedProjectId] = useState<any>();
  const [partNumberId, setPartNumberId] = useState<any>();
  const [selectedTask, setSelectedTask] = useState<any | null>(null);
  const [WOID, setWOID] = useState<any>(null);
  const [persistForm, setPersistForm] = useState(false);
  const [persistedFormData, setPersistedFormData] = useLocalStorage<any>(
    'persistedRequirementFormData',
    {}
  );

  const { t } = useTranslation();

  useEffect(() => {
    if (requierement) {
      form.resetFields();
      form.setFieldsValue(requierement);
      setReqTypeID(requierement.reqTypesID);
      setSelectedProjectId(requierement.projectID?._id);
      setPartNumberId(requierement.partNumberID?._id);
      form.setFieldsValue({
        partNumberID: requierement.partNumberID?._id,
        type: requierement.partNumberID?.TYPE,
        group: requierement.partNumberID?.GROUP,
        nameOfMaterial: requierement.partNumberID?.DESCRIPTION,
        unit: requierement.partNumberID?.UNIT_OF_MEASURE,
        projectTaskID: requierement.projectTaskID?._id,
        projectID: requierement.projectID?._id,
        neededOnID: requierement?.neededOnID?._id,
        WOReferenceID: requierement.projectID?.WOReferenceID._id,
      });
    } else {
      form.resetFields();
      setSelectedProjectId(undefined);
      if (persistForm && Object.keys(persistedFormData).length > 0) {
        form.setFieldsValue(persistedFormData);
      }
    }
  }, [requierement, form, persistForm, persistedFormData]);

  const handleSubmit = async (values: any) => {
    const newRequirement: IRequirement = requierement
      ? { ...requierement, ...values }
      : { ...values };

    if (persistForm) {
      const dataToSave = {
        WOReferenceID: values.WOReferenceID,
        projectID: values.projectID,
        neededOnID: values.neededOnID,
        projectTaskID: values.projectTaskID,
        taskCassificationID: values.taskCassificationID,
      };
      setPersistedFormData(dataToSave);
    }

    onSubmit(newRequirement);
  };

  const SubmitButton = () => (
    <PermissionGuard requiredPermissions={[Permission.DELETE_REQUIREMENT]}>
      <Button type="primary" htmlType="submit">
        {requierement ? t('UPDATE') : t('CREATE')}
      </Button>
    </PermissionGuard>
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
  const {
    data: wp,
    isLoading: isLoadingWP,
    isFetching,
  } = useGetfilteredWOQuery({});
  const { data: partNumbers, isLoading, isError } = useGetPartNumbersQuery({});

  const { data: projects } = useGetProjectsQuery(
    {
      WOReferenceID: form.getFieldValue('WOReferenceID'),
    }
    // { skip: !requierement }
  );
  const [showSubmitButton, setShowSubmitButton] = useState(true);
  const requirementCodesValueEnum: Record<string, string> =
    reqCodes?.reduce((acc, reqCode) => {
      acc[reqCode.id] = reqCode.code;
      return acc;
    }, {}) || {};
  const wpValueEnum: Record<string, string> =
    wp?.reduce((acc, wp) => {
      if (wp._id && wp?.WOName) {
        acc[wp._id] = `№:${wp?.WONumber}/${String(wp?.WOName).toUpperCase()}`;
      }
      return acc;
    }, {} as Record<string, string>) || {};
  const neededCodesValueEnum: Record<string, string> =
    usersGroups?.reduce((acc, usersGroup) => {
      acc[usersGroup.id] = usersGroup.title;
      return acc;
    }, {}) || {};

  const partValueEnum: Record<string, any> =
    partNumbers?.reduce((acc, partNumber) => {
      acc[partNumber._id] = partNumber; // Store the entire partNumber object
      return acc;
    }, {}) || {};

  const projectTasksCodesValueEnum: Record<string, string> =
    projectTasks?.reduce((acc, projectTask) => {
      acc[projectTask.id] =
        projectTask?.taskWO ||
        projectTask?.taskWo ||
        projectTask?.projectTaskWO;
      return acc;
    }, {}) || {};

  const projectsValueEnum: Record<string, string> = (projects ?? []).reduce<
    Record<string, string>
  >((acc, project) => {
    acc[project._id] = `№:${project?.projectWO} / ${project.projectName}`;
    return acc;
  }, {});
  const requirementTypesValueEnum: Record<string, string> =
    reqTypes?.reduce((acc, reqType) => {
      acc[reqType.id] = reqType.code;
      return acc;
    }, {}) || {};
  return (
    <ProForm
      disabled={
        requierement?.status == 'closed' || requierement?.status == 'canceled'
      }
      onReset={() => {
        form.resetFields();
        setSelectedProjectId(null);
      }}
      size="small"
      form={form}
      onFinish={handleSubmit}
      submitter={{
        render: (_, dom) => {
          return [<SubmitButton key="submit" />, dom.reverse()[1]];
        },
      }}
      initialValues={requierement}
      layout="horizontal"
    >
      <Tabs defaultActiveKey="1" type="card">
        <Tabs.TabPane tab={t('INFORMATION')} key="1">
          <div className=" h-[57vh] flex flex-col overflow-auto">
            <ProFormGroup>
              <ProFormSelect
                showSearch
                rules={[{ required: true }]}
                name="status"
                label={t('STATUS')}
                width="sm"
                initialValue={'draft'}
                options={
                  requierement
                    ? [
                        { value: 'draft', label: t('DRAFT'), disabled: true }, // Отключаем отдельные опции
                        { value: 'open', label: t('OPEN'), disabled: true },
                        { value: 'issued', label: t('ISSUED') },
                        {
                          value: 'complete',
                          label: t('COMPLETE'),
                          disabled: true,
                        },
                        { value: 'onQuatation', label: t('QUATATION') },
                        { value: 'onShort', label: t('ON SHORT') },
                        { value: 'closed', label: t('CLOSE'), disabled: true },
                        {
                          value: 'partlyCanceled',
                          label: t('PARTLY CANCELLED'),
                          disabled: true,
                        },
                        {
                          value: 'canceled',
                          label: t('CANCELED'),
                          disabled: true,
                        },
                        { value: 'tofix', label: t('ATTENTION') },
                      ]
                    : [
                        { value: 'draft', label: t('DRAFT') },
                        { value: 'open', label: t('OPEN') },
                      ]
                }
              />
              <Checkbox
                checked={persistForm}
                onChange={(e) => setPersistForm(e.target.checked)}
              >
                {t('SAVE FORM DATA FOR NEXT CREATION')}
              </Checkbox>

              {/* <ProFormSelect
                showSearch
                name="reqTypesID"
                label={t('REQUIREMENT TYPE')}
                width="sm"
                valueEnum={requirementTypesValueEnum}
                onChange={(value: any) => setReqTypeID(value)}
              />
              <ProFormSelect
                showSearch
                name="reqCodesID"
                label={t('REQUIREMENT CODE')}
                width="sm"
                valueEnum={requirementCodesValueEnum || []}
                disabled={!reqTypeID}
              /> */}
            </ProFormGroup>
            <ProFormGroup>
              <ProForm.Group direction="horizontal">
                <ProFormSelect
                  showSearch
                  rules={[{ required: true }]}
                  name="WOReferenceID"
                  label={t('WP No')}
                  width="lg"
                  valueEnum={wpValueEnum || []}
                  onChange={(value: any) => setWOID(value)}
                />
                <ProFormSelect
                  rules={[{ required: true }]}
                  name="projectID"
                  label={`${t(`WP`)}`}
                  width="lg"
                  valueEnum={projectsValueEnum}
                  disabled={!WOID}
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
                  disabled={!projectId}
                />
              </ProForm.Group>

              {
                <ProForm.Group>
                  {
                    <ProFormSelect
                      showSearch
                      disabled={!projectId}
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
                  {
                    <ProFormSelect
                      showSearch
                      disabled
                      mode="single"
                      name="taskCassificationID"
                      label={`${t(`TASK CLASSIFICATION`)}`}
                      width="sm"
                      valueEnum={[]}
                      onChange={(value: any) => {
                        // setSelectedTask(value);
                      }}
                    />
                  }
                </ProForm.Group>
              }
            </ProFormGroup>
            <ProFormGroup direction="horizontal">
              <ProFormGroup>
                <ProFormSelect
                  showSearch
                  rules={[{ required: true }]}
                  width={'sm'}
                  name="partNumberID"
                  label={`${t(`PART No`)}`}
                  // value={partNumber}
                  onChange={(value, data) => {
                    // console.log(data);
                    form.setFields([
                      { name: 'nameOfMaterial', value: data.data.DESCRIPTION },
                      { name: 'unit', value: data.data.UNIT_OF_MEASURE },
                      { name: 'type', value: data.data.TYPE },
                      { name: 'group', value: data.data.GROUP },
                    ]);
                  }}
                  options={Object.entries(partValueEnum).map(([key, part]) => ({
                    label: part.PART_NUMBER,
                    value: key,
                    data: part,
                  }))}
                />

                <ProFormText
                  disabled
                  rules={[{ required: true }]}
                  name="nameOfMaterial"
                  label={t('DESCRIPTION')}
                  width="md"
                  tooltip={t('DESCRIPTION')}
                ></ProFormText>
              </ProFormGroup>

              <ProFormGroup>
                <ProFormText
                  // disabled
                  // rules={[{ required: true }]}
                  name="serialNumber"
                  label={t('SERIAL NUMBER')}
                  width="sm"
                  tooltip={t('SERIAL NUMBER')}
                ></ProFormText>
                <ProFormDigit
                  name="amout"
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
                  // rules={[{ required: true }]}
                  name="group"
                  label={`${t('PART GROUP')}`}
                  width="sm"
                  tooltip={`${t('SELECT SPECIAL GROUP')}`}
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
                  // rules={[{ required: true }]}
                  name="type"
                  label={`${t('PART TYPE')}`}
                  width="sm"
                  tooltip={`${t('SELECT PART TYPE')}`}
                  options={[
                    { value: 'ROTABLE', label: t('ROTABLE') },
                    { value: 'CONSUMABLE', label: t('CONSUMABLE') },
                  ]}
                />
                <ProFormDatePicker
                  label={t('PLANNED START DATE')}
                  name="plannedDate"
                  width="sm"
                ></ProFormDatePicker>
              </ProFormGroup>
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
      </Tabs>
    </ProForm>
  );
};

export default RequirementForm;
