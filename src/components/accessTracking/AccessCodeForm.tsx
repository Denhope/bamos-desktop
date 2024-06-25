// ts-nocheck

// The rest of your code here will not be type-checked by TypeScript
import React, { FC, useEffect, useState } from 'react';
import {
  ProForm,
  ProFormText,
  ProFormRadio,
  ProFormTextArea,
} from '@ant-design/pro-form';
import { IAccessCode, IZoneCodeGroup } from '@/models/ITask';
import {
  ProFormDigit,
  ProFormGroup,
  ProFormSelect,
} from '@ant-design/pro-components';
import { useTranslation } from 'react-i18next';
import { useGetZonesByGroupQuery } from '@/features/zoneAdministration/zonesApi';
import { Button } from 'antd';
import { useGetProjectTasksQuery } from '@/features/projectTaskAdministration/projectsTaskApi';

interface UserFormProps {
  accessCode?: IAccessCode;
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
  const [areaID, setAreaID] = useState<any>('');
  const handleSubmit = async (values: IAccessCode) => {
    const newUser: IAccessCode = accessCode
      ? { ...accessCode, ...values }
      : { ...values };
    onSubmit(newUser);
  };

  const [searchQuery, setSearchQuery] = useState('');
  const [isDisabled, setIsDisabled] = useState(false);
  // const accessValueEnum: Record<string, string> =
  //   accessesData?.reduce((acc, access) => {
  //     acc[access.id] = `${String(access.accessNbr)}-${String(
  //       access.accessDescription
  //     )}`;
  //     return acc;
  //   }, {}) || {};

  const accessValueEnum: Record<string, any> =
    accessesData?.reduce((acc, access) => {
      acc[access.id] = {
        text: `${String(access.accessNbr)}-${String(access.accessDescription)}`,
        value: access,
      };
      return acc;
    }, {}) || {};

  const projectTasksCodesValueEnum: Record<string, string> =
    projectTasks?.reduce<Record<string, string>>((acc, projectTask) => {
      acc[projectTask.id] =
        projectTask.taskWO ||
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
        // accessID: accessCode?._id,

        // zoneType: initialZoneType,
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
          {isDisabled && (
            <>
              <ProFormSelect
                // options={majoreZoneOptions}
                disabled
                width={'sm'}
                name="majoreZoneNbr"
                label={t('MAJORE ZONE')}
              />
              <ProFormSelect
                // options={majoreZoneDescriptionOptions}
                disabled
                width={'sm'}
                name="majoreZoneDescription"
                label={t('MAJORE ZONE DESCRIPTION')}
              />
              <ProFormSelect
                disabled
                // options={subZoneNbrOptions}
                width={'sm'}
                name="subZoneNbr"
                label={t('SUBZONE NUMBER')}
              />
              <ProFormSelect
                disabled
                // options={subZoneDescriptionOptions}
                width={'sm'}
                name="subZoneDescription"
                label={t('SUBZONE DESCRIPTION')}
              />
              <ProFormText
                disabled
                width={'sm'}
                name="areaNbr"
                label={t('AREA NUMBER')}
                rules={[
                  {
                    required: true,
                  },
                ]}
              />
              <ProFormText
                disabled
                width={'lg'}
                name="areaDescription"
                label={t('AREA DESCRIPTION')}
                rules={[
                  {
                    required: true,
                  },
                ]}
              />
            </>
          )}

          <>
            {/* <ProFormSelect
              disabled={isDisabled}
              // valueEnum={zonesValueEnum}
              width={'lg'}
              name="areaCodeID"
              label={t('AREA NUMBER')}
              onChange={(value: any, option: any) => {
                // console.log(option);
                // form.setFieldsValue({
                //   areaDescription: option?.areaDescription,
                // });
                setAreaID(value);
              }}
            /> */}

            {isDisabled && (
              <ProFormSelect
                disabled={isDisabled}
                width={'sm'}
                name="accessNbr"
                label={t('ACCESS NUMBER')}
                rules={[
                  {
                    required: true,
                  },
                ]}
              />
            )}

            {!isDisabled && (
              <ProFormSelect
                showSearch
                name="accessID"
                label={t('ACCESS NUMBER')}
                width="lg"
                valueEnum={accessValueEnum}
                disabled={isDisabled}
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
                    // accessID: accessCode?._id,

                    // zoneType: initialZoneType,
                  });
                }}
              />
            )}

            {isDisabled && (
              <ProFormText
                disabled
                width={'lg'}
                name="accessDescription"
                label={t('ACCESS DESCRIPTION')}
                rules={[
                  {
                    required: true,
                  },
                ]}
              />
            )}
            {/* <ProFormGroup>
              <ProFormDigit
                width={'xs'}
                name="closingTime"
                label={t('TIME TO CLOSE (MPD)')}
              />
              <ProFormDigit
                width={'xs'}
                name="openingTime"
                label={t('TIME TO OPEN (MPD)')}
              />
              <ProFormDigit
                width={'xs'}
                name="takeOfOnTime"
                label={t('TIME OPEN/CLOSE (MPD)')}
              />
            </ProFormGroup> */}
          </>
        </>
        <ProFormGroup>
          {{ isDisabled } && (
            <ProFormSelect
              showSearch
              // rules={[{ required: true }]}
              disabled={isDisabled}
              mode="single"
              name="projectTaskID"
              label={`${t(`TASK`)}`}
              width="sm"
              valueEnum={projectTasksCodesValueEnum}
              // onChange={(value: any) => {
              //   setSelectedTask(value);
              // }}
            />
          )}
          {isDisabled && (
            <ProFormSelect
              showSearch
              disabled
              name="status"
              label={t('STATE')}
              width="sm"
              valueEnum={{
                open: { text: t('OPEN') },
                closed: { text: t('CLOSED') },
                inspected: { text: t('INSPECTED') },
              }}
            />
          )}
        </ProFormGroup>
      </ProForm.Group>

      {/* <ProForm.Item>
        <Button type="primary" htmlType="submit">
          {accessCode ? 'Update' : 'Create'}
        </Button>
      </ProForm.Item> */}
    </ProForm>
  );
};

export default AccessCodeForm;
