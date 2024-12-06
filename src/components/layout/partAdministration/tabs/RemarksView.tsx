import {
  ProForm,
  ProFormGroup,
  ProFormTextArea,
} from '@ant-design/pro-components';
import { Button, Form, Space, message } from 'antd';
import tabs from 'antd/es/tabs';
import TabContent from '@/components/shared/Table/TabContent';
import React, { FC, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { SettingOutlined, EditOutlined, SaveOutlined } from '@ant-design/icons';
import { createBookingItem, updatePartByID } from '@/utils/api/thunks';
import { useAppDispatch } from '@/hooks/useTypedSelector';
import { USER_ID } from '@/utils/api/http';
type PartRemarksType = {
  part: any;
  onEditPartDetailsEdit: (data: any) => void;
};
const RemarksView: FC<PartRemarksType> = ({ part, onEditPartDetailsEdit }) => {
  const { t } = useTranslation();
  const [form] = Form.useForm();
  const [isEditing, setIsEditing] = useState(false);

  const [isEditingView, setIsEditingView] = useState(false);
  const dispatch = useAppDispatch();
  useEffect(() => {
    // console.log(currentPart);

    if (part) {
      // onSelectSelectedStore && onSelectSelectedStore(selectedStore);
      form.setFields([
        { name: 'purshaseRemarks', value: part?.PART_PURCHASE_REMARKS },
        { name: 'repareRemarks', value: part?.PART_REPARE_REMARKS },
        { name: 'remarks', value: part?.PART_REMARKS },
        { name: 'pickslipRemarks', value: part?.PART_PICKSLIP_REMARKS },
        { name: 'receivingRemarks', value: part?.PART_RECEIVING_REMARKS },
      ]);

      // onFilterTransferParts(form.getFieldsValue());
    }
  }, [part]);
  useEffect(() => {
    if (part && isEditingView) {
      setIsEditing(false);
    } else {
      setIsEditing(false);
    }
  }, [part]);
  useEffect(() => {
    if (isEditingView) {
      setIsEditing(true);
    } else {
      setIsEditing(false);
    }
  }, [isEditingView]);
  const tabs = [
    {
      content: (
        <ProForm
          onFinish={async (values) => {
            const currentCompanyID = localStorage.getItem('companyID') || '';
            if (isEditing) {
              const result = await dispatch(
                updatePartByID({
                  companyID: currentCompanyID,
                  id: part._id,
                  updateDate: new Date(),
                  updateUserID: USER_ID || '',
                  updateUserSing: localStorage.getItem('singNumber') || '',
                  PART_REMARKS: values?.remarks,
                })
              );
              if (result.meta.requestStatus === 'fulfilled') {
                onEditPartDetailsEdit(result.payload);
                message.success('SUCCESS');
                await dispatch(
                  createBookingItem({
                    companyID: currentCompanyID,
                    data: {
                      companyID: currentCompanyID,
                      userSing: localStorage.getItem('singNumber') || '',
                      userID: USER_ID || '',
                      createDate: new Date(),
                      PART_NUMBER: result.payload?.PART_NUMBER,
                      voucherModel: 'MODIFIED',
                      GROUP: result.payload?.GROUP,
                      TYPE: result.payload?.TYPE,
                      CONDITION: result.payload?.CONDITION,
                      NAME_OF_MATERIAL: result.payload?.NAME_OF_MATERIAL,
                      STOCK: result.payload?.STOCK,
                      RECEIVED_DATE: result.payload?.RECEIVED_DATE,
                      UNIT_OF_MEASURE: result.payload.UNIT_OF_MEASURE,
                      ADD_UNIT_OF_MEASURE: result.payload?.ADD_UNIT_OF_MEASURE,
                      ADD_NAME_OF_MATERIAL:
                        result.payload?.ADD_NAME_OF_MATERIAL,
                      ADD_PART_NUMBER: result.payload?.ADD_PART_NUMBER,
                      ADD_QUANTITY: result.payload?.ADD_QUANTITY,
                      STATUS: result.payload?.STATUS,
                      PART_REMARKS: result.payload?.PART_REMARKS,
                    },
                  })
                );
              }
            }
          }}
          size="small"
          form={form}
          submitter={{
            render: (_, dom) =>
              isEditing
                ? [
                    ...dom,
                    <Button
                      key="cancel"
                      onClick={() => {
                        isEditing && setIsEditingView(!isEditingView);
                      }}
                    >
                      {t('Cancel')}
                    </Button>,
                  ]
                : [],
            submitButtonProps: {
              children: 'Search',
            },
          }}
        >
          <ProFormGroup>
            <Space
              onClick={() => part && setIsEditingView(!isEditingView)}
              className={`cursor-pointer transform transition px-3 ${
                !part ? 'opacity-50 cursor-not-allowed' : 'hover:text-blue-500'
              }`}
            >
              <EditOutlined />
              <>{t('EDIT')}</>
            </Space>{' '}
            <ProFormTextArea
              disabled={!isEditing}
              fieldProps={{ style: { resize: 'none' } }}
              // colSize={5}
              name="remarks"
              width="xl"
              tooltip={t('PART REMARKS')}
            ></ProFormTextArea>
          </ProFormGroup>
        </ProForm>
      ),
      title: `${t('PART REMARKS')}`,
    },
    {
      content: (
        <ProForm
          onFinish={async (values) => {
            const currentCompanyID = localStorage.getItem('companyID') || '';
            if (isEditing) {
              const result = await dispatch(
                updatePartByID({
                  companyID: currentCompanyID,
                  id: part._id,
                  updateDate: new Date(),
                  updateUserID: USER_ID || '',
                  updateUserSing: localStorage.getItem('singNumber') || '',
                  PART_PURCHASE_REMARKS: values?.purshaseRemarks,
                })
              );
              if (result.meta.requestStatus === 'fulfilled') {
                onEditPartDetailsEdit(result.payload);
                message.success('SUCCESS');
                await dispatch(
                  createBookingItem({
                    companyID: currentCompanyID,
                    data: {
                      companyID: currentCompanyID,
                      userSing: localStorage.getItem('singNumber') || '',
                      userID: USER_ID || '',
                      createDate: new Date(),
                      PART_NUMBER: result.payload?.PART_NUMBER,
                      voucherModel: 'MODIFIED',
                      GROUP: result.payload?.GROUP,
                      TYPE: result.payload?.TYPE,
                      CONDITION: result.payload?.CONDITION,
                      NAME_OF_MATERIAL: result.payload?.NAME_OF_MATERIAL,
                      STOCK: result.payload?.STOCK,
                      RECEIVED_DATE: result.payload?.RECEIVED_DATE,
                      UNIT_OF_MEASURE: result.payload.UNIT_OF_MEASURE,
                      ADD_UNIT_OF_MEASURE: result.payload?.ADD_UNIT_OF_MEASURE,
                      ADD_NAME_OF_MATERIAL:
                        result.payload?.ADD_NAME_OF_MATERIAL,
                      ADD_PART_NUMBER: result.payload?.ADD_PART_NUMBER,
                      ADD_QUANTITY: result.payload?.ADD_QUANTITY,
                      STATUS: result.payload?.STATUS,
                      PART_PURCHASE_REMARKS:
                        result.payload?.PART_PURCHASE_REMARKS,
                    },
                  })
                );
              }
            }
          }}
          size="small"
          form={form}
          submitter={{
            render: (_, dom) =>
              isEditing
                ? [
                    ...dom,
                    <Button
                      key="cancel"
                      onClick={() => {
                        isEditing && setIsEditingView(!isEditingView);
                      }}
                    >
                      {t('Cancel')}
                    </Button>,
                  ]
                : [],
            submitButtonProps: {
              children: 'Search',
            },
          }}
        >
          <ProFormGroup>
            <Space
              onClick={() => part && setIsEditingView(!isEditingView)}
              className={`cursor-pointer transform transition px-3 ${
                !part ? 'opacity-50 cursor-not-allowed' : 'hover:text-blue-500'
              }`}
            >
              <EditOutlined />
              <>{t('EDIT')}</>
            </Space>{' '}
            <ProFormTextArea
              disabled={!isEditing}
              fieldProps={{ style: { resize: 'none' } }}
              // colSize={5}
              name="purshaseRemarks"
              width="xl"
              tooltip={t('PURCHASE REMARKS')}
            ></ProFormTextArea>
          </ProFormGroup>
        </ProForm>
      ),
      title: `${t('PURCHASE REMARKS')}`,
    },
    {
      content: (
        <ProForm
          onFinish={async (values) => {
            const currentCompanyID = localStorage.getItem('companyID') || '';
            if (isEditing) {
              const result = await dispatch(
                updatePartByID({
                  companyID: currentCompanyID,
                  id: part._id,
                  updateDate: new Date(),
                  updateUserID: USER_ID || '',
                  updateUserSing: localStorage.getItem('singNumber') || '',
                  PART_REPARE_REMARKS: values?.repareRemarks,
                })
              );
              if (result.meta.requestStatus === 'fulfilled') {
                onEditPartDetailsEdit(result.payload);
                message.success('SUCCESS');
                await dispatch(
                  createBookingItem({
                    companyID: currentCompanyID,
                    data: {
                      companyID: currentCompanyID,
                      userSing: localStorage.getItem('singNumber') || '',
                      userID: USER_ID || '',
                      createDate: new Date(),
                      PART_NUMBER: result.payload?.PART_NUMBER,
                      voucherModel: 'MODIFIED',
                      GROUP: result.payload?.GROUP,
                      TYPE: result.payload?.TYPE,
                      CONDITION: result.payload?.CONDITION,
                      NAME_OF_MATERIAL: result.payload?.NAME_OF_MATERIAL,
                      STOCK: result.payload?.STOCK,
                      RECEIVED_DATE: result.payload?.RECEIVED_DATE,
                      UNIT_OF_MEASURE: result.payload.UNIT_OF_MEASURE,
                      ADD_UNIT_OF_MEASURE: result.payload?.ADD_UNIT_OF_MEASURE,
                      ADD_NAME_OF_MATERIAL:
                        result.payload?.ADD_NAME_OF_MATERIAL,
                      ADD_PART_NUMBER: result.payload?.ADD_PART_NUMBER,
                      ADD_QUANTITY: result.payload?.ADD_QUANTITY,
                      STATUS: result.payload?.STATUS,
                      PART_REPARE_REMARKS: result.payload?.PART_REPARE_REMARKS,
                    },
                  })
                );
              }
            }
          }}
          size="small"
          form={form}
          submitter={{
            render: (_, dom) =>
              isEditing
                ? [
                    ...dom,
                    <Button
                      key="cancel"
                      onClick={() => {
                        isEditing && setIsEditingView(!isEditingView);
                      }}
                    >
                      {t('Cancel')}
                    </Button>,
                  ]
                : [],
            submitButtonProps: {
              children: 'Search',
            },
          }}
        >
          <ProFormGroup>
            <Space
              onClick={() => part && setIsEditingView(!isEditingView)}
              className={`cursor-pointer transform transition px-3 ${
                !part ? 'opacity-50 cursor-not-allowed' : 'hover:text-blue-500'
              }`}
            >
              <EditOutlined />
              <>{t('EDIT')}</>
            </Space>{' '}
            <ProFormTextArea
              disabled={!isEditing}
              fieldProps={{ style: { resize: 'none' } }}
              // colSize={5}
              name="repareRemarks"
              width="xl"
              tooltip={t('REPAIR REMARKS')}
            ></ProFormTextArea>
          </ProFormGroup>
        </ProForm>
      ),
      title: `${t('REPAIR REMARKS')}`,
    },
    {
      content: (
        <ProForm
          onFinish={async (values) => {
            const currentCompanyID = localStorage.getItem('companyID') || '';
            if (isEditing) {
              const result = await dispatch(
                updatePartByID({
                  companyID: currentCompanyID,
                  id: part._id,
                  updateDate: new Date(),
                  updateUserID: USER_ID || '',
                  updateUserSing: localStorage.getItem('singNumber') || '',
                  PART_PICKSLIP_REMARKS: values?.pickslipRemarks,
                })
              );
              if (result.meta.requestStatus === 'fulfilled') {
                onEditPartDetailsEdit(result.payload);
                message.success('SUCCESS');
                await dispatch(
                  createBookingItem({
                    companyID: currentCompanyID,
                    data: {
                      companyID: currentCompanyID,
                      userSing: localStorage.getItem('singNumber') || '',
                      userID: USER_ID || '',
                      createDate: new Date(),
                      PART_NUMBER: result.payload?.PART_NUMBER,
                      voucherModel: 'MODIFIED',
                      GROUP: result.payload?.GROUP,
                      TYPE: result.payload?.TYPE,
                      CONDITION: result.payload?.CONDITION,
                      NAME_OF_MATERIAL: result.payload?.NAME_OF_MATERIAL,
                      STOCK: result.payload?.STOCK,
                      RECEIVED_DATE: result.payload?.RECEIVED_DATE,
                      UNIT_OF_MEASURE: result.payload.UNIT_OF_MEASURE,
                      ADD_UNIT_OF_MEASURE: result.payload?.ADD_UNIT_OF_MEASURE,
                      ADD_NAME_OF_MATERIAL:
                        result.payload?.ADD_NAME_OF_MATERIAL,
                      ADD_PART_NUMBER: result.payload?.ADD_PART_NUMBER,
                      ADD_QUANTITY: result.payload?.ADD_QUANTITY,
                      STATUS: result.payload?.STATUS,
                      PART_PICKSLIP_REMARKS:
                        result.payload?.PART_PICKSLIP_REMARKS,
                    },
                  })
                );
              }
            }
          }}
          size="small"
          form={form}
          submitter={{
            render: (_, dom) =>
              isEditing
                ? [
                    ...dom,
                    <Button
                      key="cancel"
                      onClick={() => {
                        isEditing && setIsEditingView(!isEditingView);
                      }}
                    >
                      {t('Cancel')}
                    </Button>,
                  ]
                : [],
            submitButtonProps: {
              children: 'Search',
            },
          }}
        >
          <ProFormGroup>
            <Space
              onClick={() => part && setIsEditingView(!isEditingView)}
              className={`cursor-pointer transform transition px-3 ${
                !part ? 'opacity-50 cursor-not-allowed' : 'hover:text-blue-500'
              }`}
            >
              <EditOutlined />
              <>{t('EDIT')}</>
            </Space>{' '}
            <ProFormTextArea
              disabled={!isEditing}
              fieldProps={{ style: { resize: 'none' } }}
              // colSize={5}
              name="pickslipRemarks"
              width="xl"
              tooltip={t('PICKSLIP REMARKS')}
            ></ProFormTextArea>
          </ProFormGroup>
        </ProForm>
      ),
      title: `${t('PICKSLIP REMARKS')}`,
    },
    {
      content: (
        <ProForm
          onFinish={async (values) => {
            const currentCompanyID = localStorage.getItem('companyID') || '';
            if (isEditing) {
              const result = await dispatch(
                updatePartByID({
                  companyID: currentCompanyID,
                  id: part._id,
                  updateDate: new Date(),
                  updateUserID: USER_ID || '',
                  updateUserSing: localStorage.getItem('singNumber') || '',
                  PART_RECEIVING_REMARKS: values?.receivingRemarks,
                })
              );
              if (result.meta.requestStatus === 'fulfilled') {
                onEditPartDetailsEdit(result.payload);
                message.success('SUCCESS');
                await dispatch(
                  createBookingItem({
                    companyID: currentCompanyID,
                    data: {
                      companyID: currentCompanyID,
                      userSing: localStorage.getItem('singNumber') || '',
                      userID: USER_ID || '',
                      createDate: new Date(),
                      PART_NUMBER: result.payload?.PART_NUMBER,
                      voucherModel: 'MODIFIED',
                      GROUP: result.payload?.GROUP,
                      TYPE: result.payload?.TYPE,
                      CONDITION: result.payload?.CONDITION,
                      NAME_OF_MATERIAL: result.payload?.NAME_OF_MATERIAL,
                      STOCK: result.payload?.STOCK,
                      RECEIVED_DATE: result.payload?.RECEIVED_DATE,
                      UNIT_OF_MEASURE: result.payload.UNIT_OF_MEASURE,
                      ADD_UNIT_OF_MEASURE: result.payload?.ADD_UNIT_OF_MEASURE,
                      ADD_NAME_OF_MATERIAL:
                        result.payload?.ADD_NAME_OF_MATERIAL,
                      ADD_PART_NUMBER: result.payload?.ADD_PART_NUMBER,
                      ADD_QUANTITY: result.payload?.ADD_QUANTITY,
                      STATUS: result.payload?.STATUS,
                      PART_RECEIVING_REMARKS:
                        result.payload?.PART_RECEIVING_REMARKS,
                    },
                  })
                );
              }
            }
          }}
          size="small"
          form={form}
          submitter={{
            render: (_, dom) =>
              isEditing
                ? [
                    ...dom,
                    <Button
                      key="cancel"
                      onClick={() => {
                        isEditing && setIsEditingView(!isEditingView);
                      }}
                    >
                      {t('Cancel')}
                    </Button>,
                  ]
                : [],
            submitButtonProps: {
              children: 'Search',
            },
          }}
        >
          <ProFormGroup>
            <Space
              onClick={() => part && setIsEditingView(!isEditingView)}
              className={`cursor-pointer transform transition px-3 ${
                !part ? 'opacity-50 cursor-not-allowed' : 'hover:text-blue-500'
              }`}
            >
              <EditOutlined />
              <>{t('EDIT')}</>
            </Space>{' '}
            <ProFormTextArea
              disabled={!isEditing}
              fieldProps={{ style: { resize: 'none' } }}
              // colSize={5}
              name="receivingRemarks"
              width="xl"
              tooltip={t('RECEIVING REMARKS')}
            ></ProFormTextArea>
          </ProFormGroup>
        </ProForm>
      ),
      title: `${t('RECEIVING REMARKS')}`,
    },
  ];

  return (
    <div>
      <TabContent tabs={tabs}></TabContent>
    </div>
  );
};

export default RemarksView;
