import { ModalForm } from '@ant-design/pro-form';
import { FC, useEffect, useState } from 'react';
import ContextMenuWrapper from '../ContextMenuWrapperProps';
import SearchSelect from './SearchSelect';
import { useAppDispatch } from '@/hooks/useTypedSelector';
import { getFilteredShops } from '@/utils/api/thunks';
import { useTranslation } from 'react-i18next';
import SearchTable from '@/components/layout/SearchElemTable';
import { ProCard } from '@ant-design/pro-components';

interface ContextMenuSearchSelectProps {
  rules: Array<any>;
  name: string;
  isResetForm?: boolean;
  onSelectedStore: (record: any) => void;
  initialFormStore: string;
}
const ContextMenuStoreSearchSelect: FC<ContextMenuSearchSelectProps> = ({
  rules,
  name,
  isResetForm,
  initialFormStore,

  onSelectedStore,
}) => {
  const companyID = localStorage.getItem('companyID') || '';
  const dispatch = useAppDispatch();
  const [openStoreFindStore, setOpenStoreFind] = useState(false);
  const [selectedSingleStore, setSecectedSingleStore] = useState<any>();

  const [isReset, setIsReset] = useState(isResetForm || false);

  const handleSearch = async (value: any) => {
    if (companyID) {
      const result = await dispatch(
        getFilteredShops({
          companyID: companyID,
          shopShortName: value,
        })
      );

      return result;
    }
  };
  const handleSelect = (selectedOption: any) => {
    onSelectedStore(selectedOption);
    setIsReset(true); // затем обратно в true
    setIsReset(false); // сначала установите в false
  };
  const handleCopy = (target: EventTarget | null) => {
    const value = (target as HTMLDivElement).innerText;
    navigator.clipboard.writeText(value);
  };

  const [initialStore, setInitialStore] = useState(initialFormStore);
  const [APN, setAPN] = useState([]);

  const { t } = useTranslation();
  useEffect(() => {
    if (initialFormStore) {
      setInitialStore(initialFormStore);
      // onFilterTransferprojects(form.getFieldsValue());
    }
  }, [initialFormStore]);
  const [openStoreViewer, setOpenStoreViewer] = useState<boolean>(false);
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
          initialValue={initialFormStore}
          onDoubleClick={() => {
            setOpenStoreFind(true);
            setOpenStoreViewer(true);
          }}
          isReset={isReset}
          onSearch={handleSearch}
          optionLabel1="shopShortName"
          onSelect={handleSelect}
          label={`${t('STORE')}`}
          tooltip={`${t('DOUBE CLICK OPEN STORE BOOK')}`}
          rules={rules}
          name={name}
        />
      </ContextMenuWrapper>

      <ModalForm
        width={'70vw'}
        open={openStoreFindStore}
        onOpenChange={setOpenStoreFind}
        onFinish={async function (record: any, rowIndex?: any): Promise<void> {
          setOpenStoreFind(false);
          handleSelect(selectedSingleStore);
          setInitialStore(selectedSingleStore?.shopShortName || '');
        }}
      >
        <ProCard
          className="flex mx-auto justify-center align-middle"
          style={{}}
        >
          {APN && (
            <SearchTable
              data={APN}
              onRowClick={function (record: any, rowIndex?: any): void {
                onSelectedStore(record);
                setOpenStoreViewer(false);
                handleSelect(record);
                setInitialStore(selectedSingleStore?.shopShortName || '');
              }}
              onRowSingleClick={function (record: any, rowIndex?: any): void {
                setSecectedSingleStore(record);
                onSelectedStore(record);
              }}
            ></SearchTable>
          )}
        </ProCard>
      </ModalForm>
    </div>
  );
};

export default ContextMenuStoreSearchSelect;