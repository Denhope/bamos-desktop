// @ts-nocheck
import React, { FC, useRef, useState } from 'react';
import {
  ProForm,
  ProFormDateRangePicker,
  ProFormSelect,
  ProFormText,
  ProFormDatePicker,
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
  const { data: projects } = useGetProjectsQuery({ WOReferenceID: WOID||undefined }, { skip: !WOID });
  const { data: restriction } = useGetFilteredRestrictionsQuery({});
  const { data: accessesData } = useGetAccessCodesQuery({});
  const { data: stores } = useGetStoresQuery({});
  const { data: usersGroups } = useGetGroupUsersQuery({});

  const neededCodesValueEnum = usersGroups?.reduce((acc: Record<string, string>, group: any) => {
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

  const skillOptions = skills?.map((skill: any) => ({
    label: skill?.code,
    value: skill?.id,
  })) || [];

  const zonesValueEnum = zones?.reduce((acc: any, zone: any) => {
    acc[zone?.id || zone?._id] = zone?.areaNbr || zone?.subZoneNbr || zone?.majoreZoneNbr;
    return acc;
  }, {}) || {};

  const planesValueEnum = planes?.reduce((acc: any, plane: any) => {
    if (plane?.acTypeID && plane.acTypeID.length > 0) {
      acc[plane.id] = { text: plane.regNbr, value: plane.acTypeID[0] };
    } else {
      acc[plane.id] = { text: plane.regNbr, value: '' };
    }
    return acc;
  }, {}) || {};

  const wpValueEnum = wp?.reduce((acc: any, item: any) => {
    if (item._id && item?.WOName) {
      acc[item._id] = `№:${item?.WONumber}/${String(item?.WOName).toUpperCase()}`;
    }
    return acc;
  }, {}) || {};

  const projectsValueEnum = projects?.reduce((acc: any, project: any) => {
    acc[project?._id] = `№:${project?.projectWO} / ${project.projectName}`;
    return acc;
  }, {}) || {};

  const restrictionValueEnum = restriction?.reduce((acc: any, item: any) => {
    acc[item.id || item._id] = `${item.code}`;
    return acc;
  }, {}) || {};

  const accessCodesValueEnum = accessesData?.reduce((acc: any, item: any) => {
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
            <Row gutter={16}>
              <Col span={12}>
                <ProFormText name="projectTaskWO" label={t('TRACE No')} width="lg" />
              </Col>
              <Col span={12}>
                <ProFormSelect
                  showSearch
                  name="WOReferenceID"
                  rules={[{ required: true, message: t('Please select WO') }]}
                  label={t('WO')}
                  width="lg"
                  valueEnum={wpValueEnum}
                  onChange={(value: any) => setWOID(value)}
                />
              </Col>
            </Row>
            <Row gutter={16}>
              <Col span={12}>
                <ProFormSelect
                  mode="multiple"
                  showSearch
                  name="projectID"
                  label={t('WP TITLE')}
                  width="lg"
                  valueEnum={projectsValueEnum}
                  disabled={!WOID}
                />
              </Col>
              {/* <Col span={12}>
                <ProFormSelect
                  mode="multiple"
                  name="status"
                  label={t('TASK STATUS')}
                  width="lg"
                  valueEnum={{
                    closed: { text: t('CLOSE'), status: 'SUCCESS' },
                    inspect: { text: t('INSPECTION'), status: 'inspect' },
                    nextAction: { text: t('NEXT ACTION'), status: 'PROGRESS' },
                    inProgress: { text: t('IN PROGRESS'), status: 'PROGRESS' },
                    test: { text: t('TEST'), status: 'Processing' },
                    open: { text: t('OPEN'), status: 'Processing' },
                    cancelled: { text: t('CANCEL'), status: 'Error' },
                  }}
                />
              </Col> */}
            </Row>
            <Row gutter={16}>
              {/* <Col span={12}>
                <ProFormDateRangePicker
                  name="dateRange"
                  label={t('DATE RANGE')}
                  width="lg"
                  // rules={[{ required: true, message: t('Please select date range') }]}
                />
              </Col> */}
              {/* <Col span={12}>
                <ProFormSelect
                  mode="multiple"
                  name="skillID"
                  label={t('SKILL CODE')}
                  width="lg"
                  options={skillOptions}
                />
              </Col> */}
            </Row>
            <Row gutter={16}>
              <Col span={12}>
                <ProFormSelect
                  mode="multiple"
                  name="zonesID"
                  label={t('ZONES')}
                  width="lg"
                  valueEnum={zonesValueEnum}
                />
              </Col>
              <Col span={12}>
                <ProFormSelect
                  mode="multiple"
                  name="planeId"
                  label={t('AC REG')}
                  width="lg"
                  valueEnum={planesValueEnum}
                />
              </Col>
            </Row>
            <Row gutter={16}>
              <Col span={12}>
                <ProFormSelect
                  mode="multiple"
                  name="restrictionID"
                  label={t('RESTRICTION')}
                  width="lg"
                  valueEnum={restrictionValueEnum}
                />
              </Col>
              <Col span={12}>
                <ProFormSelect
                  mode="multiple"
                  name="accessID"
                  label={t('ACCESS')}
                  width="lg"
                  valueEnum={accessCodesValueEnum}
                />
              </Col>
            </Row>
            <Row gutter={16}>
              <Col span={12}>
                <ProFormSelect
                  mode="multiple"
                  name="defectCodeID"
                  label={t('DEFECT TYPE')}
                  width="lg"
                  options={defectTypeOptions}
                />
              </Col>
              <Col span={12}>
                <ProFormSelect
                  mode="multiple"
                  name="ata"
                  label={t('ATA CHAPTER')}
                  width="lg"
                  options={ataChapterOptions}
                />
              </Col>
            </Row>
            <Row gutter={16}>
              <Col span={24}>
                <ProFormSelect
                  mode="multiple"
                  name="projectItemType"
                  label={t('TASK TYPE')}
                  width="lg"
                  valueEnum={{
                    RC: { text: t('TC (MPD, Customer MP, Access, CDCCL, ALI, STR inspection)') },
                    CR_TASK: { text: t('CR TASK (CRITICAL TASK/DI)') },
                    NRC: { text: t('NRC (Defect)') },
                    NRC_ADD: { text: t('ADHOC(Adhoc Task)') },
                    MJC: { text: t('MJC (Extended MPD)') },
                    CMJC: { text: t('CMJC (Component maintenance)') },
                    FC: { text: t('FC (Fabrication card)') },
                    HARD_ACCESS: { text: t('HARD_ACCESS') },
                  }}
                />
              </Col>
            </Row>
          </>
        );
      case 'materials':
        return (
          <>
            <Row gutter={16}>
              <Col span={12}>
                <ProFormSelect
                  showSearch
                  name="WOReferenceID"
                  label={t('WP No')}
                  width="lg"
                  valueEnum={wpValueEnum}
                  onChange={(value: any) => setWOID(value)}
                />
              </Col>
              <Col span={12}>
                <ProFormSelect
                  mode="multiple"
                  showSearch
                  name="projectID"
                  label={t('WP TITLE')}
                  width="lg"
                  valueEnum={projectsValueEnum}
                  disabled={!WOID}
                />
              </Col>
            </Row>
            <Row gutter={16}>
              <Col span={12}>
                <ProFormSelect
                  showSearch
                  name="neededOnID"
                  label={t('NEEDED ON')}
                  width="lg"
                  valueEnum={neededCodesValueEnum}
                />
              </Col>
              <Col span={12}>
                <ProFormText name="pickSlipNumberNew" label={t('PICKSLIP No')} width="lg" />
              </Col>
            </Row>
            <Row gutter={16}>
              <Col span={24}>
                <ContextMenuPNSearchSelect
                  onSelectedPN={(PN: any) => setSelectedSinglePN(PN)}
                  name="partNumber"
                  width="lg"
                  label={t('PART No')} rules={[]} initialFormPN={''}                />
              </Col>
            </Row>
          </>
        );
      case 'daily':
        return (
          <>
            <Row gutter={16}>
              <Col span={12}>
                <ProFormSelect
                  showSearch
                  name="WOReferenceID"
                  label={t('WO')}
                  width="lg"
                  valueEnum={wpValueEnum}
                  rules={[{ required: true, message: t('Please select a Work Order') }]}
                />
              </Col>
              <Col span={12}>
                <ProFormDatePicker
                  name="reportDate"
                  label={t('Report Date')}
                  width="lg"
                  rules={[{ required: true, message: t('Please select a date') }]}
                />
              </Col>
            </Row>
          </>
        );
      case 'workorder':
        return (
          <>
            <Row gutter={16}>
              <Col span={12}>
                <ProFormSelect
                  showSearch
                  name="WOReferenceID"
                  label={t('WO')}
                  width="lg"
                  valueEnum={wpValueEnum}
                  onChange={(value: any) => setWOID(value)}
                  rules={[{ required: true, message: t('Please select a Work Order') }]}
                />
              </Col>
              <Col span={12}>
                <ProFormDateRangePicker
                  name="dateRange"
                  label={t('Date Range')}
                  width="lg"
                  rules={[{ required: true, message: t('Please select a date range') }]}
                />
              </Col>
            </Row>
            {/* Добавьте дополнительные фильтры для Workorder Report, если необходимо */}
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
      layout="vertical"
      size="small"
      onReset={handleReset}
      form={form}
      onFinish={onFinish}
      style={{ 
        height: '100%', 
        display: 'flex', 
        flexDirection: 'column',
        padding: '20px', 
        background: '#f0f2f5', 
        borderRadius: '8px',
        overflow: 'auto'
      }}
    >
      <div style={{ flex: 1, width: '100%' }}>
        <Row gutter={16}>
          <Col xs={24} sm={24} md={24} lg={24} xl={24}>
            <ProFormSelect
              name="reportType"
              label={t('REPORT TYPE')}
              style={{ width: '100%' }}
              options={[
                // { value: 'defects', label: t('DEFECTS REPORT') },
                { value: 'tasks', label: t('TASKS REPORT') },
                // { value: 'time', label: t('TIME REPORT') },
                // { value: 'materials', label: t('MATERIALS REPORT') },
                { value: 'daily', label: t('DAILY REPORT') },
                // { value: 'workorder', label: t('WORKORDER REPORT') },
              ]}
              rules={[{ required: true, message: t('Please select report type') }]}
            />
          </Col>
        </Row>
        {renderFormFields()}
      </div>
    </ProForm>
  );
};

export default ReportForm;