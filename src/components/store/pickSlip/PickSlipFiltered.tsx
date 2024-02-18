import {
  FormInstance,
  ProForm,
  ProFormDateRangePicker,
  ProFormSelect,
  ProFormText,
} from '@ant-design/pro-components';
import { DatePickerProps, Form } from 'antd';
import { RangePickerProps } from 'antd/es/date-picker';
import SearchSelect from '@/components/shared/form/SearchSelect';
import { useAppDispatch } from '@/hooks/useTypedSelector';
import moment from 'moment';
import React, { FC, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  getFilteredCancelMaterialOrders,
  getFilteredMaterialOrders,
  getFilteredPartNumber,
  getFilteredProjects,
} from '@/utils/api/thunks';
type PickSlipFilterFormType = {
  onFilterPickSlip?: (record: any) => void;
  canselVoidType?: boolean;
};
const PickSlipFiltered: FC<PickSlipFilterFormType> = ({
  onFilterPickSlip,
  canselVoidType,
}) => {
  const formRef = useRef<FormInstance>(null);
  const handleKeyPress = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter') {
      formRef.current?.submit(); // вызываем метод submit формы при нажатии Enter
    }
  };
  const { t } = useTranslation();
  const [form] = Form.useForm();
  const [selectedStartDate, setSelectedStartDate] = useState<any>();
  const [selectedEndDate, setSelectedEndDate] = useState<any>();
  const [openStoreFindModal, setOpenStoreFind] = useState(false);
  const [initialPN, setInitialPN] = useState('');
  const [initialWO, setInitialWO] = useState('');
  const [isReset, setIsReset] = useState(false);
  const companyID = localStorage.getItem('companyID') || '';
  const dispatch = useAppDispatch();
  const [selectedPN, setSelectedPN] = useState<any>(null);
  const [selectedWO, setSelectedWO] = useState<any>(null);
  const handleSelect = (selectedOption: any) => {
    setSelectedPN(selectedOption);
    setIsReset(true); // затем обратно в true
    setIsReset(false); // сначала установите в false
    //console.log(selectedOption);
  };
  const handleSelectWO = (selectedOption: any) => {
    setSelectedWO(selectedOption);
    setIsReset(true); // затем обратно в true
    setIsReset(false); // сначала установите в false
  };
  //co
  const onChange = (
    value: DatePickerProps['value'] | RangePickerProps['value'],
    dateString: [string, string] | string
  ) => {
    setSelectedEndDate(dateString[1]);
    setSelectedStartDate(dateString[0]);
  };

  const handleSearch = async (value: any) => {
    if (value) {
      const result = await dispatch(
        getFilteredPartNumber({
          companyID: companyID,
          partNumber: value,
        })
      );

      // Удаление дубликатов
      const uniqueResults = result.payload.reduce(
        (acc: any[], current: any) => {
          const x = acc.find(
            (item) => item.PART_NUMBER === current.PART_NUMBER
          );
          if (!x) {
            return acc.concat([current]);
          } else {
            return acc;
          }
        },
        []
      );

      return uniqueResults;
    }
  };
  const handleSearchWO = async (value: any) => {
    const result = await dispatch(
      getFilteredProjects({
        companyID: companyID,
      })
    );
    return result;
  };

  return (
    <ProForm
      size="small"
      formRef={formRef}
      initialValues={{
        createDate: [moment().subtract(1, 'months'), moment()],
      }}
      onReset={() => {
        setSelectedPN(null);
        setInitialPN('');
        setSelectedWO(null);
        setInitialWO('');
        setIsReset(true);
      }}
      form={form}
      layout="horizontal"
      onFinish={async (values) => {
        const currentCompanyID = localStorage.getItem('companyID') || '';

        if (canselVoidType) {
          const result = dispatch(
            getFilteredCancelMaterialOrders({
              companyID: currentCompanyID,
              projectId: form.getFieldValue('projectWO'),
              status: form.getFieldValue('status'),
              projectTaskWO: form.getFieldValue('taskWO'),
              regNbr: form.getFieldValue('receiver'),
              startDate: selectedStartDate,
              endDate: selectedEndDate,
              materialAplicationNumber: form.getFieldValue(
                'materialAplicationNumber'
              ),
              partNumber: selectedPN?.PART_NUMBER,
            })
          );
        } else {
          const result = dispatch(
            getFilteredMaterialOrders({
              companyID: currentCompanyID,
              projectId: form.getFieldValue('projectWO'),
              status: form.getFieldValue('status'),
              projectTaskWO: form.getFieldValue('taskWO'),
              regNbr: form.getFieldValue('receiver'),
              startDate: selectedStartDate,
              endDate: selectedEndDate,
              materialAplicationNumber: form.getFieldValue(
                'materialAplicationNumber'
              ),
              partNumber: selectedPN?.PART_NUMBER,
            })
          );
        }
      }}
    >
      <ProFormText
        name="materialAplicationNumber"
        label={`${t('PICKSLIP NUMBER')}`}
        width="lg"
        tooltip="PICKSLIP NUMBER"
        //rules={[{ required: true }]}
        fieldProps={{
          onKeyPress: handleKeyPress,
          autoFocus: true,
        }}
      />
      <ProForm.Group>
        <ProFormSelect
          name="sendFrom"
          label={`${t('SEND FROM')}`}
          width="lg"
          disabled
          tooltip="ENTER STORE "
          //rules={[{ required: true }]}
        />
        <ProFormSelect
          name="sendTO"
          disabled
          label={`${t('SEND TO')}`}
          width="lg"
          tooltip="ENTER STORE "
          //rules={[{ required: true }]}
        />
      </ProForm.Group>
      <ProForm.Group>
        <ProFormText
          name="receiver"
          label={`${t('RECEIVER')}`}
          width="lg"
          tooltip="ENTER A/C NUMBER "
          //rules={[{ required: true }]}
        />
        <SearchSelect
          initialValue={initialWO}
          isReset={isReset}
          onSearch={handleSearchWO}
          optionLabel1="projectWO"
          optionLabel2="projectName"
          onSelect={handleSelectWO}
          label={`${t('PROJECT')}`}
          tooltip={`${t('PROJECT')}`}
          rules={[]}
          name={'projectWO'}
          width="lg"
        />
      </ProForm.Group>
      <ProFormText
        name="taskWO"
        label={`${t('WO No')}`}
        width="lg"
        tooltip="SERIAL OR BATCH NUMBER"
        //rules={[{ required: true }]}
      />
      <SearchSelect
        width="lg"
        initialValue={initialPN}
        onDoubleClick={() => {
          setOpenStoreFind(true);
        }}
        isReset={isReset}
        onSearch={handleSearch}
        optionLabel1="PART_NUMBER"
        onSelect={handleSelect}
        label={`${t('PART NUMBER')}`}
        tooltip={`${t('DOUBE CLICK OPEN PART NUMBER BOOK')}`}
        rules={[]}
        name={'PART_NUMBER'}
      />
      {/* <ProFormText
        name="BATCH_ID"
        label={`${t('SN or BN')}`}
        width="lg"
        tooltip="SERIAL OR BATCH NUMBER"
        //rules={[{ required: true }]}
      /> */}
      <ProFormDateRangePicker
        name="createDate"
        label={`${t('CREATE DATE')}`}
        width="lg"
        tooltip="CREATE DATE"
        fieldProps={{
          onChange: onChange,
        }}
      />

      <ProForm.Group>
        <ProFormSelect
          // initialValue={['issued']}
          mode="multiple"
          name="status"
          label={`${t('STATUS')}`}
          width="lg"
          tooltip="SELECT STATUS "
          options={[
            { value: 'open', label: t('NEW') },
            { value: 'closed', label: t('CLOSED') },
            { value: 'cancelled', label: t('CANCELLED') },
            { value: 'partyCancelled', label: t('PARTY_CANCELLED') },
            { value: 'deleted', label: t('DELETED') },
            { value: 'issued', label: t('ISSUED') },
            { value: 'transfer', label: t('TRANSFER') },
          ]}

          //rules={[{ required: true }]}
        />
      </ProForm.Group>
    </ProForm>
  );
};

export default PickSlipFiltered;
