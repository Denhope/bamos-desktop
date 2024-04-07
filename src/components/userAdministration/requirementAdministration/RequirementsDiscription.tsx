import { useAppDispatch } from '@/hooks/useTypedSelector';
import { getFilteredRequirementsManager } from '@/utils/api/thunks';
import {
  ModalForm,
  ProDescriptions,
  ProForm,
  ProFormDatePicker,
  ProFormGroup,
  ProFormText,
} from '@ant-design/pro-components';
import { Button, Divider, Form, FormInstance, Tag, message } from 'antd';
import React, { FC, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';

type RequirementsDiscriptionType = {
  requirement: any | null;
  onRequirementSearch?: (orders: any | null) => void;
};

const RequirementsDiscription: FC<RequirementsDiscriptionType> = ({
  requirement,
  onRequirementSearch,
}) => {
  const { t } = useTranslation();

  const formRef = useRef<FormInstance>(null);

  return (
    <div className="flex flex-col ">
      <ProDescriptions
        column={5}
        size="middle"
        // layout="horizontal"
        className="bg-white px-4 py-3 rounded-md  align-middle"
      >
        <ProDescriptions.Item label={`${t('REQUIREMENT No')}`} valueType="text">
          <Tag>{requirement?.partRequestNumberNew}</Tag>
        </ProDescriptions.Item>
        <ProDescriptions.Item valueType="text" label={t('CREATE BY')}>
          <Tag>{requirement?.createUserID?.name?.toUpperCase()}</Tag>
        </ProDescriptions.Item>
        <ProDescriptions.Item valueType="date" label={t('CREATE DATE')}>
          {requirement?.createDate}
        </ProDescriptions.Item>

        <ProDescriptions.Item valueType="text" label={t('LAST MODIFIED BY')}>
          <Tag>{requirement?.updateUserID?.name?.toUpperCase()}</Tag>
        </ProDescriptions.Item>

        <ProDescriptions.Item valueType="date" label={t('MODIFICATION DATE')}>
          {requirement?.updateDate}
        </ProDescriptions.Item>
      </ProDescriptions>
    </div>
  );
};

export default RequirementsDiscription;
