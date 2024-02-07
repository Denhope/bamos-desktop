import PartNumberSearch from '@/components/store/search/PartNumberSearch';
import { ModalForm } from '@ant-design/pro-form';
import { FC, useEffect, useState } from 'react';
import ContextMenuWrapper from '../ContextMenuWrapperProps';
import SearchSelect from './SearchSelect';
import { useAppDispatch } from '@/hooks/useTypedSelector';
import { getFilteredPartNumber, getFilteredVendors } from '@/utils/api/thunks';
import { useTranslation } from 'react-i18next';
import VendorSearchForm from '@/components/store/search/VendorSearchForm';

interface ContextMenuVendorsSelectProps {
  rules: Array<any>;
  name: string;
  isResetForm?: boolean;
  onSelectedVendor: (vendor: any) => void;
  initialForm: string;
  width: 'lg' | 'sm' | 'xs';
  label: string;
}
const ContextMenuVendorsSearchSelect: FC<ContextMenuVendorsSelectProps> = ({
  rules,
  name,
  isResetForm,
  initialForm,
  width,
  label,

  onSelectedVendor,
}) => {
  const companyID = localStorage.getItem('companyID') || '';
  const dispatch = useAppDispatch();
  const [openStoreFindModal, setOpenVendorFind] = useState(false);
  const [selectedSingleVendor, setSecectedSingleVendor] = useState<any>();

  const [isReset, setIsReset] = useState(isResetForm || false);

  const handleSearch = async (value: any) => {
    if (companyID) {
      const result = await dispatch(
        getFilteredVendors({
          companyID: companyID,
          code: value,
        })
      );

      return result;
    }
  };
  const handleSelect = (selectedOption: any) => {
    onSelectedVendor(selectedOption);
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
          width={width}
          initialValue={initialForm}
          onDoubleClick={() => {
            setOpenVendorFind(true);
          }}
          isReset={isReset}
          onSearch={handleSearch}
          optionLabel1="CODE"
          // optionLabel2="DESCRIPTION"
          onSelect={handleSelect}
          label={label}
          tooltip={`${t('DOUBE CLICK OPEN SUPPLIES CODE BOOK')}`}
          rules={rules}
          name={name}
        />
      </ContextMenuWrapper>

      <ModalForm
        width={'70vw'}
        open={openStoreFindModal}
        onOpenChange={setOpenVendorFind}
        onFinish={async function (record: any, rowIndex?: any): Promise<void> {
          setOpenVendorFind(false);
          handleSelect(selectedSingleVendor);
          setInitialPN(selectedSingleVendor?.CODE || '');
        }}
      >
        {/* <PartNumberSearch
          initialParams={{ partNumber: '' }}
          scroll={45}
          onRowClick={function (record: any, rowIndex?: any): void {
            setOpenVendorFind(false);
            handleSelect(record);
            setInitialPN(record.PART_NUMBER);
          }}
          isLoading={false}
          onRowSingleClick={function (record: any, rowIndex?: any): void {
            onSelectedVendor(record);
            setSecectedSingleVendor(record);
          }}
        /> */}
        <VendorSearchForm
          initialParams={{ partNumber: '' }}
          scroll={45}
          onRowClick={function (record: any, rowIndex?: any): void {
            setOpenVendorFind(false);
            handleSelect(record);
            setInitialPN(record.CODE);
            // form.setFields([{ name: 'SUPPLIES_CODE', value: record.CODE }]);
          }}
          isLoading={false}
          onRowSingleClick={function (record: any, rowIndex?: any): void {
            setSecectedSingleVendor(record);
            onSelectedVendor(record);
            // form.setFields([{ name: 'SUPPLIES_CODE', value: record.CODE }]);
          }}
        />
      </ModalForm>
    </div>
  );
};

export default ContextMenuVendorsSearchSelect;
