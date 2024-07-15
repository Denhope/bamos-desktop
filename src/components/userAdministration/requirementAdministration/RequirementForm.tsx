//@ts-nocheck

import React, { FC, useEffect, useRef, useState } from 'react';
import { useGetGroupUsersQuery } from '@/features/userAdministration/userApi';
import {
  ProForm,
  ProFormText,
  ProFormGroup,
  ProFormSelect,
} from '@ant-design/pro-form';
import { Button, Tabs } from 'antd';
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

import { useGetProjectTasksQuery } from '@/features/projectTaskAdministration/projectsTaskApi';
import { useGetProjectItemsWOQuery } from '@/features/projectItemWO/projectItemWOApi';

interface UserFormProps {
  requierement?: IRequirement;
  onSubmit: (company: IRequirement) => void;
  onDelete?: (companyId: string) => void;
}

const RequirementForm: FC<UserFormProps> = ({ requierement, onSubmit }) => {
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
        type: requierement.partNumberID?.TYPE,
        group: requierement.partNumberID?.GROUP,
        nameOfMaterial: requierement.partNumberID?.DESCRIPTION,
        unit: requierement.partNumberID?.UNIT_OF_MEASURE,
        projectTaskID: requierement.projectTaskID?._id,
        projectID: requierement.projectID?._id,
        neededOnID: requierement?.neededOnID?._id,
      });
    } else {
      form.resetFields();
      setSelectedProjectId(undefined);
    }
  }, [requierement, form]);

  const { t } = useTranslation();

  const handleSubmit = async (values: any) => {
    const newUser: IRequirement = requierement
      ? { ...requierement, ...values }
      : { ...values };

    onSubmit(newUser);
  };

  const SubmitButton = () => (
    <Button type="primary" htmlType="submit">
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

  const { data: partNumbers, isLoading, isError } = useGetPartNumbersQuery({});

  const { data: projects } = useGetProjectsQuery({});
  const [showSubmitButton, setShowSubmitButton] = useState(true);
  const requirementCodesValueEnum: Record<string, string> =
    reqCodes?.reduce((acc, reqCode) => {
      acc[reqCode.id] = reqCode.code;
      return acc;
    }, {}) || {};

  const neededCodesValueEnum: Record<string, string> =
    usersGroups?.reduce((acc, usersGroup) => {
      acc[usersGroup.id] = usersGroup.title;
      return acc;
    }, {}) || {};
  // const partValueEnum: Record<string, string> =
  //   partNumbers?.reduce((acc, partNumber) => {
  //     acc[partNumber._id] = partNumber.PART_NUMBER;
  //     return acc;
  //   }, {}) || {};

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
      <Tabs defaultActiveKey="1" type="card">
        <Tabs.TabPane tab={t('MAIN')} key="1">
          <div className=" h-[57vh] flex flex-col overflow-auto">
            <ProFormGroup>
              <ProFormSelect
                showSearch
                rules={[{ required: true }]}
                name="status"
                label={t('REQUIREMENT STATE')}
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
              />
            </ProFormGroup>
            <ProFormGroup>
              <ProForm.Group direction="horizontal">
                <ProFormSelect
                  rules={[{ required: true }]}
                  // mode="multiple"
                  name="projectID"
                  label={`${t(`WP`)}`}
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
                  disabled={!projectId}
                />
              </ProForm.Group>

              {
                <ProForm.Group>
                  {
                    <ProFormSelect
                      showSearch
                      // rules={[{ required: true }]}
                      disabled={!projectId}
                      mode="single"
                      name="projectTaskID"
                      label={`${t(`TASK`)}`}
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
