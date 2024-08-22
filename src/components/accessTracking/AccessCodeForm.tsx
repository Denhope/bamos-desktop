// @ts-nocheck

// The rest of your code here will not be type-checked by TypeScript
import React, { FC, useEffect, useState } from 'react';
import {
  ProForm,
  ProFormText,
  ProFormRadio,
  ProFormTextArea,
  ProFormSelect,
} from '@ant-design/pro-form';
import { IAccessCode, IZoneCodeGroup } from '@/models/ITask';
import {
  ProDescriptions,
  ProFormDigit,
  ProFormGroup,
} from '@ant-design/pro-components';
import { useTranslation } from 'react-i18next';

import { useGetZonesByGroupQuery } from '@/features/zoneAdministration/zonesApi';
import { Button, Tag } from 'antd';
import { useGetProjectTasksQuery } from '@/features/projectTaskAdministration/projectsTaskApi';
import { useGetfilteredWOQuery } from '@/features/wpAdministration/wpApi';
import {
  useGetProjectGroupPanelsQuery,
  useGetProjectItemsWOQuery,
  useGetProjectPanelsQuery,
  useUpdateProjectPanelsMutation,
} from '@/features/projectItemWO/projectItemWOApi';
interface UserFormProps {
  accessCode?: IAccessCode | null;
  onSubmit: (accessCode: IAccessCode) => void;
  onDelete?: (accessCodeId: string) => void;
  projectTasks?: any[];
  accessesData?: any[];
}

