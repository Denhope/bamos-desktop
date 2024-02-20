import PartNumberSearch from '@/components/store/search/PartNumberSearch';
import { ModalForm } from '@ant-design/pro-form';
import { FC, useEffect, useState } from 'react';
import ContextMenuWrapper from '../ContextMenuWrapperProps';
import SearchSelect from './SearchSelect';
import { useAppDispatch } from '@/hooks/useTypedSelector';
import { getFilteredProjects, getFilteredVendors } from '@/utils/api/thunks';
import { useTranslation } from 'react-i18next';

import ProjectViewer from '@/components/layout/APN/ProjectViewer';

interface ContextMenuVendorsSelectProps {
  rules: Array<any>;
  name: string;
  isResetForm?: boolean;
  onSelectedProject: (vendor: any) => void;
  initialForm: string;
  width: 'lg' | 'sm' | 'xs';
  label: string;
  disabled?: boolean;
}
const ContextMenuProjectSearchSelect: FC<ContextMenuVendorsSelectProps> = ({
  rules,
  name,
  isResetForm,
  initialForm,
  width,
  label,
  disabled,

  onSelectedProject,
}) => {
  const companyID = localStorage.getItem('companyID') || '';
  const dispatch = useAppDispatch();
  const [openProjectFindModal, setOpenProjectFind] = useState(false);
  const [selectedSingleProject, setSecectedSingleProject] = useState<any>();

  const [isReset, setIsReset] = useState(isResetForm || false);

  const handleSearch = async (value: any) => {
    if (companyID) {
      const result = await dispatch(
        getFilteredProjects({
          companyID: companyID,
          code: value,
        })
      );

      return result;
    }
  };
  const handleSelect = (selectedOption: any) => {
    onSelectedProject(selectedOption);
    setIsReset(true); // затем обратно в true
    setIsReset(false); // сначала установите в false
  };
  const handleCopy = (target: EventTarget | null) => {
    const value = (target as HTMLDivElement).innerText;
    navigator.clipboard.writeText(value);
  };

  const [initialValue, setInitialValue] = useState(initialForm);

  const { t } = useTranslation();
  useEffect(() => {
    if (initialForm) {
      setInitialValue(initialForm);
    }
  }, [initialForm]);
  useEffect(() => {
    if (isResetForm) {
      setIsReset(true);

      setTimeout(() => {
        setIsReset(false);
      }, 0);
    }
    setInitialValue('');
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
          disabled={disabled}
          width={width}
          initialValue={initialValue}
          onDoubleClick={() => {
            setOpenProjectFind(true);
          }}
          isReset={isReset}
          onSearch={handleSearch}
          optionLabel1="projectWO"
          optionLabel2="projectName"
          onSelect={handleSelect}
          label={label}
          tooltip={`${t('DOUBE CLICK OPEN PROJECT  BOOK')}`}
          rules={rules}
          name={name}
        />
      </ContextMenuWrapper>

      <ModalForm
        width={'70vw'}
        open={openProjectFindModal}
        onOpenChange={setOpenProjectFind}
        onFinish={async function (record: any, rowIndex?: any): Promise<void> {
          setOpenProjectFind(false);
          handleSelect(selectedSingleProject);
          setInitialValue(selectedSingleProject?.projectWO || '');
        }}
      >
        <ProjectViewer
          onDoubleClick={function (record: any, rowIndex?: any): void {
            setOpenProjectFind(false);
            handleSelect(record);
            setInitialValue(record.projectWO);
            setSecectedSingleProject(record);
            // form.setFields([{ name: 'SUPPLIES_CODE', value: record.CODE }]);
          }}
          // isLoading={false}
          onSingleRowClick={function (record: any, rowIndex?: any): void {
            setSecectedSingleProject(record);
            onSelectedProject(record);
            // setInitialValue(record?.projectWO || '');
            // form.setFields([{ name: 'SUPPLIES_CODE', value: record.CODE }]);
          }}
        />
      </ModalForm>
    </div>
  );
};

export default ContextMenuProjectSearchSelect;
