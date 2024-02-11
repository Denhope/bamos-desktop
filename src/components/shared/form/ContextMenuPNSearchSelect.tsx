import PartNumberSearch from '@/components/store/search/PartNumberSearch';
import { ModalForm } from '@ant-design/pro-form';
import { FC, useEffect, useState } from 'react';
import ContextMenuWrapper from '../ContextMenuWrapperProps';
import SearchSelect from './SearchSelect';
import { useAppDispatch } from '@/hooks/useTypedSelector';
import { getFilteredPartNumber } from '@/utils/api/thunks';
import { useTranslation } from 'react-i18next';

interface ContextMenuSearchSelectProps {
  rules: Array<any>;
  name: string;
  isResetForm?: boolean;
  onSelectedPN: (PN: any) => void;
  initialFormPN: string;
  width: 'lg' | 'sm' | 'xs';
}
const ContextMenuPNSearchSelect: FC<ContextMenuSearchSelectProps> = ({
  rules,
  name,
  isResetForm,
  initialFormPN,
  width,
  onSelectedPN,
}) => {
  const companyID = localStorage.getItem('companyID') || '';
  const dispatch = useAppDispatch();
  const [openStoreFindModal, setOpenStoreFind] = useState(false);
  const [selectedSinglePN, setSecectedSinglePN] = useState<any>();

  const [isReset, setIsReset] = useState(isResetForm || false);

  const handleSearch = async (value: any) => {
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
  };
  const handleSelect = (selectedOption: any) => {
    onSelectedPN(selectedOption);
    setIsReset(true); // затем обратно в true
    setIsReset(false); // сначала установите в false
  };
  const handleCopy = (target: EventTarget | null) => {
    const value = (target as HTMLDivElement).innerText;
    navigator.clipboard.writeText(value);
  };

  const handleAdd = (target: EventTarget | null) => {
    const value = (target as HTMLDivElement).innerText;
  };

  const handleAddPick = (target: EventTarget | null) => {
    const value = (target as HTMLDivElement).innerText;
  };

  const [initialPN, setInitialPN] = useState(initialFormPN);

  const { t } = useTranslation();
  useEffect(() => {
    if (initialFormPN) {
      setInitialPN(initialFormPN);
    }
  }, [initialFormPN]);
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
              { label: 'Part Tracking', action: handleAdd },
              { label: 'PickSlip Request', action: handleAddPick },
            ],
          },
        ]}
      >
        <SearchSelect
          width={width}
          initialValue={initialFormPN}
          onDoubleClick={() => {
            setOpenStoreFind(true);
          }}
          isReset={isReset}
          onSearch={handleSearch}
          optionLabel1="PART_NUMBER"
          optionLabel2="DESCRIPTION"
          onSelect={handleSelect}
          label={`${t('PART NUMBER')}`}
          tooltip={`${t('DOUBE CLICK OPEN PART NUMBER BOOK')}`}
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
            setSecectedSinglePN(record);
          }}
        />
      </ModalForm>
    </div>
  );
};

export default ContextMenuPNSearchSelect;
