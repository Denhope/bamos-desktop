import { ModalForm } from '@ant-design/pro-form';
import { FC, useCallback, useEffect, useState } from 'react';
import ContextMenuWrapper from '../ContextMenuWrapperProps';
import SearchSelect from './SearchSelect';
import { useAppDispatch } from '@/hooks/useTypedSelector';
import { getFilteredShops } from '@/utils/api/thunks';
import { useTranslation } from 'react-i18next';
import SearchTable from '@/components/layout/SearchElemTable';
import { ProCard } from '@ant-design/pro-components';

interface ContextMenuLocationSearchSelectProps {
  rules: Array<any>;
  name: string;
  isResetForm?: boolean;
  onSelectedLocation: (record: any) => void;
  initialFormStore: string;
  locations: any;
}
const ContextMenuLocationSearchSelect: FC<
  ContextMenuLocationSearchSelectProps
> = ({
  rules,
  name,
  isResetForm,
  initialFormStore,
  locations,

  onSelectedLocation,
}) => {
  const [openLocationFind, setOpenLocationFind] = useState(false);
  const [selectedSingleLocation, setSecectedSingleLocation] = useState<any>();

  const [isReset, setIsReset] = useState(isResetForm || false);

  const handleSelect = useCallback(
    (selectedOption: any) => {
      onSelectedLocation(selectedOption);
      setSecectedSingleLocation(selectedOption);
      // setIsReset(true);
      // setTimeout(() => setIsReset(false), 0);
    },
    [onSelectedLocation]
  );
  const handleCopy = (target: EventTarget | null) => {
    const value = (target as HTMLDivElement).innerText;
    navigator.clipboard.writeText(value);
  };

  const [initialStore, setInitialStore] = useState(initialFormStore);

  const { t } = useTranslation();
  useEffect(() => {
    if (initialFormStore) {
      setInitialStore(initialFormStore);
      // onFilterTransferprojects(form.getFieldsValue());
    }
  }, [initialFormStore]);
  useEffect(() => {
    if (isResetForm) {
      setIsReset(true);

      setTimeout(() => {
        setIsReset(false);
      }, 0);
    }
    setInitialStore('');
  }, [isResetForm]);

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
          width="sm"
          initialValue={initialStore}
          onDoubleClick={() => {
            setOpenLocationFind(true);
          }}
          isReset={isReset}
          onSearch={locations}
          // data={locations}
          optionLabel1="locationName"
          onSelect={handleSelect}
          label={`${t('LOCATION')}`}
          tooltip={`${t('DOUBE CLICK OPEN STORE BOOK')}`}
          rules={rules}
          name={name}
        />
      </ContextMenuWrapper>

      <ModalForm
        width={'70vw'}
        open={openLocationFind}
        onOpenChange={setOpenLocationFind}
        onFinish={async function (record: any, rowIndex?: any): Promise<void> {
          setOpenLocationFind(false);
          handleSelect(selectedSingleLocation);
          setInitialStore(selectedSingleLocation?.shopShortName || '');
        }}
      >
        <ProCard
          className="flex mx-auto justify-center align-middle"
          style={{}}
        >
          {locations && (
            <SearchTable
              data={locations}
              onRowClick={function (record: any, rowIndex?: any): void {
                onSelectedLocation(record);
                setOpenLocationFind(false);
              }}
              onRowSingleClick={function (record: any, rowIndex?: any): void {
                setSecectedSingleLocation(record);
              }}
            ></SearchTable>
          )}
        </ProCard>
      </ModalForm>
    </div>
  );
};

export default ContextMenuLocationSearchSelect;
