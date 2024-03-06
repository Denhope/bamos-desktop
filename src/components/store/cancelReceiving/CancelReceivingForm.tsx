import {
  FormInstance,
  ProForm,
  ProFormDateRangePicker,
  ProFormGroup,
  ProFormText,
} from '@ant-design/pro-components';
import { DatePickerProps, Form, message } from 'antd';
import { RangePickerProps } from 'antd/es/date-picker';
import { useAppDispatch } from '@/hooks/useTypedSelector';
import moment from 'moment';
import React, { FC, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { getFilteredReceivingItems } from '@/utils/api/thunks';
import ContextMenuReceivingsSearchSelect from '@/components/shared/form/ContextMenuReceivingsSearchSelect';
import ContextMenuPNSearchSelect from '@/components/shared/form/ContextMenuPNSearchSelect';
type CancelReceivingFormType = {
  onFilterReceiving: (record: any) => void;
};
const CancelReceivingForm: FC<CancelReceivingFormType> = ({
  onFilterReceiving,
}) => {
  const { t } = useTranslation();
  const [form] = Form.useForm();
  const dispatch = useAppDispatch();
  const formRef = useRef<FormInstance>(null);
  const handleKeyPress = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter') {
      formRef.current?.submit(); // вызываем метод submit формы при нажатии Enter
    }
  };
  const [selectedStartDate, setSelectedStartDate] = useState<any>();
  const [selectedEndDate, setSelectedEndDate] = useState<any>();
  const [selectedSingleReceiving, setSecectedSingleReceiving] = useState<any>();
  const [initialForm, setinitialForm] = useState<any>('');
  const [selectedSinglePN, setSecectedSinglePN] = useState<any>();
  const [isResetForm, setIsResetForm] = useState<boolean>(false);
  const onChange = (
    value: DatePickerProps['value'] | RangePickerProps['value'],
    dateString: [string, string] | string
  ) => {
    setSelectedEndDate(dateString[1]);
    setSelectedStartDate(dateString[0]);
  };
  return (
    <div>
      <ProForm
        onReset={() => {
          setIsResetForm(true);

          setTimeout(() => {
            setIsResetForm(false);
          }, 0);
          setinitialForm('');
          setSecectedSinglePN(null);
          setSelectedEndDate(null);
          setSelectedStartDate(null);
        }}
        onFinish={async (values: any) => {
          if (null) {
            message.error('Some fields are empty');
          } else {
            const currentCompanyID = localStorage.getItem('companyID') || '';
            const result = dispatch(
              getFilteredReceivingItems({
                companyID: currentCompanyID,
                orderNumber: form.getFieldValue('onorderNumber'),
                vendorName: form.getFieldValue('vendorName'),
                partNumber: selectedSinglePN?.PART_NUMBER,
                orderType: form.getFieldValue('orderType'),
                serialNumber: form.getFieldValue('serialNumber'),
                batchNumber: form.getFieldValue('batchNumber'),
                receiningNumber: selectedSingleReceiving?.receivingNumber,
                receiningItemNumber: form.getFieldValue('receiningItemNumber'),
                store: form.getFieldValue('store'),
                station: form.getFieldValue('station'),
                partGroup: form.getFieldValue('partGroup'),
                partType: form.getFieldValue('partType'),
                location: form.getFieldValue('location'),
                receivedBy: form.getFieldValue('receivedBy'),
                label: form.getFieldValue('label'),
                startDate: selectedStartDate,
                endDate: selectedEndDate,
                isCancelled: false,
              })
            );
            if ((await result).meta.requestStatus === 'fulfilled') {
              onFilterReceiving((await result).payload || []);
            } else {
              message.error('Error');
            }
            // onSelectLocation(selectedLocation);
            // onFilterTransferParts(selectedFeatchStore);
          }
        }}
        initialValues={{
          receivingDate: [moment().subtract(1, 'months'), moment()],
        }}
        layout="horizontal"
        formRef={formRef}
        size="small"
        className="bg-white px-4 py-3 rounded-md border-gray-400"
        form={form}
      >
        <ProFormGroup>
          <ProFormText
            name="onorderNumber"
            label={`${t('ORDER No')}`}
            width="sm"
            tooltip="ORDER NUMBER"
            //rules={[{ required: true }]}
            fieldProps={{
              onKeyPress: handleKeyPress,
            }}
          />

          <ContextMenuReceivingsSearchSelect
            isResetForm={isResetForm}
            rules={[{ required: false }]}
            name={'receiningNumber'}
            onSelectedReceiving={function (receiving: any): void {
              setSecectedSingleReceiving(receiving);
            }}
            initialForm={
              selectedSingleReceiving?.receivingNumber || initialForm
            }
            width={'sm'}
            label={'RECEIVING No'}
          />

          <ContextMenuPNSearchSelect
            label={t('PART No')}
            isResetForm={isResetForm}
            rules={[{ required: false }]}
            onSelectedPN={function (PN: any): void {
              setSecectedSinglePN(PN);
            }}
            name={'partNumber'}
            initialFormPN={selectedSinglePN?.PART_NUMBER || initialForm}
            width={'sm'}
          ></ContextMenuPNSearchSelect>
          <ProFormText
            name="serialNumber"
            label={t('SERIAL No')}
            width="sm"
            tooltip={t('SERIAL No')}
            fieldProps={{
              // onDoubleClick: () => setOpenPickViewer(true),
              onKeyPress: handleKeyPress,
            }}
          ></ProFormText>
          <ProFormDateRangePicker
            name="receivingDate"
            label={`${t('RECEIVING DATE')}`}
            width="sm"
            tooltip="RECEIVING DATE"
            fieldProps={{
              onChange: onChange,
            }}
          />
        </ProFormGroup>
      </ProForm>
    </div>
  );
};

export default CancelReceivingForm;
