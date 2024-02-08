import { ModalForm } from '@ant-design/pro-form';
import { FC, useEffect, useState } from 'react';
import ContextMenuWrapper from '../ContextMenuWrapperProps';
import SearchSelect from './SearchSelect';
import { useAppDispatch } from '@/hooks/useTypedSelector';

import { useTranslation } from 'react-i18next';

import { getFilteredReceiving } from '@/utils/api/thunks';
import ReceivingTracking from '@/components/layout/APN/ReceivingTracking';

interface ContextMenuReceivingsSelectProps {
  rules: Array<any>;
  name: string;
  isResetForm?: boolean;
  onSelectedReceiving: (vendor: any) => void;
  initialForm: string;
  width: 'lg' | 'sm' | 'xs';
  label: string;
  disabled?: boolean;
}
const ContextMenuVendorsSearchSelect: FC<ContextMenuReceivingsSelectProps> = ({
  rules,
  name,
  isResetForm,
  initialForm,
  width,
  label,
  disabled,

  onSelectedReceiving,
}) => {
  const companyID = localStorage.getItem('companyID') || '';
  const dispatch = useAppDispatch();
  const [openReceivingFindModal, setOpenReceivingFind] = useState(false);
  const [selectedSingleReceiving, setSecectedSingleReceiving] = useState<any>();

  const [isReset, setIsReset] = useState(isResetForm || false);

  const handleSearch = async (value: any) => {
    if (companyID) {
      const result = await dispatch(
        getFilteredReceiving({
          companyID: companyID,
          receivingNumber: value,
        })
      );
      return result;
    }
  };
  const handleSelect = (selectedOption: any) => {
    onSelectedReceiving(selectedOption);
    setIsReset(true); // затем обратно в true
    setIsReset(false); // сначала установите в false
  };
  const handleCopy = (target: EventTarget | null) => {
    const value = (target as HTMLDivElement).innerText;
    navigator.clipboard.writeText(value);
  };

  const [initialPN, setInitialPN] = useState(initialForm);

  const { t } = useTranslation();
  useEffect(() => {
    if (initialForm) {
      setInitialPN(initialForm);
    }
  }, [initialForm]);
  return (
    <div>
      <ContextMenuWrapper
        items={[
          {
            label: 'Copy',
            action: handleCopy,
          },
        ]}
      >
        <SearchSelect
          disabled={disabled}
          width={width}
          initialValue={initialForm}
          onDoubleClick={() => {
            setOpenReceivingFind(true);
          }}
          isReset={isReset}
          onSearch={handleSearch}
          optionLabel1="receivingNumber"
          // optionLabel2="DESCRIPTION"
          onSelect={handleSelect}
          label={label}
          tooltip={`${t('DOUBE CLICK RECEIVING LIST')}`}
          rules={rules}
          name={name}
        />
      </ContextMenuWrapper>

      <ModalForm
        width={'70vw'}
        open={openReceivingFindModal}
        onOpenChange={setOpenReceivingFind}
        onFinish={async function (record: any, rowIndex?: any): Promise<void> {
          setOpenReceivingFind(false);
          handleSelect(selectedSingleReceiving);
          setInitialPN(selectedSingleReceiving?.RECEIVING_NUMBER || '');
        }}
      >
        <ReceivingTracking
          onSingleRowClick={(data) => {
            console.log(data);
          }}
          onDoubleClick={(data) => {
            onSelectedReceiving(data);
            setSecectedSingleReceiving({
              SUPPLIES_CODE: data?.SUPPLIES_CODE,
              awbReference: data?.AWB_REFERENCE,
              receivingNumber: data?.RECEIVING_NUMBER,
              receivingDate: data?.RECEIVED_DATE,
              receivingTime: data?.RECEIVED_DATE,
              awbNumber: data?.AWB_NUMBER,
              awbDate: data?.AWB_DATE,
              awbType: data?.AWB_TYPE,
              WAREHOUSE_RECEIVED_AT: data?.WAREHOUSE_RECEIVED_AT,
              SUPPLIER_SHORT_NAME: data?.SUPPLIER_SHORT_NAME,
              SUPPLIER_NAME: data?.SUPPLIER_NAME,
              SUPPLIER_UNP: data?.SUPPLIER_UNP,
              IS_RESIDENT: data?.IS_RESIDENT,
              SUPPLIER_ADRESS: data?.SUPPLIER_ADRESS,
              SUPPLIER_COUNTRY: data?.SUPPLIER_COUNTRY,
              SUPPLIES_ID: data._id || data.id,
            });
            onSelectedReceiving({
              SUPPLIES_CODE: data?.SUPPLIES_CODE,
              awbReference: data?.AWB_REFERENCE,
              receivingNumber: data?.RECEIVING_NUMBER,
              receivingDate: data?.RECEIVED_DATE,
              receivingTime: data?.RECEIVED_DATE,
              awbNumber: data?.AWB_NUMBER,
              awbDate: data?.AWB_DATE,
              awbType: data?.AWB_TYPE,
              WAREHOUSE_RECEIVED_AT: data?.WAREHOUSE_RECEIVED_AT,
              SUPPLIER_SHORT_NAME: data?.SUPPLIER_SHORT_NAME,
              SUPPLIER_NAME: data?.SUPPLIER_NAME,
              SUPPLIER_UNP: data?.SUPPLIER_UNP,
              IS_RESIDENT: data?.IS_RESIDENT,
              SUPPLIER_ADRESS: data?.SUPPLIER_ADRESS,
              SUPPLIER_COUNTRY: data?.SUPPLIER_COUNTRY,
              SUPPLIES_ID: data._id || data.id,
            });

            setOpenReceivingFind(false);
          }}
        ></ReceivingTracking>
      </ModalForm>
    </div>
  );
};

export default ContextMenuVendorsSearchSelect;
