// @ts-nocheck
import React, { FC, useRef, useState } from 'react';
import {
  ProForm,
  ProFormDateRangePicker,
  ProFormSelect,
  ProFormText,
  ProFormDatePicker,
  ProFormGroup,
} from '@ant-design/pro-components';
import { Form, FormInstance, Row, Col } from 'antd';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { resetFormValues, setFormValues } from '@/store/reducers/formSlice';
import { useGetSkillsQuery } from '@/features/userAdministration/skillApi';
import { useGetFilteredZonesQuery } from '@/features/zoneAdministration/zonesApi';
import { useGetPlanesQuery } from '@/features/acAdministration/acApi';
import { useGetfilteredWOQuery } from '@/features/wpAdministration/wpApi';
import { useGetProjectsQuery } from '@/features/projectAdministration/projectsApi';
import { useGetFilteredRestrictionsQuery } from '@/features/restrictionAdministration/restrictionApi';
import { useGetAccessCodesQuery } from '@/features/accessAdministration/accessApi';
import { getDefectTypes, getAtaChapters } from '@/services/utilites';
import { useGetStoresQuery } from '@/features/storeAdministration/StoreApi';
import { useGetGroupUsersQuery } from '@/features/userAdministration/userApi';
import ContextMenuPNSearchSelect from '@/components/shared/form/ContextMenuPNSearchSelect';

interface ReportFormProps {
  onReportSearch: (values: any) => void;
  formKey: string;
}

// Общие стили для всех ProForm компонентов
const formItemStyles = {
  margin: '4px 0', // Минимальные отступы
};

const formItemLayout = {
  labelCol: { flex: '100px' }, // Фиксированная ширина для лейблов
  wrapperCol: { flex: 'auto' },
};

