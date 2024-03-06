import {
  ModalForm,
  ProCard,
  ProForm,
  ProFormCheckbox,
  ProFormGroup,
  ProFormSelect,
  ProFormText,
} from '@ant-design/pro-components';
import { Form, FormInstance } from 'antd';
import SearchTable from '@/components/layout/SearchElemTable';
import PartNumberSearch from '@/components/store/search/PartNumberSearch';
import { useAppDispatch } from '@/hooks/useTypedSelector';
import { IStore } from '@/models/IStore';
import moment from 'moment';
import React, { FC, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { getFilteredShops } from '@/utils/api/thunks';
import ContextMenuPNSearchSelect from '@/components/shared/form/ContextMenuPNSearchSelect';
import ContextMenuStoreSearchSelect from '@/components/shared/form/ContextMenuStoreSearchSelect';
import ContextMenuLocationSearchSelect from '@/components/shared/form/ContextMenuLocationSearchSelect';
type ScrapPartsFilteredFormType = {
  onSelectLocation: (record: any) => void;
  onSelectSelectedStore?: (record: any) => void;
  onReset?: () => void; // Добавьте эту строку
  onSelectedValues: (record: any) => void;
  onScrapped?: (record: any) => void;
};
const ScrapPartsFilteredForm: FC<ScrapPartsFilteredFormType> = ({
  // onSelectLocation,
  onSelectSelectedStore,
  onSelectedValues,
  onReset,
  // onScrapped,
}) => {
  const formRef = useRef<FormInstance>(null);
  const handleKeyPress = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter') {
      formRef.current?.submit();
    }
  };
  const { t } = useTranslation();
  const [form] = Form.useForm();

  const [selectedSingleStore, setSecectedSingleStore] = useState<any>(null);

  const [LOCATION, setLOCATION] = useState([]); //

  const [selectedSingleLocation, setSecectedSingleLocation] =
    useState<any>(null);
  const [isResetForm, setIsResetForm] = useState<boolean>(false);
  const [initialForm, setinitialForm] = useState<any>('');
  const [selectedSinglePN, setSecectedSinglePN] = useState<any>();

  useEffect(() => {
    if (selectedSingleStore) {
      form.setFields([
        // { name: 'store', value: selectedSingleStore?.shopShortName },
      ]);
      const transformedData = selectedSingleStore?.locations.map(
        (item: any) => ({
          ...item,
          APNNBR: item?.locationName, // Преобразуем shopShortName в APNNBR
        })
      );

      setLOCATION(transformedData);
    }
  }, [selectedSingleStore]);

  const [isOnlyScrapped, setIsOnlyScrap] = useState<any>(true);

  // const handleCheckboxChange = (checked) => {
  //   setIsOnlyScrap(checked);
  // };

  return (
    <div>
      <ProForm
        className="bg-white px-4 py-3 rounded-md border-gray-400"
        onFinish={async (values: any) => {
          onSelectedValues({
            ...values,
            partNumber: selectedSinglePN?.PART_NUMBER,
            store: selectedSingleStore?.shopShortName,
            location: selectedSingleLocation?.locationName,
          });

          // onScrapped && onScrapped(isOnlyScrapped);
        }}
        onReset={(values) => {
          onReset && onReset();
          onSelectSelectedStore?.(null);

          setinitialForm('');
          setIsResetForm(true);
          setSecectedSingleStore(null);

          setSecectedSingleLocation(null);
          setSecectedSinglePN(null);
          setTimeout(() => {
            setIsResetForm(false);
          }, 0);
        }}
        form={form}
        formRef={formRef}
        layout="horizontal"
        size="small"
        initialValues={{
          receivingDate: [moment().subtract(1, 'months'), moment()],
        }}
      >
        <ProFormGroup>
          <ProFormSelect
            initialValue={'MSQ'}
            disabled
            name="station"
            label={`${t('STATION')}`}
            width="xs"
            tooltip={`${t('STATION CODE')}`}
          />
          <ProFormGroup direction="vertical" size={'small'}>
            <ContextMenuPNSearchSelect
              isResetForm={isResetForm}
              // disabled={isOnlyScrapped}
              rules={[{ required: false }]}
              onSelectedPN={function (PN: any): void {
                setSecectedSinglePN(PN);
              }}
              name={'partNumber'}
              initialFormPN={selectedSinglePN?.PART_NUMBER || initialForm}
              width={'sm'}
              label={t('PART No')}
            ></ContextMenuPNSearchSelect>

            <ContextMenuStoreSearchSelect
              label={t('STORE')}
              isResetForm={isResetForm}
              // disabled={isOnlyScrapped}
              rules={[{ required: true }]}
              name={'store'}
              width={'xs'}
              onSelectedStore={function (record: any): void {
                setSecectedSingleStore(record);
                onSelectSelectedStore?.(record);
              }}
              initialFormStore={
                selectedSingleStore?.shopShortName || initialForm
              }
            />
          </ProFormGroup>
          <ProFormGroup direction="vertical" size={'small'}>
            <ProFormText
              // disabled={isOnlyScrapped}
              name="serialNumber"
              label={t('SERIAL No')}
              width="sm"
              tooltip={t('SERIAL No')}
              fieldProps={{
                // onDoubleClick: () => setOpenPickViewer(true),
                onKeyPress: handleKeyPress,
                autoFocus: true,
              }}
            ></ProFormText>
            <ContextMenuLocationSearchSelect
              isResetForm={isResetForm}
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
          </ProFormGroup>
          <ProFormSelect
            mode="multiple"
            name="partGroup"
            label={`${t('PART GROUP')}`}
            width="sm"
            tooltip={`${t('SELECT SPESIAL GROUP')}`}
            options={[
              { value: 'CONS', label: t('CONS') },
              { value: 'TOOL', label: t('TOOL') },
              { value: 'CHEM', label: t('CHEM') },
              { value: 'ROT', label: t('ROT') },
              { value: 'GSE', label: t('GSE') },
            ]}
          />
          <ProFormCheckbox.Group
            className="my-0 py-0"
            initialValue={['true']}
            labelAlign="left"
            name="isAllSCPAPPED"
            fieldProps={{
              onChange: (value: any) => {
                setIsOnlyScrap(value);
              },
            }}
            options={[{ label: `${t('ONLY SCRAPPED')}`, value: 'true' }].map(
              (option) => ({
                ...option,
                style: { display: 'flex', flexWrap: 'wrap' }, // Добавьте эту строку
              })
            )}
          />
        </ProFormGroup>
      </ProForm>
    </div>
  );
};

export default ScrapPartsFilteredForm;
