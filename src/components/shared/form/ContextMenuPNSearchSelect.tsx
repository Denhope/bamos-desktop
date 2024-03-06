import React, { FC, useEffect, useState, useCallback } from 'react';
import { ModalForm } from '@ant-design/pro-form';
import SearchSelect from './SearchSelect';
import ContextMenuWrapper from '../ContextMenuWrapperProps';
import { useAppDispatch } from '@/hooks/useTypedSelector';
import { getFilteredPartNumber } from '@/utils/api/thunks';
import { useTranslation } from 'react-i18next';
import PartNumberSearch from '@/components/store/search/PartNumberSearch';

interface ContextMenuSearchSelectProps {
  rules: Array<any>;
  name: string;
  isResetForm?: boolean;
  onSelectedPN: (PN: any) => void;
  initialFormPN: string;
  width: 'lg' | 'sm' | 'xs';
  disabled?: boolean;
  label: string;
}

const ContextMenuPNSearchSelect: FC<ContextMenuSearchSelectProps> = ({
  rules,
  name,
  isResetForm,
  initialFormPN,
  width,
  onSelectedPN,
  disabled,
  label,
}) => {
  const companyID = localStorage.getItem('companyID') || '';
  const dispatch = useAppDispatch();
  const [openStoreFindModal, setOpenStoreFind] = useState(false);
  const [selectedSinglePN, setSelectedSinglePN] = useState<any>();
  const [isReset, setIsReset] = useState(isResetForm || false);
  const [initialPN, setInitialPN] = useState<any>(initialFormPN);
  const { t } = useTranslation();

  useEffect(() => {
    if (initialFormPN) {
      setInitialPN(initialFormPN);
    }
  }, [initialFormPN]);
  useEffect(() => {
    if (isResetForm) {
      setIsReset(true);
      setTimeout(() => {
        setIsReset(false);
      }, 0);
    }
    setInitialPN('');
  }, [isResetForm]);

  const handleSearch = useCallback(
    async (value: any) => {
      if (value) {
        const result = await dispatch(
          getFilteredPartNumber({
            companyID: companyID,
            partNumber: value,
          })
        );

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
    },
    [dispatch, companyID]
  );

  const handleSelect = useCallback(
    (selectedOption: any) => {
      onSelectedPN(selectedOption);
      setSelectedSinglePN(selectedOption);
      // setIsReset(true);
      // setTimeout(() => setIsReset(false), 0);
    },
    [onSelectedPN]
  );

  const handleCopy = useCallback((target: EventTarget | null) => {
    const value = (target as HTMLDivElement).innerText;
    navigator.clipboard.writeText(value);
  }, []);

  const handleAdd = useCallback((target: EventTarget | null) => {
    const value = (target as HTMLDivElement).innerText;
    // Add your logic here
  }, []);

  const handleAddPick = useCallback((target: EventTarget | null) => {
    const value = (target as HTMLDivElement).innerText;
    // Add your logic here
  }, []);

  return (
    <div>
      <ContextMenuWrapper
        items={[
          {
            label: 'Copy',
            action: handleCopy,
          },
          {
            label: 'Open with',
            action: () => {},
            submenu: [
              { label: 'PART TRACKING', action: handleAdd },
              { label: 'PICKSLIP REQUEST', action: handleAddPick },
            ],
          },
        ]}
      >
        <SearchSelect
          disabled={disabled}
          width={width}
          initialValue={initialPN}
          onDoubleClick={() => {
            setOpenStoreFind(true);
          }}
          isReset={isReset}
          onSearch={handleSearch}
          optionLabel1="PART_NUMBER"
          optionLabel2="DESCRIPTION"
          onSelect={handleSelect}
          label={label}
          //
          tooltip={`${t('DOUBE CLICK OPEN PART No BOOK')}`}
          rules={rules}
          name={name}
        />
      </ContextMenuWrapper>

      <ModalForm
        width={'70vw'}
        open={openStoreFindModal}
        onOpenChange={setOpenStoreFind}
        onFinish={async function (record: any, rowIndex?: any): Promise<void> {
          setOpenStoreFind(false);
          handleSelect(selectedSinglePN);
          setInitialPN(selectedSinglePN?.PART_NUMBER || '');
        }}
      >
        <PartNumberSearch
          initialParams={{ partNumber: '' }}
          scroll={45}
          onRowClick={function (record: any, rowIndex?: any): void {
            setOpenStoreFind(false);
            handleSelect(record);
            setInitialPN(record.PART_NUMBER);
          }}
          isLoading={false}
          onRowSingleClick={function (record: any, rowIndex?: any): void {
            onSelectedPN(record);
            setSelectedSinglePN(record);
          }}
        />
      </ModalForm>
    </div>
  );
};

export default ContextMenuPNSearchSelect;
