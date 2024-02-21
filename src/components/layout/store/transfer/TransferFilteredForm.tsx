import {
  ModalForm,
  ProCard,
  ProForm,
  ProFormGroup,
  ProFormSelect,
  ProFormText,
} from '@ant-design/pro-components';
import { Form, FormInstance } from 'antd';

import { useAppDispatch } from '@/hooks/useTypedSelector';
import React, { FC, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';

import ContextMenuPNSearchSelect from '@/components/shared/form/ContextMenuPNSearchSelect';
import ContextMenuStoreSearchSelect from '@/components/shared/form/ContextMenuStoreSearchSelect';
import ContextMenuLocationSearchSelect from '@/components/shared/form/ContextMenuLocationSearchSelect';
type TransferFilteredFormType = {
  onFilterTransferParts: (record: any) => void;
  onSelectLocation: (record: any) => void;
  onSelectedValues: (record: any) => void;
  onSelectSelectedStore?: (record: any) => void;
  onReset?: () => void; // Добавьте эту строку
};
const TransferFilteredForm: FC<TransferFilteredFormType> = ({
  onFilterTransferParts,
  onSelectLocation,
  onSelectSelectedStore,
  onReset,

  onSelectedValues,
}) => {
  const { t } = useTranslation();
  const [form] = Form.useForm();

  const [selectedSingleStore, setSecectedSingleStore] = useState<any>(null);

  const [LOCATION, setLOCATION] = useState([]); //

  const [selectedSingleLocation, setSecectedSingleLocation] =
    useState<any>(null);

  useEffect(() => {
    if (selectedSingleStore) {
      // form.setFields([{ name: 'store', value: selectedStore.APNNBR }]);
      const transformedData = selectedSingleStore?.locations.map(
        (item: any) => ({
          ...item,
          APNNBR: item.locationName, // Преобразуем shopShortName в APNNBR
        })
      );

      setLOCATION(transformedData);
    }
  }, [selectedSingleStore]);

  const formRef = useRef<FormInstance>(null);
  const handleKeyPress = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter') {
      formRef.current?.submit(); // вызываем метод submit формы при нажатии Enter
    }
  };

  const [isResetForm, setIsResetForm] = useState<boolean>(false);

  const [selectedSinglePN, setSecectedSinglePN] = useState<any>();

  const [initialForm, setinitialForm] = useState<any>('');
  return (
    <>
      <ProForm
        size={'small'}
        onReset={(values) => {
          setSecectedSinglePN(null);
          setinitialForm('');
          setIsResetForm(true);
          setTimeout(() => {
            setIsResetForm(false);
          }, 0);
          onReset && onReset();
          onSelectSelectedStore && onSelectSelectedStore(null);
          onSelectedValues(null);
          onSelectLocation(null);
          onFilterTransferParts(null);
          onReset && onReset();
        }}
        formRef={formRef}
        onFinish={async (values: any) => {
          onSelectedValues({
            ...values,
            partNumber: selectedSinglePN?.PART_NUMBER,
            store: selectedSingleStore?.shopShortName,
            location: selectedSingleLocation?.locationName,
          });
        }}
        form={form}
        className="bg-gray-200 px-4 py-5 rounded-md border-gray-400"
      >
        <ProFormGroup align="center">
          <ProFormGroup>
            {''}
            <ProFormSelect
              initialValue={'MSQ'}
              disabled
              name="station"
              label={`${t('STATION')}`}
              width="xs"
              tooltip={`${t('STATION CODE')}`}
              //rules={[{ required: true }]}
            />
          </ProFormGroup>

          <ContextMenuStoreSearchSelect
            isResetForm={isResetForm}
            rules={[{ required: true }]}
            name={'store'}
            width={'xs'}
            onSelectedStore={function (record: any): void {
              setSecectedSingleStore(record);
              onSelectSelectedStore?.(record);
            }}
            initialFormStore={selectedSingleStore?.shopShortName || initialForm}
          />
          <ContextMenuLocationSearchSelect
            isResetForm={isResetForm}
            rules={[{ required: false }]}
            width={'xs'}
            name={'location'}
            onSelectedLocation={function (record: any): void {
              // setSecectedLocation(record);
              setSecectedSingleLocation(record);
            }}
            initialFormStore={
              selectedSingleLocation?.locationName || initialForm
            }
            locations={LOCATION}
          />

          <ProFormText
            name="label"
            label={`${t('LABEL')}`}
            width="xs"
            tooltip={`${t('LABEL NUMBER')}`}
            //rules={[{ required: true }]}
            fieldProps={{
              onKeyPress: handleKeyPress,
            }}
          />
          <ContextMenuPNSearchSelect
            isResetForm={isResetForm}
            rules={[{ required: false }]}
            onSelectedPN={function (PN: any): void {
              setSecectedSinglePN(PN);
            }}
            name={'partNumber'}
            initialFormPN={selectedSinglePN?.PART_NUMBER || initialForm}
            width={'sm'}
          ></ContextMenuPNSearchSelect>
        </ProFormGroup>
      </ProForm>
    </>
  );
};

export default TransferFilteredForm;
