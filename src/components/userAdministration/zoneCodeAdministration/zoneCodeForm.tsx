// @ts-nocheck

// The rest of your code here will not be type-checked by TypeScript
import React, { FC, useEffect, useState } from 'react';
import {
  ProForm,
  ProFormText,
  ProFormRadio,
  ProFormTextArea,
} from '@ant-design/pro-form';
import { IZoneCode, IZoneCodeGroup } from '@/models/ITask';
import {
  ProFormDigit,
  ProFormGroup,
  ProFormSelect,
} from '@ant-design/pro-components';
import { useTranslation } from 'react-i18next';
import { useGetZonesByGroupQuery } from '@/features/zoneAdministration/zonesApi';

interface UserFormProps {
  zoneCode?: IZoneCode;
  onSubmit: (zoneCode: IZoneCode) => void;
  onDelete?: (zoneCodeId: string) => void;
  zoneCodes: IZoneCodeGroup[] | [];
}

const ZoneCodeForm: FC<UserFormProps> = ({ zoneCode, onSubmit, zoneCodes }) => {
  const [form] = ProForm.useForm();
  const { t } = useTranslation();
  const [areaID, setAreaID] = useState<any>('');
  const handleSubmit = async (values: IZoneCode) => {
    const newUser: IZoneCode = zoneCode
      ? { ...zoneCode, ...values }
      : { ...values };
    onSubmit(newUser);
  };
  const [searchQuery, setSearchQuery] = useState('');
  const [isDisabled, setIsDisabled] = useState(false);

  const getInitialZoneType = (zoneCode: IZoneCode | undefined) => {
    if (zoneCode) {
      if (zoneCode.areaNbr) return 'areaNbr';
      if (zoneCode.subZoneNbr) return 'subZoneNbr';

      if (zoneCode.majoreZoneNbr) return 'majoreZoneNbr';
      if (zoneCode.accessNbr) return 'accessNbr';
    }
    return 'majoreZoneNbr';
  };

  useEffect(() => {
    if (zoneCode) {
      const initialZoneType = getInitialZoneType(zoneCode);
      form.resetFields();
      form.setFieldsValue({
        ...zoneCode,
        zoneType: initialZoneType,
      });
      setSearchQuery(initialZoneType);
      setIsDisabled(true);
    } else {
      form.resetFields();
      setIsDisabled(!isDisabled);
      setSearchQuery('majoreZoneNbr');
      form.setFieldsValue({
        zoneType: 'majoreZoneNbr',
      });
    }
  }, [form, zoneCode]);
  const { data: zones, isLoading: loading } = useGetZonesByGroupQuery(
    { acTypeId: (zoneCode && zoneCode?.acTypeId) || '' },
    { skip: !(zoneCode && zoneCode?.acTypeId) }
  );

  const zonesValueEnum: Record<string, string> =
    zones?.reduce((acc1, majorZone) => {
      return majorZone?.subZonesCode.reduce((acc2, subZone) => {
        return subZone?.areasCode.reduce((acc3, area) => {
          acc3[area.id] = `${String(area.areaNbr).toUpperCase()}-${String(
            area?.areaDescription
          ).toUpperCase()}`;
          return acc3;
        }, acc2);
      }, acc1);
    }, {}) || {};
  const majoreZoneOptions =
    zoneCodes?.map((value) => ({
      label: value.majoreZoneNbr,
      value: value.majoreZoneNbr,
    })) || [];
  const majoreZoneDescriptionOptions =
    zoneCodes?.map((value) => ({
      label: value.majoreZoneDescription,
      value: value.majoreZoneDescription,
    })) || [];

  const subZoneDescriptionOptions =
    zoneCodes?.flatMap((zoneCode) =>
      zoneCode.subZonesCode?.map((subZoneCode) => ({
        // Convert the number to a string if necessary
        label: subZoneCode.subZoneDescription?.toString(),
        value: subZoneCode.subZoneDescription?.toString(),
      }))
    ) || [];
  const subZoneNbrOptions =
    zoneCodes?.flatMap((zoneCode) =>
      zoneCode.subZonesCode?.map((subZoneCode) => ({
        // Convert the number to a string if necessary
        label: subZoneCode.subZoneNbr?.toString(),
        value: subZoneCode.subZoneNbr?.toString(),
      }))
    ) || [];

  return (
    <ProForm
      size="small"
      form={form}
      onFinish={handleSubmit}
      initialValues={zoneCode}
      layout="horizontal"
    >
      <ProForm.Group>
        <ProFormRadio.Group
          disabled={isDisabled}
          name="zoneType"
          layout="horizontal"
          options={[
            { label: `${t('MAJOR ZONE')}`, value: 'majoreZoneNbr' },
            { label: `${t('SUB ZONE')}`, value: 'subZoneNbr' },
            { label: `${t('AREA')}`, value: 'areaNbr' },
            { label: `${t('ACCESS')}`, value: 'accessNbr' },
          ]}
          onChange={(e: any) => setSearchQuery(e.target.value)}
        />
        {searchQuery === 'majoreZoneNbr' && (
          <>
            <ProFormText
              width={'sm'}
              name="majoreZoneNbr"
              label={t('MAJOR ZONE')}
              rules={[
                {
                  required: form.getFieldValue('zoneType') === 'majoreZoneNbr',
                },
              ]}
            />
            <ProFormText
              width={'lg'}
              name="majoreZoneDescription"
              label={t('MAJOR ZONE DESCRIPTION')}
              rules={[
                {
                  required: form.getFieldValue('zoneType') === 'majoreZoneNbr',
                },
              ]}
            />
          </>
        )}

        {searchQuery === 'subZoneNbr' && (
          <>
            <>
              <ProFormSelect
                options={majoreZoneOptions}
                disabled={isDisabled}
                width={'sm'}
                name="majoreZoneNbr"
                label={t('MAJOR ZONE')}
                rules={[
                  {
                    required: true,
                  },
                ]}
              />
              <ProFormSelect
                options={majoreZoneDescriptionOptions}
                disabled={isDisabled}
                width={'lg'}
                name="majoreZoneDescription"
                label={t('MAJOR ZONE DESCRIPTION')}
                rules={[
                  {
                    required: true,
                  },
                ]}
              />
            </>
            <ProFormText
              width={'sm'}
              name="subZoneNbr"
              label={t('SUBZONE NUMBER')}
              rules={[
                {
                  required: true,
                },
              ]}
            />
            <ProFormText
              width={'lg'}
              name="subZoneDescription"
              label={t('SUBZONE DESCRIPTION')}
              rules={[
                {
                  required: true,
                },
              ]}
            />
          </>
        )}
        {searchQuery === 'areaNbr' && (
          <>
            <ProFormSelect
              options={majoreZoneOptions}
              disabled={isDisabled}
              width={'sm'}
              name="majoreZoneNbr"
              label={t('MAJOR ZONE')}
              rules={[
                {
                  required: true,
                },
              ]}
            />
            <ProFormSelect
              options={majoreZoneDescriptionOptions}
              disabled={isDisabled}
              width={'lg'}
              name="majoreZoneDescription"
              label={t('MAJOR ZONE DESCRIPTION')}
              rules={[
                {
                  required: true,
                },
              ]}
            />
            <ProFormSelect
              disabled={isDisabled}
              options={subZoneNbrOptions}
              width={'sm'}
              name="subZoneNbr"
              label={t('SUBZONE NUMBER')}
              rules={[
                {
                  required: true,
                },
              ]}
            />
            <ProFormSelect
              disabled={isDisabled}
              options={subZoneDescriptionOptions}
              width={'lg'}
              name="subZoneDescription"
              label={t('SUBZONE DESCRIPTION')}
              rules={[
                {
                  required: true,
                },
              ]}
            />
            <ProFormText
              width={'sm'}
              name="areaNbr"
              label={t('AREA NUMBER')}
              rules={[
                {
                  required: true,
                },
              ]}
            />
            <ProFormTextArea
              width={'lg'}
              name="areaDescription"
              label={t('AREA DESCRIPTION')}
              rules={[
                {
                  required: true,
                },
              ]}
            />
          </>
        )}
        {searchQuery === 'accessNbr' && (
          <>
            <ProFormSelect
              disabled={isDisabled}
              valueEnum={zonesValueEnum}
              width={'lg'}
              name="areaCodeID"
              label={t('AREA NUMBER')}
              onChange={(value: any, option: any) => {
                // console.log(option);
                // form.setFieldsValue({
                //   areaDescription: option?.areaDescription,
                // });
                setAreaID(value);
              }}
              // rules={[
              //   {
              //     required: true,
              //   },
              // ]}
            />
            {/* <ProFormSelect
              disabled
              // options={areasNbrOptions}
              width={'lg'}
              name="areaDescription"
              label={t('AREA DESCRIPTION')}
              // rules={[
              //   {
              //     required: true,
              //   },
              // ]}
            /> */}
            <ProFormText
              // disabled={isDisabled}
              width={'sm'}
              name="accessNbr"
              label={t('ACCESS NUMBER')}
              rules={[
                {
                  required: true,
                },
              ]}
            />
            <ProFormText
              // disabled={isDisabled}
              width={'lg'}
              name="accessDescription"
              label={t('ACCESS DESCRIPTION')}
              rules={[
                {
                  required: true,
                },
              ]}
            />
            <ProFormGroup>
              <ProFormDigit
                width={'xs'}
                name="closingTime"
                label={t('TIME TO CLOSE (MPD)')}
              />
              <ProFormDigit
                width={'xs'}
                name="openingTime"
                label={t('TIME TO OPEN (MPD)')}
              />
              <ProFormDigit
                width={'xs'}
                name="takeOfOnTime"
                label={t('TIME OPEN/CLOSE (MPD)')}
              />
            </ProFormGroup>
          </>
        )}
        <ProFormGroup>
          <ProFormSelect
            showSearch
            name="status"
            label={t('STATUS')}
            width="sm"
            valueEnum={{
              ACTIVE: { text: t('ACTIVE'), status: 'Success' },
              INACTIVE: { text: t('INACTIVE'), status: 'Error' },
            }}
          />
        </ProFormGroup>
      </ProForm.Group>

      {/* <ProForm.Item>
        <Button type="primary" htmlType="submit">
          {zoneCode ? 'Update' : 'Create'}
        </Button>
      </ProForm.Item> */}
    </ProForm>
  );
};

export default ZoneCodeForm;
