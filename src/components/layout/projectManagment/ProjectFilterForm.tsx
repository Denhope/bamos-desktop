import ProForm, {
  FormInstance,
  ProFormSelect,
  ProFormText,
} from '@ant-design/pro-form';
import { Form } from 'antd';
import { useAppDispatch } from '@/hooks/useTypedSelector';
import React, { FC, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { getFilteredProjects } from '@/utils/api/thunks';
import ContextMenuProjectSearchSelect from '@/components/shared/form/ContextMenuProjectSearchSelect';
import ContextMenuPNSearchSelect from '@/components/shared/form/ContextMenuPNSearchSelect';
type ProjectFilterFormType = {
  onProjectSearch: (orders: any[] | []) => void;
};
const ProjectFilterForm: FC<ProjectFilterFormType> = ({ onProjectSearch }) => {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const [form] = Form.useForm();
  const formRef = useRef<FormInstance>(null);
  const handleKeyPress = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter') {
      formRef.current?.submit(); // вызываем метод submit формы при нажатии Enter
    }
  };
  const [selectedSingleProject, setSecectedSingleProject] = useState<any>();
  const [isResetForm, setIsResetForm] = useState<boolean>(false);
  const [initialForm, setinitialForm] = useState<any>('');
  const [selectedSinglePN, setSecectedSinglePN] = useState<any>();
  const [initialFormProject, setinitialFormProject] = useState<any>('');
  return (
    <div>
      <ProForm
        onReset={() => {
          setIsResetForm(true);
          setTimeout(() => {
            setIsResetForm(false);
          }, 0);
          setSecectedSingleProject(null);
          setinitialFormProject('');
          setinitialForm('');
          setSecectedSingleProject({ projectWO: '' });
        }}
        className="bg-white px-4 py-3 rounded-md border-gray-400"
        size="small"
        layout="horizontal"
        // labelCol={{ span: 12 }}
        formRef={formRef}
        form={form}
        onFinish={async (values) => {
          const currentCompanyID = localStorage.getItem('companyID') || '';
          const result = await dispatch(
            getFilteredProjects({
              companyID: currentCompanyID,
              planeNumber: values.planeNumber,
              status: values.projectState,
              projectType: values.projectType,
              projectWO: selectedSingleProject?.projectWO,
            })
          );
          if (result.meta.requestStatus === 'fulfilled') {
            onProjectSearch(result.payload || []);
          }
        }}
      >
        <ContextMenuProjectSearchSelect
          isResetForm={isResetForm}
          rules={[{ required: false }]}
          onSelectedProject={function (project: any): void {
            setSecectedSingleProject(project);
          }}
          name={'projectNumber'}
          initialForm={selectedSingleProject?.projectWO || initialFormProject}
          width={'lg'}
          label={`${t(`PROJECT`)}`}
        ></ContextMenuProjectSearchSelect>

        <ProFormSelect
          showSearch
          mode="multiple"
          name="projectType"
          label={t('PROJECT TYPE')}
          width="sm"
          tooltip={t('PROJECT TYPE')}
          valueEnum={{
            MAINTENANCE_AC_PROJECT: t('MAINTENANCE A/C'),
            REPAIR_AC_PROJECT: t('REPAIR A/C'),
            SERVICE_COMPONENT_PROJECT: t('COMPONENT SERVICE'),
            COMPONENT_REPAIR_PROJECT: t('COMPONENT REPAIR'),
            PRODUCTION_PROJECT: t('PRODUCTION'),
            PURCHASE_PROJECT: t('PURCHASE'),
            MINIMUM_SUPPLY_LIST: t('MINIMUM SUPPLY LIST'),
          }}
        />
        <ProFormText
          name="planeNumber"
          label="A/C REGISTRATION"
          width="sm"
          fieldProps={{
            // onDoubleClick: () => setOpenPickViewer(true),
            onKeyPress: handleKeyPress,
            autoFocus: true,
          }}
        />
        <ContextMenuPNSearchSelect
          label={t('PART No')}
          isResetForm={isResetForm}
          rules={[{ required: false }]}
          onSelectedPN={function (PN: any): void {
            setSecectedSinglePN(PN);
          }}
          name={'partNumber'}
          initialFormPN={selectedSinglePN?.PART_NUMBER || initialForm}
          width={'sm'}
        ></ContextMenuPNSearchSelect>
        <ProFormText
          name="serialNumber"
          label={t('SERIAL No')}
          width="sm"
          tooltip={t('SERIAL No')}
          fieldProps={{
            // onDoubleClick: () => setOpenPickViewer(true),
            onKeyPress: handleKeyPress,
          }}
        ></ProFormText>
        <ProFormSelect
          showSearch
          mode="multiple"
          name="projectState"
          label={t('PROJECT STATE')}
          width="sm"
          initialValue={['DRAFT', 'OPEN']}
          valueEnum={{
            DRAFT: { text: t('DRAFT'), status: 'DRAFT' },
            OPEN: { text: t('OPEN'), status: 'Processing' },
            inProgress: { text: t('PROGRESS'), status: 'PROGRESS' },
            PLANNED: { text: t('PLANNED'), status: 'Waiting' },
            COMPLETED: { text: t('COMPLETED'), status: 'Default' },
            CLOSED: { text: t('CLOSED'), status: 'SUCCESS' },
            CANCELLED: { text: t('CANCELLED'), status: 'Error' },
          }}
        />
      </ProForm>
    </div>
  );
};

export default ProjectFilterForm;