const AccessCodeForm: FC<UserFormProps> = ({
  accessCode,
  onSubmit,
  projectTasks,
  accessesData,
}) => {
  const [form] = ProForm.useForm();
  const { t } = useTranslation();
  const [WOID, setWOID] = useState<any>(null);
  const [areaID, setAreaID] = useState<any>('');
  const handleSubmit = async (values: IAccessCode) => {
    const newUser: IAccessCode = accessCode
      ? { ...accessCode, ...values }
      : { ...values };
    onSubmit(newUser);
  };

  const { data: filteredAcceses } = useGetProjectPanelsQuery(
    {
      WOReferenceID: form.getFieldValue('WOReferenceID'),
    },
    { skip: !WOID }
  );
  const {
    data: wp,
    isLoading: isLoadingWP,
    isFetching,
  } = useGetfilteredWOQuery({});
  const { data: projectTasksItems } = useGetProjectItemsWOQuery(
    { WOReferenceID: form.getFieldValue('WOReferenceID') },
    { skip: !WOID }
  );
  const [searchQuery, setSearchQuery] = useState('');
  const [isDisabled, setIsDisabled] = useState(false);

  // Функция для фильтрации accessesData
  const filterAccessesData = (accessesData: any[], filteredAcceses: any[]) => {
    const filteredAccesesIds = new Set(
      filteredAcceses?.map((item) => item.accessItemID?._id) || []
    );
    return accessesData?.filter((access) => !filteredAccesesIds.has(access.id));
  };

  const filteredAccessesData = filterAccessesData(
    accessesData,
    filteredAcceses
  );

  const accessValueEnum: Record<string, any> =
    filteredAccessesData?.reduce((acc, access) => {
      acc[access.id] = {
        text: `${String(access.accessNbr)}-${String(access.accessDescription)}`,
        value: access,
      };
      return acc;
    }, {}) || {};

  const wpValueEnum: Record<string, string> =
    wp?.reduce((acc, wp) => {
      if (wp._id && wp?.WOName) {
        acc[wp._id] = `№:${wp?.WONumber}/${String(wp?.WOName).toUpperCase()}`;
      }
      return acc;
    }, {} as Record<string, string>) || {};
  const projectTasksCodesValueEnum: Record<string, string> =
    projectTasksItems?.reduce<Record<string, string>>((acc, projectTask) => {
      acc[projectTask.id] =
        projectTask.taskNumber ||
        projectTask.taskWo ||
        projectTask.projectTaskWO ||
        '';
      return acc;
    }, {}) || {};
  useEffect(() => {
    if (accessCode) {
      form.resetFields();
      form.setFieldsValue({
        ...accessCode,
        majoreZoneDescription: accessCode?.areaCode?.majoreZoneDescription,
        majoreZoneNbr: accessCode?.areaCode?.majoreZoneNbr,
        subZoneNbr: accessCode?.areaCode?.subZoneNbr,
        subZoneDescription: accessCode?.areaCode?.subZoneDescription,
        areaNbr: accessCode?.areaCode?.areaNbr,
        areaDescription: accessCode?.areaCode?.areaDescription,
      });

      setIsDisabled(true);
    } else {
      form.resetFields();
      setIsDisabled(!isDisabled);
      setSearchQuery('majoreZoneNbr');
      form.setFieldsValue({
        zoneType: 'majoreZoneNbr',
      });
    }
  }, [form, accessCode]);
  const { data: zones, isLoading: loading } = useGetZonesByGroupQuery(
    { acTypeId: (accessCode && accessCode?.acTypeId) || '' },
    { skip: !(accessCode && accessCode?.acTypeId) }
  );
  const SubmitButton = () => (
    <Button type="primary" htmlType="submit">
      {accessCode ? t('UPDATE') : t('CREATE')}
    </Button>
  );
  return (
    <ProForm
      onReset={() => {
        setWOID(null);
      }}
      size="small"
      form={form}
      onFinish={handleSubmit}
      submitter={{
        render: (_, dom) => {
          if (!accessCode) {
            return [<SubmitButton key="submit" />, dom.reverse()[1]];
          }
          return null;
        },
      }}
      initialValues={accessCode}
      layout="horizontal"
    >
      <ProForm.Group>
        <>
          {isDisabled && accessCode && (
            <ProDescriptions column={1} size="middle">
              <ProDescriptions.Item valueType="text" label={t('ACCESS No')}>
                {accessCode?.accessNbr && (
                  <Tag
                    style={{
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {accessCode?.accessNbr}
                  </Tag>
                )}
              </ProDescriptions.Item>
              <ProDescriptions.Item
                valueType="text"
                label={t('ACCESS DESCRIPTION')}
              >
                {accessCode?.accessDescription && (
                  <Tag
                    style={{
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {accessCode?.accessDescription}
                  </Tag>
                )}
              </ProDescriptions.Item>
              <ProDescriptions.Item valueType="text" label={t('MAJOR ZONE')}>
                {accessCode?.majoreZoneNbr}
              </ProDescriptions.Item>
              <ProDescriptions.Item
                valueType="text"
                label={t('MAJOR ZONE DESCRIPTION')}
              >
                {accessCode?.majoreZoneDescription}
              </ProDescriptions.Item>
              <ProDescriptions.Item
                valueType="text"
                label={t('SUBZONE NUMBER')}
              >
                {accessCode?.subZoneNbr}
              </ProDescriptions.Item>
              <ProDescriptions.Item
                valueType="text"
                label={t('SUBZONE DESCRIPTION')}
              >
                {accessCode?.subZoneDescription}
              </ProDescriptions.Item>
              <ProDescriptions.Item valueType="text" label={t('AREA NUMBER')}>
                {accessCode?.areaNbr}
              </ProDescriptions.Item>
              <ProDescriptions.Item
                valueType="text"
                label={t('AREA DESCRIPTION')}
              >
                {accessCode?.areaDescription}
              </ProDescriptions.Item>
            </ProDescriptions>
          )}

          <>
            {!accessCode && (
              <>
                <ProFormSelect
                  showSearch
                  name="WOReferenceID"
                  label={t('WP No')}
                  width="lg"
                  rules={[
                    {
                      required: true,
                    },
                  ]}
                  valueEnum={wpValueEnum || []}
                  onChange={(value: any) => setWOID(value)}
                />

                <ProFormSelect
                  showSearch
                  name="accessID"
                  label={t('ACCESS')}
                  width="lg"
                  valueEnum={accessValueEnum}
                  rules={[
                    {
                      required: true,
                    },
                  ]}
                  value={form.getFieldValue('accessID')}
                  onChange={(value: any) => {
                    console.log(value);
                    form.setFieldsValue({
                      majoreZoneDescription:
                        accessCode?.areaCode?.majoreZoneDescription,
                      majoreZoneNbr: accessCode?.areaCode?.majoreZoneNbr,
                      subZoneNbr: accessCode?.areaCode?.subZoneNbr,
                      subZoneDescription:
                        accessCode?.areaCode?.subZoneDescription,
                      areaNbr: accessCode?.areaCode?.areaNbr,
                      areaDescription: accessCode?.areaCode?.areaDescription,
                    });
                  }}
                />
              </>
            )}
          </>
        </>
        <ProFormGroup>
          {!accessCode && (
            <ProFormSelect
              showSearch
              rules={[
                {
                  required: true,
                },
              ]}
              disabled={!WOID}
              mode="single"
              name="projectTaskID"
              label={`${t(`TASK No`)}`}
              width="lg"
              valueEnum={projectTasksCodesValueEnum}
            />
          )}
        </ProFormGroup>
      </ProForm.Group>

      {/* Отображение списка задач */}
      <ProForm.Item label={t('TASK LIST')}>
        <ProDescriptions column={1} size="middle">
          {accessCode?.projectTaskIds &&
            accessCode?.projectTaskIds?.map((task) => (
              <ProDescriptions.Item
                key={task?._id}
                label={`${task?.taskNumber}(TRACE:${task?.taskWO})`}
              >
                {task.taskDescription}
              </ProDescriptions.Item>
            ))}
        </ProDescriptions>
      </ProForm.Item>
    </ProForm>
  );
};

export default AccessCodeForm;