const ReportForm: FC<ReportFormProps> = ({ onReportSearch, formKey }) => {
  const formRef = useRef<FormInstance>(null);
  const [form] = Form.useForm();
  const dispatch = useDispatch();
  const { t } = useTranslation();
  const formValues = useSelector((state: any) => state.form[formKey] || {});

  const [WOID, setWOID] = useState<string | null>(null);
  const [reportType, setReportType] = useState<string>('defects');
  const [selectedSinglePN, setSelectedSinglePN] = useState<any>(null);

  const { data: skills } = useGetSkillsQuery({});
  const { data: zones } = useGetFilteredZonesQuery({});
  const { data: planes } = useGetPlanesQuery({});
  const { data: wp } = useGetfilteredWOQuery({});
  const { data: projects } = useGetProjectsQuery(
    { WOReferenceID: WOID || undefined },
    { skip: !WOID }
  );
  const { data: restriction } = useGetFilteredRestrictionsQuery({});
  const { data: accessesData } = useGetAccessCodesQuery({});
  const { data: stores } = useGetStoresQuery({});
  const { data: usersGroups } = useGetGroupUsersQuery({});

  const neededCodesValueEnum =
    usersGroups?.reduce((acc: Record<string, string>, group: any) => {
      acc[group.id] = group.title;
      return acc;
    }, {}) || {};

  const handleReset = () => {
    form.resetFields();
    dispatch(resetFormValues({ formKey }));
  };

  const onFinish = async (values: any) => {
    onReportSearch({ ...values, reportType });
  };

  const skillOptions =
    skills?.map((skill: any) => ({
      label: skill?.code,
      value: skill?.id,
    })) || [];

  const zonesValueEnum =
    zones?.reduce((acc: any, zone: any) => {
      acc[zone?.id || zone?._id] =
        zone?.areaNbr || zone?.subZoneNbr || zone?.majoreZoneNbr;
      return acc;
    }, {}) || {};

  const planesValueEnum =
    planes?.reduce((acc: any, plane: any) => {
      if (plane?.acTypeID && plane.acTypeID.length > 0) {
        acc[plane.id] = { text: plane.regNbr, value: plane.acTypeID[0] };
      } else {
        acc[plane.id] = { text: plane.regNbr, value: '' };
      }
      return acc;
    }, {}) || {};

  const wpValueEnum =
    wp?.reduce((acc: any, item: any) => {
      if (item._id && item?.WOName) {
        acc[item._id] = `№:${item?.WONumber}/${String(
          item?.WOName
        ).toUpperCase()}`;
      }
      return acc;
    }, {}) || {};

  const projectsValueEnum =
    projects?.reduce((acc: any, project: any) => {
      acc[project?._id] = `№:${project?.projectWO} / ${project.projectName}`;
      return acc;
    }, {}) || {};

  const restrictionValueEnum =
    restriction?.reduce((acc: any, item: any) => {
      acc[item.id || item._id] = `${item.code}`;
      return acc;
    }, {}) || {};

  const accessCodesValueEnum =
    accessesData?.reduce((acc: any, item: any) => {
      acc[item.id] = item.accessNbr;
      return acc;
    }, {}) || {};

  const defectTypeOptions = getDefectTypes(t);
  const ataChapterOptions = getAtaChapters(t);

  const renderFormFields = () => {
    switch (reportType) {
      case 'defects':
      case 'tasks':
      case 'time':
        return (
          <>
            <ProFormText
              name="projectTaskWO"
              label={t('TRACE No')}
              fieldProps={{ style: { width: '100%' } }}
            />

            <ProFormSelect
              showSearch
              name="WOReferenceID"
              label={t('WO')}
              valueEnum={wpValueEnum}
              onChange={(value: any) => setWOID(value)}
              rules={[{ required: true, message: t('Please select WO') }]}
              fieldProps={{ style: { width: '100%' } }}
            />

            <ProFormSelect
              mode="multiple"
              showSearch
              name="projectID"
              label={t('WP TITLE')}
              valueEnum={projectsValueEnum}
              disabled={!WOID}
              fieldProps={{ style: { width: '100%' } }}
            />

            <ProFormSelect
              mode="multiple"
              name="zonesID"
              label={t('ZONES')}
              valueEnum={zonesValueEnum}
              fieldProps={{ style: { width: '100%' } }}
            />

            <ProFormSelect
              mode="multiple"
              name="planeId"
              label={t('AC REG')}
              valueEnum={planesValueEnum}
              fieldProps={{ style: { width: '100%' } }}
            />

            <ProFormSelect
              mode="multiple"
              name="restrictionID"
              label={t('RESTRICTION')}
              valueEnum={restrictionValueEnum}
              fieldProps={{ style: { width: '100%' } }}
            />

            <ProFormSelect
              mode="multiple"
              name="accessID"
              label={t('ACCESS')}
              valueEnum={accessCodesValueEnum}
              fieldProps={{ style: { width: '100%' } }}
            />

            <ProFormSelect
              mode="multiple"
              name="defectCodeID"
              label={t('DEFECT TYPE')}
              options={defectTypeOptions}
              fieldProps={{ style: { width: '100%' } }}
            />

            <ProFormSelect
              mode="multiple"
              name="ata"
              label={t('ATA CHAPTER')}
              options={ataChapterOptions}
              fieldProps={{ style: { width: '100%' } }}
            />

            <ProFormSelect
              mode="multiple"
              name="projectItemType"
              label={t('TASK TYPE')}
              valueEnum={{
                RC: {
                  text: t(
                    'TC (MPD, Customer MP, Access, CDCCL, ALI, STR inspection)'
                  ),
                },
                CR_TASK: { text: t('CR TASK (CRITICAL TASK/DI)') },
                NRC: { text: t('NRC (Defect)') },
                NRC_ADD: { text: t('ADHOC(Adhoc Task)') },
                MJC: { text: t('MJC (Extended MPD)') },
                CMJC: { text: t('CMJC (Component maintenance)') },
                FC: { text: t('FC (Fabrication card)') },
                HARD_ACCESS: { text: t('HARD_ACCESS') },
              }}
              fieldProps={{ style: { width: '100%' } }}
            />
          </>
        );
      case 'materials':
        return (
          <>
            <ProFormSelect
              showSearch
              name="WOReferenceID"
              label={t('WP No')}
              rules={[{ required: true, message: t('Please select WO') }]}
              valueEnum={wpValueEnum}
              onChange={(value: any) => setWOID(value)}
              fieldProps={{ style: { width: '100%' } }}
            />

            <ProFormSelect
              mode="multiple"
              showSearch
              name="projectID"
              rules={[{ required: true, message: t('Please select WP') }]}
              label={t('WP TITLE')}
              valueEnum={projectsValueEnum}
              disabled={!WOID}
              fieldProps={{ style: { width: '100%' } }}
            />

            <ProFormSelect
              showSearch
              name="neededOnID"
              label={t('NEEDED ON')}
              valueEnum={neededCodesValueEnum}
              fieldProps={{ style: { width: '100%' } }}
            />

            <ProFormText
              name="pickSlipNumberNew"
              label={t('PICKSLIP No')}
              fieldProps={{ style: { width: '100%' } }}
            />

            <ContextMenuPNSearchSelect
              onSelectedPN={(PN: any) => setSelectedSinglePN(PN)}
              name="partNumber"
              label={t('PART No')}
              rules={[]}
              initialFormPN={''}
              fieldProps={{ style: { width: '100%' } }}
            />
          </>
        );
      case 'daily':
        return (
          <>
            <ProFormSelect
              showSearch
              name="WOReferenceID"
              label={t('WO')}
              valueEnum={wpValueEnum}
              rules={[
                { required: true, message: t('Please select a Work Order') },
              ]}
              fieldProps={{ style: { width: '100%' } }}
            />

            <ProFormDatePicker
              name="reportDate"
              label={t('Report Date')}
              rules={[{ required: true, message: t('Please select a date') }]}
              fieldProps={{ style: { width: '100%' } }}
            />
          </>
        );
      case 'wpss':
        return (
          <>
            <ProFormSelect
              showSearch
              name="WOReferenceID"
              label={t('WO')}
              valueEnum={wpValueEnum}
              onChange={(value: any) => setWOID(value)}
              rules={[
                { required: true, message: t('Please select a Work Order') },
              ]}
              fieldProps={{ style: { width: '100%' } }}
            />

            <ProFormSelect
              showSearch
              name="projectID"
              label={t('WP TITLE')}
              valueEnum={projectsValueEnum}
              disabled={!WOID}
              rules={[
                { required: true, message: t('Please select a Work Order') },
              ]}
              fieldProps={{ style: { width: '100%' } }}
            />
          </>
        );
      default:
        return null;
    }
  };

  return (
    <ProForm
      formRef={formRef}
      onValuesChange={(changedValues, allValues) => {
        if (changedValues.reportType) {
          setReportType(changedValues.reportType);
        }
        dispatch(setFormValues({ formKey, values: allValues }));
      }}
      layout="horizontal"
      labelAlign="left"
      size="small"
      onReset={handleReset}
      form={form}
      onFinish={onFinish}
      submitter={{
        render: (props, dom) => (
          <div className="flex justify-end gap-2 mt-4">{dom}</div>
        ),
      }}
      grid={true}
      rowProps={{
        gutter: [8, 0],
      }}
      colProps={{
        span: 24,
      }}
      labelCol={{ flex: '120px' }}
      wrapperCol={{ flex: 'auto' }}
      style={{
        // background: '#fff',
        padding: '16px',
        // borderRadius: '8px',
      }}
    >
      <ProFormSelect
        name="reportType"
        label={t('REPORT TYPE')}
        options={[
          { value: 'daily', label: t('DAILY REPORT') },
          { value: 'wpss', label: t('WPSS REPORT') },
          { value: 'tasks', label: t('TASKS REPORT') },
          { value: 'materials', label: t('MATERIALS REPORT') },
        ]}
        rules={[{ required: true, message: t('Please select report type') }]}
        fieldProps={{
          style: { width: '100%' },
        }}
      />

      {renderFormFields()}
    </ProForm>
  );
};

export default ReportForm;
