import PermissionGuard, { Permission } from '@/components/auth/PermissionGuard';
import { useGetPartNumbersQuery } from '@/features/partAdministration/partApi';
import { IAltPartNumber, IPartNumber } from '@/models/IUser';
import {
  ProForm,
  ProFormCheckbox,
  ProFormSelect,
  ProFormText,
  ProFormTextArea,
} from '@ant-design/pro-components';
import { Button } from 'antd';
import React, { FC, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

interface AltFormProps {
  altPart?: IAltPartNumber | null;
  currentPart: IPartNumber | null;
  onSubmit: (company: any) => void;
  onDelete?: (orderID: string) => void;
}

const AltForm: FC<AltFormProps> = ({ onSubmit, altPart, currentPart }) => {
  const [form1] = ProForm.useForm();
  const [groupTwoWays, setGroupTwoWays] = useState<boolean>(false);
  const { t } = useTranslation();
  const [selectedAltPN, setSelectedAltPN] = useState<string | null>(null);

  const handleSubmit = async (values: any) => {
    const newUser: any = altPart
      ? {
          ...altPart,
          ISTWOWAYS: groupTwoWays,
          ALTERNATIVE_REMARKS: values?.ALTERNATIVE_REMARKS,
        }
      : {
          ...values,
          partNumberID: currentPart?.id || currentPart?._id,
          ALTERNATIVE: selectedAltPN,
          PART_NUMBER: currentPart?.PART_NUMBER,
          ISTWOWAYS: groupTwoWays,
          companyID: localStorage.getItem('companyID') || '',
        };

    onSubmit(newUser);
  };
  useEffect(() => {
    if (currentPart) {
      // Сброс полей формы и установка значений
      form1.resetFields();
      setSelectedAltPN(null);
      setGroupTwoWays(false);
    }
  }, [currentPart, form1]);
  useEffect(() => {
    if (altPart) {
      form1.resetFields();
      form1.setFieldsValue({
        ...altPart,
        altPartNumberID: altPart?.altPartNumberID?.PART_NUMBER,
        box: altPart?.ISTWOWAY ? ['group'] : [],
      });
      setSelectedAltPN(altPart?.altPartNumberID?.PART_NUMBER);
      setGroupTwoWays(altPart?.ISTWOWAY ?? false);
    } else {
      form1.resetFields();
      setSelectedAltPN(null);
      setGroupTwoWays(false);
    }
  }, [altPart, form1]);

  const { data: partNumbers, isLoading, isError } = useGetPartNumbersQuery({});

  if (isError) {
    console.error('Error fetching part numbers');
  }

  if (isLoading) {
    console.log('Loading part numbers...');
  }

  const partValueEnum: Record<string, any> =
    partNumbers?.reduce((acc, partNumber) => {
      if (partNumber._id) {
        acc[partNumber._id] = partNumber;
      }
      return acc;
    }, {} as Record<string, any>) || {};

  return (
    <PermissionGuard
      requiredPermissions={[
        Permission.PART_NUMBER_EDIT,
        Permission.DELETE_ALTERNATIVE,
      ]}
    >
      <ProForm layout="horizontal" form={form1} onFinish={handleSubmit}>
        <ProFormSelect
          disabled={!!altPart?._id}
          showSearch
          rules={[{ required: true }]}
          width="lg"
          name="altPartNumberID"
          label={t('PART No')}
          onChange={(value, data: any) => {
            form1.setFields([
              { name: 'ALTERNATIVE_DESCRIPTION', value: data.data.DESCRIPTION },
              { name: 'unit', value: data.data.UNIT_OF_MEASURE },
              { name: 'ADD_DESCRIPTION', value: data.data.ADD_DESCRIPTION },
              { name: 'TYPE', value: data.data.TYPE },
              { name: 'GROUP', value: data.data.GROUP },
            ]);
            setSelectedAltPN(data.data.PART_NUMBER);
          }}
          options={Object.entries(partValueEnum).map(([key, part]) => ({
            label: part.PART_NUMBER,
            value: key,
            data: part,
          }))}
        />
        <ProFormText
          fieldProps={{ style: { resize: 'none' } }}
          disabled
          name="ALTERNATIVE_DESCRIPTION"
          label={t('DESCRIPTION')}
          width="lg"
        />

        <ProFormSelect
          disabled
          name="GROUP"
          label={t('PART GROUP')}
          width="lg"
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
          name="TYPE"
          label={t('PART TYPE')}
          width="lg"
          options={[
            { value: 'ROTABLE', label: t('ROTABLE') },
            { value: 'CONSUMABLE', label: t('CONSUMABLE') },
          ]}
        />
        <ProFormCheckbox.Group
          disabled={!!altPart?._id}
          labelAlign="left"
          name="box"
          fieldProps={{
            onChange: (value) => {
              setGroupTwoWays(value.includes('group'));
            },
          }}
          options={[
            { label: t('TWO WAYS INTERCHANGEBILITY'), value: 'group' },
          ].map((option) => ({
            ...option,
            style: { display: 'flex', flexWrap: 'wrap' },
          }))}
        />
        <ProFormTextArea
          fieldProps={{ style: { resize: 'none' } }}
          colSize={2}
          label={t('REMARKS')}
          name="ALTERNATIVE_REMARKS"
          width="lg"
        />
      </ProForm>
    </PermissionGuard>
  );
};

export default AltForm;
