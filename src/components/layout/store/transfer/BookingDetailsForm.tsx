import {
  ProForm,
  ProFormCheckbox,
  ProFormDigit,
  ProFormGroup,
  ProFormText,
} from '@ant-design/pro-components';
import { Form } from 'antd';
import { CheckboxChangeEvent } from 'antd/es/checkbox';

import React, { FC, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

import ContextMenuStoreSearchSelect from '@/components/shared/form/ContextMenuStoreSearchSelect';
import ContextMenuLocationSearchSelect from '@/components/shared/form/ContextMenuLocationSearchSelect';
type BookingDetailsFormType = {
  onFilterBookingDEtails?: (record: any) => void;

  initialStore?: any;
};
const BookingDetailsForm: FC<BookingDetailsFormType> = ({
  onFilterBookingDEtails,

  initialStore,
}) => {
  const { t } = useTranslation();

  const [isTransferPartsChecked, setIsTransferPartsChecked] = useState(false);
  const [isChangeLocationChecked, setIsChangeLocationChecked] = useState(true);
  const [form] = Form.useForm();

  const [selectedSingleStore, setSecectedSingleStore] = useState<any>(null);

  const [LOCATION, setLOCATION] = useState([]); //

  const [selectedSingleLocation, setSecectedSingleLocation] =
    useState<any>(null);

  useEffect(() => {
    if (initialStore) {
      setSecectedSingleStore(initialStore);

      form.setFields([
        {
          name: 'targetStore',
          value: initialStore?.shopShortName?.toUpperCase().trim(),
        },
      ]);
    }
  }, [initialStore]);
  useEffect(() => {
    if (selectedSingleStore) {
      form.setFields([{ name: 'store', value: selectedSingleStore?.APNNBR }]);
      const transformedData = selectedSingleStore?.locations.map(
        (item: any) => ({
          ...item,
          APNNBR: item?.locationName, // Преобразуем shopShortName в APNNBR
        })
      );

      setLOCATION(transformedData);
    }
  }, [selectedSingleStore]);

  useEffect(() => {
    if (selectedSingleLocation) {
      form.setFields([
        { name: 'targetLocation', value: selectedSingleLocation?.APNNBR },
        { name: 'owner', value: selectedSingleLocation?.ownerShotName },
        {
          name: 'rectriction',
          value: selectedSingleLocation?.rectriction?.toUpperCase(),
        },
      ]);
      onFilterBookingDEtails && onFilterBookingDEtails(form.getFieldsValue());
    }
  }, [selectedSingleLocation]);

  const [initialForm, setinitialForm] = useState<any>('');
  return (
    <>
      <ProForm
        size="small"
        submitter={false}
        className="bg-white px-4 py-3 rounded-md border-gray-400"
        form={form}
        onValuesChange={(changedValues, allValues) => {
          if (changedValues.store && isChangeLocationChecked) {
            form.setFieldsValue({
              targetStore: allValues.store,
            });
          }
        }}
      >
        <ProFormGroup size={'large'}>
          <ProFormGroup>
            <ProFormText
              initialValue={'MSQ'}
              disabled
              name="station"
              label={`${t('STATION')}`}
              width="xs"
              tooltip={`${t('STATION CODE')}`}
              fieldProps={{
                autoFocus: true,
              }}
            />

            <ContextMenuStoreSearchSelect
              disabled={isChangeLocationChecked}
              rules={[{ required: true }]}
              name={'targetStore'}
              width={'xs'}
              onSelectedStore={function (record: any): void {
                setSecectedSingleStore(record);
                // setSecectedStore(record);
              }}
              initialFormStore={
                selectedSingleStore?.shopShortName || initialForm
              }
            />

            <ContextMenuLocationSearchSelect
              disabled={!selectedSingleStore?.shopShortName}
              rules={[{ required: false }]}
              width={'xs'}
              name={'targetLocation'}
              onSelectedLocation={function (record: any): void {
                setSecectedSingleLocation(record);
              }}
              initialFormStore={
                selectedSingleLocation?.locationName || initialForm
              }
              locations={LOCATION}
            />
            <ProFormText
              name="rectriction"
              disabled
              label={`${t('RESRTICTION')}`}
              width="sm"
              tooltip={`${t('RESTRICTION')}`}
            />
          </ProFormGroup>
          <ProFormGroup size={'small'}>
            <ProFormCheckbox
              fieldProps={{
                checked: isTransferPartsChecked,
                onChange: (e: CheckboxChangeEvent) => {
                  setIsTransferPartsChecked(e.target.checked);
                  setIsChangeLocationChecked(!e.target.checked);
                },
              }}
            >
              {t('TRANSFER PARTS')}
            </ProFormCheckbox>
            <ProFormCheckbox
              fieldProps={{
                checked: isChangeLocationChecked,
                onChange: (e: CheckboxChangeEvent) => {
                  setIsChangeLocationChecked(e.target.checked);
                  setIsTransferPartsChecked(!e.target.checked);
                },
              }}
            >
              {t('CHANGE LOCATION')}
            </ProFormCheckbox>
          </ProFormGroup>
          <ProFormGroup>
            <ProFormDigit
              name="quantity"
              label={`${t('QUANTITY')}`}
              width="xs"
              disabled={true}
              fieldProps={{
                autoFocus: true,
              }}
            />
            <ProFormText
              disabled
              name="owner"
              label={`${t('LOCATION OWNER')}`}
              width="md"
              fieldProps={{
                autoFocus: true,
              }}
            />
            <ProFormText
              name="remarks"
              label={`${t('REMARKS')}`}
              width="md"
              tooltip={`${t('REMARKS')}`}
              fieldProps={{
                autoFocus: true,
              }}
            />
          </ProFormGroup>
        </ProFormGroup>
      </ProForm>
    </>
  );
};

export default BookingDetailsForm;
