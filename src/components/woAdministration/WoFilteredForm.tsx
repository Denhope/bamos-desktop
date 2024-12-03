// @ts-nocheck

import {
  ProForm,
  ProFormDateRangePicker,
  ProFormSelect,
  ProFormText,
} from '@ant-design/pro-components';
import { useGetFilteredZonesQuery } from '@/features/zoneAdministration/zonesApi';
import {
  DatePickerProps,
  Form,
  FormInstance,
  message,
  Checkbox,
  notification,
} from 'antd';
import { RangePickerProps } from 'antd/es/date-picker';
import { useGetStoresQuery } from '@/features/storeAdministration/StoreApi';
import React, { FC, useEffect, useRef, useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useGetAccessCodesQuery } from '@/features/accessAdministration/accessApi';
import { useGetGroupUsersQuery } from '@/features/userAdministration/userApi';
import { useGetProjectTypesQuery } from '../projectTypeAdministration/projectTypeApi';
import { useGetProjectsQuery } from '@/features/projectAdministration/projectsApi';
// import { useGetPlanesQuery } from '@/features/ACAdministration/acApi';
import { useGetPlanesQuery } from '@/features/acAdministration/acApi';
import { useGetFilteredRestrictionsQuery } from '@/features/restrictionAdministration/restrictionApi';
import { useGetSkillsQuery } from '@/features/userAdministration/skillApi';
import { useGetfilteredWOQuery } from '@/features/wpAdministration/wpApi';
import { useDispatch, useSelector } from 'react-redux';
import { resetFormValues, setFormValues } from '@/store/reducers/formSlice';
import { getDefectTypes, getAtaChapters } from '@/services/utilites';
type RequirementsFilteredFormType = {
  onProjectSearch: (values: any) => void;
  formKey: string; // Уникальный ключ формы
};
const WoFilteredForm: FC<RequirementsFilteredFormType> = ({
  onProjectSearch,
  formKey,
}) => {
  const formRef = useRef<FormInstance>(null);
  const [form] = Form.useForm();
  const dispatch = useDispatch();
  const formValues = useSelector((state: any) => state.form[formKey] || {});
  const [selectedStartDate, setSelectedStartDate] = useState<any>();
  const [selectedEndDate, setSelectedEndDate] = useState<any>();
  const onChange = (
    value: DatePickerProps['value'] | RangePickerProps['value'],
    dateString: [string, string] | string
  ) => {
    setSelectedEndDate(dateString[1]);
    setSelectedStartDate(dateString[0]);
  };
  const handleReset = () => {
    form.resetFields();
    dispatch(resetFormValues({ formKey }));
    setSelectedEndDate(null);
    setSelectedStartDate(null);
  };
  useEffect(() => {
    form.setFieldsValue(formValues);
  }, [form, formValues]);
  interface Option {
    value: string;
    label: string;
  }
  const handleKeyPress = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter') {
      formRef.current?.submit(); // вызываем метод submit формы при нажатии Enter
    }
  };

  const [reqTypeID, setReqTypeID] = useState<any>('');
  const [WOID, setWOID] = useState<any>(null);
  const { data: planes } = useGetPlanesQuery({});
  const { t } = useTranslation();
  const { data: zones, isLoading: loading } = useGetFilteredZonesQuery(
    {}
    // { acTypeId: reqType?.acTypeID },
    // { skip: !reqType?.acTypeID }
  );
  const { data: accessesData } = useGetAccessCodesQuery({});
  // { acTypeID: acTypeID },
  // { skip: acTypeID }
  const { data: projectTypes, isLoading } = useGetProjectTypesQuery({});
  const { data: restriction } = useGetFilteredRestrictionsQuery({});
  const { data: projects } = useGetProjectsQuery(
    {
      WOReferenceID: form.getFieldValue('WOReferenceID'),
    },
    { skip: !WOID }
  );

  const {
    data: wp,
    isLoading: isLoadingWP,
    isFetching,
  } = useGetfilteredWOQuery({});
  const { data: usersGroups } = useGetGroupUsersQuery({});
  const { data: usersSkill } = useGetSkillsQuery({});
  const groupSlills = usersSkill?.map((skill: any) => ({
    label: skill?.code,
    value: skill?.id, // Use the _id as the value
  }));
  const planesValueEnum: Record<string, { text: string; value: string }> =
    planes?.reduce((acc, reqType) => {
      // Check if reqType.acTypeID exists and has at least one element
      if (reqType.acTypeID && reqType.acTypeID.length > 0) {
        acc[reqType.id] = { text: reqType.regNbr, value: reqType.acTypeID[0] };
      } else {
        // If reqType.acTypeID is undefined or empty, set value to an empty string or handle it as appropriate for your use case
        acc[reqType.id] = { text: reqType.regNbr, value: '' };
      }
      return acc;
    }, {}) || {};
  const accessCodesValueEnum: Record<string, string> =
    accessesData?.reduce((acc, mpdCode) => {
      acc[mpdCode.id] = mpdCode.accessNbr;
      return acc;
    }, {} as Record<string, string>) || {};
  const zonesValueEnum = useMemo(() => {
    return (
      zones?.reduce((acc: Record<string, string>, zone: any) => {
        const id = zone?.id || zone?._id;
        const label = zone?.areaNbr || zone?.subZoneNbr || zone?.majoreZoneNbr;
        if (id && label) {
          acc[id] = label;
        }
        return acc;
      }, {}) || {}
    );
  }, [zones]);
  const projectsValueEnum: Record<string, string> =
    projects?.reduce((acc, reqType: any) => {
      acc[reqType?._id] = `№:${reqType?.projectWO} / ${reqType.projectName}`;
      return acc;
    }, {}) || {};
  const restrictionValueEnum: Record<string, string> =
    restriction?.reduce((acc, reqType) => {
      acc[reqType.id || reqType._id] = `${reqType.code}`;
      return acc;
    }, {}) || {};

  // const projectTypesValueEnum: Record<string, string> =
  //   projectTypes?.reduce((acc, reqType) => {
  //     acc[reqType.id] = reqType.code;
  //     return acc;
  //   }, {}) || {};

  const [loadAllTasks, setLoadAllTasks] = useState(false);

  const onFinish = async (values: any) => {
    try {
      const hasAnyFilter = Object.values(values).some((value) =>
        Array.isArray(value) ? value.length > 0 : Boolean(value)
      );

      if (!hasAnyFilter && !loadAllTasks) {
        notification.warning({
          message: t('Warning'),
          description: t(
            'Please select at least one filter or enable "Load all tasks"'
          ),
          duration: 3,
        });
        return;
      }

      const searchParams = {
        startDate: selectedStartDate || '',
        status: form.getFieldValue('woStatus'),
        projectNumber: form.getFieldValue('projectNumber'),
        endDate: selectedEndDate,
        projectTypesID: form.getFieldValue('projectTypesID'),
        projectTaskWO: form.getFieldValue('projectTaskWO'),
        projectID: form.getFieldValue('projectID'),
        planeId: form.getFieldValue('planeId'),
        restrictionID: form.getFieldValue('restrictionID'),
        accessID: form.getFieldValue('accessID'),
        skillCodeID: form.getFieldValue('skillCodeID'),
        useID: form.getFieldValue('useID'),
        phasesID: form.getFieldValue('phasesID'),
        zonesID: form.getFieldValue('zonesID'),
        projectItemType: form.getFieldValue('projectItemType'),
        WOReferenceID: form.getFieldValue('WOReferenceID'),
        time: new Date(),
        defectCodeID: form.getFieldValue('defectCodeID'),
        ata: form.getFieldValue('ata'),
        loadAllTasks,
      };

      onProjectSearch(searchParams);
    } catch (error) {
      notification.error({
        message: t('Error'),
        description: t('Failed to fetch requirements'),
        duration: 3,
      });
    }
  };
  const { data: stores } = useGetStoresQuery({});
  const wpValueEnum: Record<string, string> =
    wp?.reduce((acc, wp) => {
      if (wp._id && wp?.WOName) {
        acc[wp._id] = `№:${wp?.WONumber}/${String(wp?.WOName).toUpperCase()}`;
      }
      return acc;
    }, {} as Record<string, string>) || {};

  const options = getDefectTypes(t);
  const optionsT = getAtaChapters(t);
  return (
    <ProForm
      formRef={formRef}
      onValuesChange={(changedValues, allValues) => {
        dispatch(setFormValues({ formKey, values: allValues }));
      }}
      layout="horizontal"
      size="small"
      onReset={handleReset}
      form={form}
      onFinish={onFinish}
    >
      <div className="mb-4">
        <Checkbox
          checked={loadAllTasks}
          onChange={(e) => setLoadAllTasks(e.target.checked)}
        >
          {t('Load all tasks')}
        </Checkbox>
      </div>
      <ProFormText
        name="projectTaskWO"
        label={`${t('TRACE No')}`}
        width="lg"
        fieldProps={{
          onKeyPress: handleKeyPress,
        }}
      />
      <ProFormSelect
        showSearch
        name="WOReferenceID"
        label={t('WO')}
        // rules={[{ required: true }]}
        width="lg"
        valueEnum={wpValueEnum || []}
        onChange={(value: any) => setWOID(value)}
        // disabled={!projectId}
      />
      <ProFormSelect
        mode={'multiple'}
        showSearch
        name="projectID"
        label={t('WP TITLE')}
        width="lg"
        valueEnum={projectsValueEnum}
        onChange={(value: any) => setReqTypeID(value)}
        disabled={!WOID} // Disable the select if acTypeID is not set
      />
      <ProFormSelect
        // initialValue={['open', 'performed', 'inspect', 'inProgress']}
        mode="multiple"
        name="woStatus"
        label={`${t('Wo STATUS')}`}
        width="lg"
        valueEnum={{
          closed: { text: t('CLOSE'), status: 'SUCCESS' },
          diRequired: { text: t('DI REQUIRED'), status: 'Processing' },
          inspect: { text: t('INSPECTION'), status: 'inspect' },
          nextAction: { text: t('NEXT ACTION'), status: 'PROGRESS' },
          inProgress: { text: t('IN PROGRESS'), status: 'PROGRESS' },
          test: { text: t('TEST'), status: 'Processing' },
          open: { text: t('OPEN'), status: 'Processing' },
          cancelled: { text: t('CANCEL'), status: 'Error' },
          // draft: { text: t('DRAFT'), status: 'DRAFT' },

          // needInspection: { text: t('NEED INSPECTION'), status: 'PROGRESS' },

          // PLANNED: { text: t('PLANNED'), status: 'Waiting' },
          // completed: { text: t('COMPLETED'), status: 'Default' },
          // performed: { text: t('PERFORMED'), status: 'Default' },
        }}
      />

      <ProFormSelect
        mode={'multiple'}
        showSearch
        name="planeId"
        label={t('AC REG')}
        width="lg"
        valueEnum={planesValueEnum}
        // onChange={(value: any) => setReqTypeID(value)}
        // disabled={!acTypeID} // Disable the select if acTypeID is not set
      />
      {/* <ProFormSelect
        mode={'multiple'}
        showSearch
        // name="projectTypesID"
        label={t('PROJECT TYPE')}
        width="lg"
        valueEnum={projectTypesValueEnum}
        onChange={(value: any) => setReqTypeID(value)}
        // disabled={!acTypeID} // Disable the select if acTypeID is not set
      /> */}

      {/* <ProFormSelect
        // initialValue={['OPEN']}
        mode="multiple"
        name="projectStatus"
        label={`${t('PROJECT STATUS')}`}
        width="lg"
        valueEnum={{
          DRAFT: { text: t('DRAFT'), status: 'DRAFT' },
          OPEN: { text: t('OPEN'), status: 'Processing' },
          inProgress: { text: t('IN PROGRESS'), status: 'PROGRESS' },
          // PLANNED: { text: t('PLANNED'), status: 'Waiting' },
          COMPLETED: { text: t('COMPLETED'), status: 'Default' },
          CLOSED: { text: t('CLOSE'), status: 'SUCCESS' },
          CANCELLED: { text: t('CANCEL'), status: 'Error' },
        }}
      /> */}

      {/* <ProFormSelect
        showSearch
        name="storeID"
        label={t('STORE')}
        width="lg"
        valueEnum={storeCodesValueEnum || []}
      /> */}

      <ProFormSelect
        mode={'multiple'}
        showSearch
        name="restrictionID"
        label={t('RESTRICTION')}
        width="lg"
        valueEnum={restrictionValueEnum}
        // onChange={(value: any) => setReqTypeID(value)}
      />
      {/* <ProFormSelect
        mode={'multiple'}
        showSearch
        name="phasesID"
        label={t('PHASES')}
        width="lg"
        // valueEnum={projectsValueEnum}
        // onChange={(value: any) => setReqTypeID(value)}
      /> */}
      <ProFormSelect
        mode="multiple"
        showSearch
        name="zonesID"
        label={t('ZONES')}
        width="lg"
        valueEnum={zonesValueEnum}
        loading={loading}
        fieldProps={{
          optionFilterProp: 'children',
          filterOption: (input, option) =>
            (option?.label ?? '').toLowerCase().includes(input.toLowerCase()),
        }}
      />
      <ProFormSelect
        mode={'multiple'}
        showSearch
        name="accessID"
        label={t('ACCESS')}
        width="lg"
        valueEnum={accessCodesValueEnum}
        // onChange={(value: any) => setReqTypeID(value)}
      />
      {/* <ProFormSelect
        mode={'multiple'}
        showSearch
        name="jobZoneID"
        label={t('JOB ZONE')}
        width="lg"
        // valueEnum={projectsValueEnum}
        // onChange={(value: any) => setReqTypeID(value)}
      />
      <ProFormSelect
        mode={'multiple'}
        showSearch
        name="subJobZoneID"
        label={t('SUB JOB ZONE')}
        width="lg"
        // valueEnum={projectsValueEnum}
        // onChange={(value: any) => setReqTypeID(value)}
      /> */}
      <ProFormSelect
        mode={'multiple'}
        showSearch
        name="skillCodeID"
        label={t('SKILL CODE')}
        width="lg"
        options={groupSlills}
        // onChange={(value: any) => setReqTypeID(value)}
      />

      {/* <ProFormSelect
        mode={'multiple'}
        showSearch
        name="useID"
        label={t('USER')}
        width="lg"
        // valueEnum={projectsValueEnum}
        // onChange={(value: any) => setReqTypeID(value)}
      /> */}
      <ProFormSelect
        // initialValue={['RC', 'CR_TASK', 'NRC', 'NRC_ADD']}
        mode="multiple"
        name="projectItemType"
        label={`${t('TASK TYPE')}`}
        width="lg"
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

          CMJC: { text: t('CMJC (Component maintenance) ') },
          FC: { text: t('FC (Fabrication card)') },
          HARD_ACCESS: { text: t('HARD_ACCESS') },
        }}
      />
      <ProFormSelect
        showSearch
        width={'md'}
        mode="multiple"
        name="defectCodeID"
        label={t('DEFECT TYPE')}
        options={options}
      />
      <ProFormSelect
        // disabled
        showSearch
        mode="multiple"
        name="ata"
        label={t('ATA CHAPTER')}
        width="lg"
        // initialValue={'draft'}
        options={optionsT}
      />
      <ProFormDateRangePicker
        name="plannedDate"
        label={`${t('DATE')}`}
        width="lg"
        tooltip="DATE"
        fieldProps={{
          onChange: onChange,
        }}
      />
    </ProForm>
  );
};

export default WoFilteredForm;
