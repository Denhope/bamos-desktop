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
import { IAccessCode, IZoneCodeGroup, IProjectTask } from '@/models/ITask';
import {
  ProDescriptions,
  ProFormDigit,
  ProFormGroup,
  ProFormList,
} from '@ant-design/pro-components';
import { useTranslation } from 'react-i18next';

import { useGetZonesByGroupQuery } from '@/features/zoneAdministration/zonesApi';
import { Button, Tag, Checkbox } from 'antd';
import { useGetProjectTasksQuery } from '@/features/projectTaskAdministration/projectsTaskApi';
import { useGetfilteredWOQuery } from '@/features/wpAdministration/wpApi';
import {
  useGetProjectGroupPanelsQuery,
  useGetProjectItemsWOQuery,
  useGetProjectPanelsQuery,
  useUpdateProjectPanelsMutation,
} from '@/features/projectItemWO/projectItemWOApi';
import { getStatusColor, getTaskTypeColor } from '@/services/utilites';

interface UserFormProps {
  accessCode?: IAccessCode | null;
  onSubmit: (accessCode: IAccessCode) => void;
  onDelete?: (accessCodeId: string) => void;
  projectTasks?: any[];
  accessesData?: any[];
}

const formatDate = (dateString: string | undefined): string => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return isNaN(date.getTime())
    ? ''
    : date.toLocaleDateString('ru-RU', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
      });
};

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
  const [saveValues, setSaveValues] = useState<boolean>(false);
  const [isAddAccess, setIsAddAccess] = useState<boolean>(false);

  // Инициализация состояния saveValues и загрузка сохранённых значений при монтировании
  useEffect(() => {
    const savedSaveValues = localStorage.getItem('saveValues');
    if (savedSaveValues !== null) {
      const parsedSaveValues = JSON.parse(savedSaveValues);
      setSaveValues(parsedSaveValues);
      if (parsedSaveValues) {
        const savedAccessCode = localStorage.getItem('savedAccessCode');
        if (savedAccessCode) {
          const parsedAccessCode = JSON.parse(savedAccessCode);
          form.setFieldsValue(parsedAccessCode);
          setWOID(parsedAccessCode.WOReferenceID);
        }
      }
    }
  }, [form]);

  // Сохранение состояния saveValues в localStorage при его изменении
  useEffect(() => {
    localStorage.setItem('saveValues', JSON.stringify(saveValues));
    if (!saveValues) {
      localStorage.removeItem('savedAccessCode');
    }
  }, [saveValues]);

  const handleSubmit = async (values: IAccessCode & { accesses: string[] }) => {
    const { accesses, ...restValues } = values;

    const newUser: IAccessCode = {
      ...restValues,
      accesses,
      ...(isAddAccess && { isAddAccess }),
    };

    console.log(newUser);

    if (saveValues) {
      // Сохранение значений в localStorage, исключая 'accesses'
      localStorage.setItem('savedAccessCode', JSON.stringify(restValues));
    } else {
      localStorage.removeItem('savedAccessCode');
    }

    onSubmit(newUser);
    setIsAddAccess(false);

    form.setFieldsValue({ accesses: [] }); // Очистка поля ACCESS после создания
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
    accessesData ?? [],
    filteredAcceses ?? []
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
        accesses: accessCode?.accesses ?? [],
      });

      setIsDisabled(true);
    } else {
      form.resetFields();
      setIsDisabled(!isDisabled);
      setSearchQuery('majoreZoneNbr');
      form.setFieldsValue({
        zoneType: 'majoreZoneNbr',
        accesses: [],
      });
    }

    if (!accessCode) {
      // Загрузка сохранённых значений при создании нового доступа
      const saved = localStorage.getItem('savedAccessCode');
      if (saved) {
        form.setFieldsValue(JSON.parse(saved));
        setWOID(JSON.parse(saved)?.WOReferenceID);
      }
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

  const handleAddAccess = () => {
    setIsAddAccess(true);
    // Дополнительная логика при необходимости
  };

  return (
    <ProForm
      onReset={() => {
        setWOID(null);
        localStorage.removeItem('savedAccessCode');
      }}
      size="small"
      form={form}
      onFinish={handleSubmit}
      submitter={{
        render: (_, dom) => (
          <div className="flex justify-end space-x-2 mt-4">
            {!accessCode && <SubmitButton key="submit" />}
            {!accessCode && dom.reverse()[1]}
          </div>
        ),
      }}
      initialValues={{
        ...accessCode,
        accesses: accessCode?.accesses ?? [],
      }}
      layout="vertical"
      className="p-4 bg-white rounded shadow-md"
    >
      <ProForm.Group>
        <div className="flex flex-wrap -mx-2">
          {!accessCode && (
            <>
              <div className="w-full px-2 mb-4">
                <Checkbox
                  checked={saveValues}
                  onChange={(e) => setSaveValues(e.target.checked)}
                  className="text-gray-700"
                >
                  {t('Save values for future creations')}
                </Checkbox>
              </div>
              <div className="w-full px-2 mb-4">
                <Checkbox
                  checked={isAddAccess}
                  onChange={(e) => setIsAddAccess(e.target.checked)}
                  className="text-gray-700"
                >
                  {t('ADD ACCESS')}
                </Checkbox>
              </div>
            </>
          )}

          <div className="w-full px-2 mb-4">
            {isDisabled && accessCode && (
              <div className="bg-gray-50 p-4 rounded">
                <ProDescriptions column={1} size="middle">
                  <ProDescriptions.Item valueType="text" label={t('ACCESS No')}>
                    {accessCode?.accessNbr && (
                      <Tag
                        color="geekblue"
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
                    {accessCode?.accessDescription}
                  </ProDescriptions.Item>
                  <ProDescriptions.Item
                    valueType="text"
                    label={t('MAJOR ZONE')}
                  >
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
                  <ProDescriptions.Item
                    valueType="text"
                    label={t('AREA NUMBER')}
                  >
                    {accessCode?.areaNbr}
                  </ProDescriptions.Item>
                  <ProDescriptions.Item
                    valueType="text"
                    label={t('AREA DESCRIPTION')}
                  >
                    {accessCode?.areaDescription}
                  </ProDescriptions.Item>
                  <ProDescriptions.Item
                    valueType="date"
                    label={t('CREATE DATE')}
                  >
                    {formatDate(accessCode?.createDate)}
                  </ProDescriptions.Item>
                  <ProDescriptions.Item valueType="text" label={t('STATUS')}>
                    <Tag color={getStatusColor(accessCode?.status)}>
                      {accessCode?.status}
                    </Tag>
                  </ProDescriptions.Item>
                </ProDescriptions>
              </div>
            )}
          </div>

          {!accessCode && (
            <>
              <div className="w-full md:w-1/2 px-2 mb-4">
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
                  valueEnum={wpValueEnum || {}}
                  onChange={(value: any) => setWOID(value)}
                  className="bg-white"
                />
              </div>

              <div className="w-full md:w-1/2 px-2 mb-4">
                <ProFormSelect
                  showSearch
                  name="accesses"
                  label={t('ACCESS')}
                  width="lg"
                  mode="multiple"
                  options={filteredAccessesData.map((access) => ({
                    label: `${access.accessNbr}-${access.accessDescription}`,
                    value: access.id,
                  }))}
                  rules={[
                    {
                      required: true,
                    },
                  ]}
                  onChange={(values: string[]) => {
                    console.log(values);
                  }}
                  className="bg-white"
                />
              </div>
            </>
          )}

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
                className="bg-white"
                fieldProps={{
                  optionLabelProp: 'label',
                  optionItemRender: (opt: { label: string; value: string }) => (
                    <span>{opt.label}</span>
                  ),
                }}
              />
            )}
          </ProFormGroup>
        </div>
      </ProForm.Group>

      {/* Отображение списка задач */}
      <ProForm.Item label={t('TASK LIST')} className="mt-6">
        <div className="bg-gray-50 p-4 rounded overflow-auto">
          <ProDescriptions column={1} size="middle">
            {accessCode?.projectTaskIds &&
              accessCode?.projectTaskIds?.map((task: IProjectTask) => (
                <ProDescriptions.Item
                  key={task._id}
                  label={`${task.taskNumber}(TRACE:${task.taskWO})`}
                  className="text-gray-700"
                >
                  {/* {task.taskDescription} */}
                  <ProDescriptions.Item valueType="text" label={t('PRIORITY')}>
                    <Tag color={getTaskTypeColor(task.taskDescription)}>
                      {task.taskDescription}
                    </Tag>
                  </ProDescriptions.Item>
                </ProDescriptions.Item>
              ))}
          </ProDescriptions>
        </div>
      </ProForm.Item>
    </ProForm>
  );
};

export default AccessCodeForm;
