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
    <div className="flex flex-col w-full">
      <ProDescriptions
        column={5}
        size="middle"
        className="bg-white px-4 py-3 rounded-md align-middle w-full"
      >
        <ProDescriptions.Item label={`${t('REQUIREMENT No')}`} valueType="text">
          <Tag
            style={{
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            {requirement?.partRequestNumberNew}
          </Tag>
        </ProDescriptions.Item>
        <ProDescriptions.Item valueType="text" label={t('CREATE BY')}>
          <Tag
            style={{
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            {requirement?.createUserID?.name?.toUpperCase()}
          </Tag>
        </ProDescriptions.Item>
        <ProDescriptions.Item valueType="date" label={t('CREATE DATE')}>
          {requirement?.createDate}
        </ProDescriptions.Item>

        <ProDescriptions.Item valueType="text" label={t('LAST MODIFIED BY')}>
          <Tag
            style={{
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            {requirement?.updateUserID?.name?.toUpperCase()}
          </Tag>
        </ProDescriptions.Item>

        <ProDescriptions.Item valueType="date" label={t('MODIFICATION DATE')}>
          {requirement?.updateDate}
        </ProDescriptions.Item>
      </ProDescriptions>
    </div>
  );
};

export default RequirementsDiscription;
