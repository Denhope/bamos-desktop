import {
  ModalForm,
  ProCard,
  ProForm,
  ProFormGroup,
  ProFormSelect,
  ProFormText,
} from '@ant-design/pro-components';
import { Button, Form, FormInstance, message } from 'antd';
import SearchTable from '@/components/layout/SearchElemTable';
import React, { FC, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import CreateStoreForm from './CreateStoreForm';
import { IStore } from '@/models/IStore';
import { useAppDispatch } from '@/hooks/useTypedSelector';
import { getFilteredShops, postNewStoreShop } from '@/utils/api/thunks';
import { PlusOutlined } from '@ant-design/icons';
import ContextMenuStoreSearchSelect from '@/components/shared/form/ContextMenuStoreSearchSelect';
type StoreFilterFormType = {
  onFilterSrore: (record: any) => void;
  storeCode?: string;
};
const StoreFilterForm: FC<StoreFilterFormType> = ({
  onFilterSrore,
  storeCode,
}) => {
  const { t } = useTranslation();
  const [form] = Form.useForm();
  const dispatch = useAppDispatch();
  const [openStoreViewer, setOpenStoreViewer] = useState<boolean>(false);

  const [openNewStoreViewer, setNewOpenStoreViewer] = useState<boolean>(false);
  const [createStoreData, oncreateStoreData] = useState<any | null>(null);

  const [selectedStore, setSecectedStore] = useState<any>(null);
  const [selectedSingleStore, setSecectedSingleStore] = useState<any>(null);

  useEffect(() => {
    if (selectedStore) {
      form.setFields([
        { name: 'store', value: selectedStore.APNNBR },

        // Добавьте здесь другие поля, которые вы хотите обновить
      ]);
    }
  }, [selectedStore]);

  // Ваш компонент

  const [APN, setAPN] = useState([]); // Состояние для хранения результатов

  useEffect(() => {
    if (openStoreViewer) {
      // Если модальное окно открыто
      const currentCompanyID = localStorage.getItem('companyID') || '';
      dispatch(
        getFilteredShops({
          companyID: currentCompanyID,
        })
      ).then((action) => {
        if (action.meta.requestStatus === 'fulfilled') {
          const transformedData = action.payload.map((item: any) => ({
            ...item,
            APNNBR: item.shopShortName, // Преобразуем shopShortName в APNNBR
          }));
          setAPN(transformedData);
          // Обновляем состояние с преобразованными данными
        }
      });
    }
  }, [openStoreViewer, dispatch]);
  const formRef = useRef<FormInstance>(null);
  const handleKeyPress = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter') {
      formRef.current?.submit(); // вызываем метод submit формы при нажатии Enter
    }
  };
  const [isResetForm, setIsResetForm] = useState<boolean>(false);
  const [initialForm, setinitialForm] = useState<any>('');
  return (
    <ProForm
      formRef={formRef}
      initialValues={{}}
      onReset={() => {
        setIsResetForm(true);
      }}
      form={form}
      size="small"
      onFinish={async (values) => {
        const currentCompanyID = localStorage.getItem('companyID') || '';
        const result = dispatch(
          getFilteredShops({
            companyID: currentCompanyID,
            shopShortName: form.getFieldValue('store')?.toUpperCase(),
          })
        );
        if ((await result).meta.requestStatus === 'fulfilled') {
          onFilterSrore((await result).payload[0]);
          // setPickData((await result).payload[0]);
        } else {
          message.error('NO ITEMS');
        }
      }}
    >
      <ProFormText
        initialValue={'MSQ'}
        disabled
        name="station"
        label={`${t('STATION')}`}
        width="sm"
        tooltip={`${t('STATION CODE')}`}
        //rules={[{ required: true }]}
        fieldProps={{
          // onKeyPress: handleKeyPress,
          autoFocus: true,
        }}
      />
      <ProFormGroup align="center">
        {/* <ProFormText
          name="store"
          label={`${t("STORE")}`}
          width="xs"
          tooltip={`${t("STORE CODE")}`}
          //rules={[{ required: true }]}
          fieldProps={{
            onDoubleClick: () => setOpenStoreViewer(true),
            onKeyPress: handleKeyPress,
            autoFocus: true,
          }}
        /> */}
        <ContextMenuStoreSearchSelect
          isResetForm={isResetForm}
          rules={[{ required: true }]}
          name={'store'}
          width={'xs'}
          onSelectedStore={function (record: any): void {
            setSecectedSingleStore(record);
            // onSelectSelectedStore?.(record);
          }}
          initialFormStore={selectedSingleStore?.shopShortName || initialForm}
          label={t('STORE')}
        />

        <ProForm.Item labelAlign="right" label={`${t('NEW STORE')}`}>
          <Button
            icon={<PlusOutlined />}
            className="hover:scale-110 transition-transform"
            shape="circle"
            onClick={() => setNewOpenStoreViewer(true)}
            size="middle"
          ></Button>
        </ProForm.Item>
      </ProFormGroup>

      <ModalForm
        onFinish={async () => {
          setSecectedStore(selectedSingleStore);
          setOpenStoreViewer(false);
        }}
        title={`${t('STORE SEARCH')}`}
        open={openStoreViewer}
        width={'35vw'}
        onOpenChange={setOpenStoreViewer}
      >
        <ProCard
          className="flex mx-auto justify-center align-middle"
          style={{}}
        >
          {APN && (
            <SearchTable
              data={APN}
              onRowClick={function (record: any, rowIndex?: any): void {
                setSecectedStore(record);
                setOpenStoreViewer(false);
              }}
              onRowSingleClick={function (record: any, rowIndex?: any): void {
                setSecectedSingleStore(record);
              }}
            ></SearchTable>
          )}
        </ProCard>
      </ModalForm>

      <ModalForm
        submitter={false}
        onFinish={async () => {}}
        title={`${t('CREATE NEW STORE ')}`}
        open={openNewStoreViewer}
        width={'70vw'}
        onOpenChange={setNewOpenStoreViewer}
      >
        <ProForm
          onFinish={async (values) => {
            const result = await dispatch(
              postNewStoreShop({
                ...createStoreData,
                createDate: new Date(),
                companyID: localStorage.getItem('companyID') || '',
              })
            );
            if (result.meta.requestStatus === 'fulfilled') {
              message.success('Success');
            } else message.error('Error');

            setNewOpenStoreViewer(false);
            oncreateStoreData(values as IStore);
          }}
        >
          <ProFormGroup>
            <ProFormText
              name="shopLongName"
              label={`${t('STORE LONG NAME')}`}
              width="lg"
              tooltip={`${t('STORE LONG NAME')}`}
              rules={[{ required: true }]}
            ></ProFormText>
            <ProFormText
              name="shopShortName"
              label={`${t('STORE SHORT NAME')}`}
              width="sm"
              tooltip={`${t('STORE SHORT NAME')}`}
              rules={[{ required: true }]}
            ></ProFormText>
            <ProFormSelect
              label={`${t('STATUS')}`}
              width="sm"
              name="status"
              tooltip={`${t('ENTER STATUS')}`}
              rules={[{ required: true }]}
              valueEnum={{
                active: { text: 'ACTIVE' },
                unActive: { text: 'UN ACTIVE' },
              }}
            ></ProFormSelect>
          </ProFormGroup>
          <ProFormGroup>
            <ProFormText
              name="description"
              label={`${t('STORE DESCRIPTION')}`}
              width="xl"
              tooltip={`${t('STORE ADRESS')}`}
              rules={[{ required: true }]}
            />
          </ProFormGroup>
          <ProFormGroup>
            <ProFormSelect
              label={`${t('STATION')}`}
              width="sm"
              name="station"
              tooltip={`${t('ENTER STATION')}`}
              rules={[{ required: true }]}
              valueEnum={{
                MSQ: { text: 'MINSK-2' },
                SMQ: { text: 'SMOLEVICHI' },
              }}
            ></ProFormSelect>
            <ProFormText
              name="adress"
              label={`${t('STORE ADRESS')}`}
              width="lg"
              tooltip={`${t('STORE ADRESS')}`}
              rules={[{ required: true }]}
            ></ProFormText>
            <ProFormText
              name="ownerShotName"
              label={`${t('OWNER SHORT NAME')}`}
              width="sm"
              tooltip={`${t('OWNER SHORT NAME')}`}
              rules={[{ required: true }]}
            ></ProFormText>
          </ProFormGroup>
        </ProForm>
      </ModalForm>
    </ProForm>
  );
};

export default StoreFilterForm;
