import {
  FormInstance,
  ProForm,
  ProFormDatePicker,
  ProFormGroup,
  ProFormSelect,
  ProFormText,
  ProFormTextArea,
} from '@ant-design/pro-components';
import { Form, Modal, message } from 'antd';
import PickSlipViwer from '@/components/layout/APN/PickSlipViwer';
import { useAppDispatch } from '@/hooks/useTypedSelector';
import React, { FC, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { getFilteredPickSlip } from '@/utils/api/thunks';
import { FULL_NAME } from '@/utils/api/http';
type PickSlipFilterFormType = {
  onFilterPickSlip: (record: any) => void;
  pickSlipNumber?: string;
  updateValue?: any;
};
const PickForm: FC<PickSlipFilterFormType> = ({
  onFilterPickSlip,
  pickSlipNumber,
  updateValue,
}) => {
  const { t } = useTranslation();
  const formRef = useRef<FormInstance>(null);
  const handleKeyPress = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter') {
      formRef.current?.submit(); // вызываем метод submit формы при нажатии Enter
    }
  };
  const dispatch = useAppDispatch();
  const [form] = Form.useForm();
  const [pickData, setPickData] = useState<any | null>(null);
  const [pickDataNumber, setPickNumber] = useState<any | null>(null);
  const [openPickViewer, setOpenPickViewer] = useState<boolean>(false);
  useEffect(() => {
    if (pickData) {
      form.setFields([
        { name: 'remarks', value: pickData.remarks },
        { name: 'status', value: pickData?.status.toUpperCase() },
        { name: 'woNumber', value: pickData.projectTaskWO },
        { name: 'project', value: pickData.projectWO },
        { name: 'reciver', value: pickData.registrationNumber },
        { name: 'neededOn', value: pickData.neededOn },
        { name: 'getFrom', value: pickData.getFrom },
        { name: 'mechSing', value: pickData.createBy },
        { name: 'bookingDate', value: pickData?.closedDate || new Date() },
        {
          name: 'storeman',
          value: pickData?.storeMan || FULL_NAME,
        },
        // Добавьте здесь другие поля, которые вы хотите обновить
      ]);
    }
  }, [pickData, updateValue]);
  useEffect(() => {
    if (pickSlipNumber) {
      form.setFields([
        { name: 'materialAplicationNumber', value: pickSlipNumber },

        // Добавьте здесь другие поля, которые вы хотите обновить
      ]);
    }
    if (pickDataNumber) {
      form.setFields([
        {
          name: 'materialAplicationNumber',
          value: pickDataNumber.materialAplicationNumber,
        },

        // Добавьте здесь другие поля, которые вы хотите обновить
      ]);
    }
  }, [pickDataNumber]);
  return (
    <div>
      <ProForm
        formRef={formRef}
        size="small"
        className="bg-white px-4 py-3 rounded-md border-gray-400"
        form={form}
        // size="middle"
        onFinish={async (values) => {
          const currentCompanyID = localStorage.getItem('companyID') || '';
          const result = dispatch(
            getFilteredPickSlip({
              companyID: currentCompanyID,
              materialAplicationNumber: values.materialAplicationNumber,
            })
          );
          if ((await result).meta.requestStatus === 'fulfilled') {
            onFilterPickSlip((await result).payload[0]);
            setPickData((await result).payload[0]);
          } else {
            message.error('NO ITEMS');
          }
        }}
        title="PICKSLIP DATA"
      >
        <ProFormGroup size={'small'}>
          <ProFormText
            name="materialAplicationNumber"
            label={`${t('PICKSLIP')}`}
            width="xs"
            tooltip="PICKSLIP No"
            //rules={[{ required: true }]}
            fieldProps={{
              onDoubleClick: () => setOpenPickViewer(true),
              onKeyPress: handleKeyPress,
              autoFocus: true,
            }}
          />
          <ProFormSelect
            disabled
            name="status"
            label={`${t('STATUS')}`}
            width="xs"
            tooltip="SELECT STATUS "
            options={[
              { value: 'open', label: t('NEW') },
              { value: 'OPEN', label: t('NEW') },
              { value: 'closed', label: t('CLOSE') },
              { value: 'cancelled', label: t('CANCEL') },
              { value: 'partyCancelled', label: t('PARTY_CANCELLED') },
              { value: 'deleted', label: t('DELETED') },
              { value: 'issued', label: t('ISSUED') },
              { value: 'transfer', label: t('TRANSFER') },
              { value: 'draft', label: t('DRAFT') },
            ]}
          />
          <ProFormText
            disabled
            name="woNumber"
            label={`${t('WO No')}`}
            width="xs"
          />
        </ProFormGroup>
        <ProFormGroup size={'small'}>
          <ProFormText
            disabled
            name="storeman"
            label={`${t('STOREMAN')}`}
            width="sm"
            // tooltip="PICKSLIP No"
            //rules={[{ required: true }]}
          />
          <ProFormDatePicker
            disabled={pickData?.status != 'issued'}
            name="bookingDate"
            label={`${t('BOOKING DATE')}`}
          />
        </ProFormGroup>
        <ProFormGroup size={'small'}>
          <ProFormText
            disabled
            name="mechSing"
            label={`${t('MECH.SING')}`}
            width="xs"
          />
          <ProFormText
            disabled
            name="getFrom"
            label={`${t('GET FROM')}`}
            width="xs"
          />
          <ProFormText
            disabled
            name="neededOn"
            label={`${t('NEEDED ON')}`}
            width="xs"
          />
        </ProFormGroup>
        <ProFormGroup>
          <ProFormText
            disabled
            name="reciver"
            label={`${t('RECIVER')}`}
            width="xs"
          />
          <ProFormText
            disabled
            name="project"
            label={`${t('PROJECT')}`}
            width="xs"
          />{' '}
        </ProFormGroup>
        <ProFormTextArea
          disabled
          fieldProps={{ style: { resize: 'none' } }}
          name="remarks"
          label={`${t('REMARKS')}`}
          width="lg"
        />
      </ProForm>
      <Modal
        title=""
        open={openPickViewer}
        width={'90%'}
        onCancel={() => setOpenPickViewer(false)}
        footer={null}
      >
        <div className="h-[78vh]  overflow-hidden">
          <PickSlipViwer onSingleRowClick={setPickNumber}></PickSlipViwer>
        </div>
      </Modal>
    </div>
  );
};

export default PickForm;
