// @ts-nocheck

import React, { FC, useEffect, useRef, useState } from 'react';
import {
  ProForm,
  ProFormText,
  ProFormGroup,
  ProFormSelect,
} from '@ant-design/pro-form';
import { Button, Tabs } from 'antd';
import { useTranslation } from 'react-i18next';
import { Requirement } from '@/models/IRequirement';
import {
  ProFormDatePicker,
  ProFormDigit,
  ProFormTextArea,
} from '@ant-design/pro-components';
import ContextMenuPNSearchSelect from '@/components/shared/form/ContextMenuPNSearchSelect';
import { useGetREQTypesQuery } from '@/features/requirementsTypeAdministration/requirementsTypeApi';
import { useGetREQCodesQuery } from '@/features/requirementsCodeAdministration/requirementsCodesApi';
import { useGetProjectsQuery } from '@/features/projectAdministration/projectsApi';

import { useGetProjectTasksQuery } from '@/features/projectTaskAdministration/projectsTaskApi';

interface UserFormProps {
  requierement?: Requirement;
  onSubmit: (company: Requirement) => void;
  onDelete?: (companyId: string) => void;
}

const RequirementForm: FC<UserFormProps> = ({ requierement, onSubmit }) => {
  const [initialFormPN, setinitialFormPN] = useState<any>('');
  const [reqTypeID, setReqTypeID] = useState<any>('');
  const [form] = ProForm.useForm();
  const [projectId, setSelectedProjectId] = useState<any>(
    requierement?.projectID || ''
  );

  const [selectedTask, setSelectedTask] = useState<any | null>(null);

  useEffect(() => {
    if (requierement) {
      form.resetFields();
      form.setFieldsValue(requierement);
      setinitialFormPN(requierement.PN);
      setReqTypeID(requierement._id);
      setSelectedProjectId(requierement.projectID);
    } else {
      form.resetFields();
      setSelectedProjectId(undefined);
      setinitialFormPN('');
    }
  }, [requierement, form]);

  const { t } = useTranslation();

  const handleSubmit = async (values: any) => {
    const newUser: Requirement = requierement
      ? { ...requierement, ...values }
      : { ...values };

    onSubmit(newUser);
  };

  const SubmitButton = () => (
    <Button type="primary" htmlType="submit">
      {requierement ? t('UPDATE') : t('CREATE')}
    </Button>
  );
  const { data: reqTypes } = useGetREQTypesQuery({});

  const { data: reqCodes } = useGetREQCodesQuery({
    reqTypeID,
  });
  const { data: projectTasks } = useGetProjectTasksQuery(
    { projectId },
    { skip: !projectId }
  );

  const { data: projects } = useGetProjectsQuery({});
  const [showSubmitButton, setShowSubmitButton] = useState(true);
  const requirementCodesValueEnum: Record<string, string> =
    reqCodes?.reduce((acc, reqCode) => {
      acc[reqCode.id] = reqCode.code;
      return acc;
    }, {}) || {};

  const projectTasksCodesValueEnum: Record<string, string> =
    projectTasks?.reduce((acc, projectTask) => {
      acc[projectTask.id] = projectTask?.projectId;
      return acc;
    }, {}) || {};

  const projectsValueEnum: Record<string, string> =
    projects?.reduce((acc, project) => {
      acc[project._id] = `${project.projectWO}- ${project.projectName}`;
      return acc;
    }, {}) || {};
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
        <Tabs.TabPane tab="MAIN" key="1">
          <ProFormGroup>
            <ProFormSelect
              showSearch
              rules={[{ required: true }]}
              name="status"
              label={t('REQUIREMENT STATE')}
              width="xs"
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
            <ProFormSelect
              showSearch
              name="requierementType"
              label={t('REQUIREMENT  TYPE')}
              width="sm"
              valueEnum={requirementTypesValueEnum}
              onChange={(value: any) => setReqTypeID(value)}
            />
            <ProFormSelect
              showSearch
              name="requierementCode"
              label={t('REQUIREMENT  CODE')}
              width="sm"
              valueEnum={requirementCodesValueEnum || []}
              disabled={!reqTypeID}
            />
          </ProFormGroup>

          <ProFormGroup>
            <ProForm.Group direction="horizontal">
              <ProFormSelect
                // mode="multiple"
                name="projectID"
                label={`${t(`PROJECT`)}`}
                width="lg"
                valueEnum={projectsValueEnum}
                onChange={async (value: any) => {
                  setSelectedProjectId(value);
                }}
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
                    label={`${t(`TASK`)}`}
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

          <ProFormGroup direction="horizontal">
            <ProFormGroup>
              <ContextMenuPNSearchSelect
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

                  form.setFields([{ name: 'group', value: PN.GROUP }]);
                  form.setFields([{ name: 'type', value: PN.TYPE }]);
                }}
                name={'partNumber'}
                initialFormPN={initialFormPN || ''}
                width={'lg'}
                label={`${t('PART No')}`}
              ></ContextMenuPNSearchSelect>
              <ProFormText
                disabled
                rules={[{ required: true }]}
                name="nameOfMaterial"
                label={t('DESCRIPTION')}
                width="sm"
                tooltip={t('DESCRIPTION')}
              ></ProFormText>
            </ProFormGroup>
            <ProFormGroup>
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
                rules={[{ required: true }]}
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
                rules={[{ required: true }]}
                name="type"
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
              name="plannedDate"
              width="sm"
            ></ProFormDatePicker>
          </ProFormGroup>
          <ProFormTextArea
            fieldProps={{
              style: { resize: 'none' },
              rows: 3,
            }}
            name="remarks"
            colSize={1}
            label={t('REMARKS')}
            width="xl"
          ></ProFormTextArea>
        </Tabs.TabPane>
      </Tabs>
    </ProForm>
  );
};
export default RequirementForm;
