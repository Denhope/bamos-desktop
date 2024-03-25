import React, { FC, useEffect, useState } from 'react';
import {
  ProForm,
  ProFormText,
  ProFormCheckbox,
  ProFormGroup,
  ProFormSelect,
} from '@ant-design/pro-form';
import { Button, Tabs, Upload, message } from 'antd';
import { ICompany } from '@/models/IUser';
import { useTranslation } from 'react-i18next';
import { uploadFileServer } from '@/utils/api/thunks';
import { UploadOutlined } from '@ant-design/icons';
import { handleFileSelect } from '@/services/utilites';

interface UserFormProps {
  company?: ICompany;
  onSubmit: (company: ICompany) => void;
  onDelete?: (companyId: string) => void;
}

const CompanyForm: FC<UserFormProps> = ({ company, onSubmit }) => {
  const [form] = ProForm.useForm();
  const { t } = useTranslation();
  const handleSubmit = async (values: ICompany) => {
    const newUser: ICompany = company
      ? { ...company, ...values }
      : { ...values };
    onSubmit(newUser);
  };
  useEffect(() => {
    if (company) {
      form.resetFields();
      form.setFieldsValue(company);
    } else {
      form.resetFields();
    }
  }, [company, form]);

  const handleUpload = async (file: File) => {
    if (!company || !company.id) {
      console.error(
        'Невозможно загрузить файл: компания не существует или не имеет id'
      );
      return;
    }

    const formData = new FormData();
    formData.append('file', file);
    try {
      const response = await uploadFileServer(formData);

      if (response) {
        const updatedCompany: ICompany = {
          ...company,
          FILES: response,
        };

        onSubmit({ ...company, FILES: response });
      } else {
        message.error('Ошибка при загрузке файла: неверный ответ сервера');
      }
    } catch (error) {
      message.error('Ошибка при загрузке файла');
      throw error;
    }
  };
  const SubmitButton = () => (
    <Button type="primary" htmlType="submit">
      {company ? t('UPDATE') : t('CREATE')}
    </Button>
  );
  const [showSubmitButton, setShowSubmitButton] = useState(true);
  return (
    <ProForm
      size="small"
      form={form}
      onFinish={handleSubmit}
      submitter={{
        render: (_, dom) => {
          if (showSubmitButton) {
            return [<SubmitButton key="submit" />, dom.reverse()[1]];
          }
          return null;
        },
      }}
      initialValues={company}
      layout="horizontal"
    >
      <Tabs defaultActiveKey="1" type="card">
        <Tabs.TabPane tab={t('MAIN')} key="1">
          <ProForm.Group>
            <ProForm.Group>
              <ProFormText
                width={'sm'}
                name="title"
                label={t('TITLE')}
                rules={[
                  {
                    required: true,
                  },
                ]}
              />
              <ProFormText
                width={'lg'}
                name="companyName"
                label={t('NAME')}
                rules={[
                  {
                    required: true,
                  },
                ]}
              />
              <ProFormText
                width={'lg'}
                name="description"
                label={t('DESCRIPTION')}
                rules={[
                  {
                    required: true,
                  },
                ]}
              />
            </ProForm.Group>
            <ProFormGroup>
              <ProFormSelect
                width={'sm'}
                name="country"
                label={t('COUNTRY')}
                showSearch
                valueEnum={{
                  BY: t('BELARUS'),
                  RU: t('RUSSIAN FEDERATION'),
                  AF: t('AFGHANISTAN'),
                  AX: t('ALAND ISLANDS'),
                  AL: t('ALBANIA'),
                  DZ: t('ALGERIA'),
                  AS: t('AMERICAN SAMOA'),
                  AD: t('ANDORRA'),
                  AO: t('ANGOLA'),
                  AI: t('ANGUILLA'),
                  AQ: t('ANTARCTICA'),
                  AG: t('ANTIGUA AND BARBUDA'),
                  AR: t('ARGENTINA'),
                  AM: t('ARMENIA'),
                  AW: t('ARUBA'),
                  AU: t('AUSTRALIA'),
                  AT: t('AUSTRIA'),
                  AZ: t('AZERBAIJAN'),
                  BS: t('BAHAMAS'),
                  BH: t('BAHRAIN'),
                  BD: t('BANGLADESH'),
                  BB: t('BARBADOS'),

                  BE: t('BELGIUM'),
                  BZ: t('BELIZE'),
                  BJ: t('BENIN'),
                  BM: t('BERMUDA'),
                  BT: t('BHUTAN'),
                  BO: t('BOLIVIA'),
                  BA: t('BOSNIA AND HERZEGOVINA'),
                  BW: t('BOTSWANA'),
                  BV: t('BOUVET ISLAND'),
                  BR: t('BRAZIL'),
                  IO: t('BRITISH INDIAN OCEAN TERRITORY'),
                  BN: t('BRUNEI DARUSSALAM'),
                  BG: t('BULGARIA'),
                  BF: t('BURKINA FASO'),
                  BI: t('BURUNDI'),
                  KH: t('CAMBODIA'),
                  CM: t('CAMEROON'),
                  CA: t('CANADA'),
                  CV: t('CAPE VERDE'),
                  KY: t('CAYMAN ISLANDS'),
                  CF: t('CENTRAL AFRICAN REPUBLIC'),
                  TD: t('CHAD'),
                  CL: t('CHILE'),
                  CN: t('CHINA'),
                  CX: t('CHRISTMAS ISLAND'),
                  CC: t('COCOS (KEELING) ISLANDS'),
                  CO: t('COLOMBIA'),
                  KM: t('COMOROS'),
                  CG: t('CONGO'),
                  CD: t('CONGO, THE DEMOCRATIC REPUBLIC OF THE'),
                  CK: t('COOK ISLANDS'),
                  CR: t('COSTA RICA'),
                  CI: t("COTE D'IVOIRE"),
                  HR: t('CROATIA'),
                  CU: t('CUBA'),
                  CY: t('CYPRUS'),
                  CZ: t('CZECH REPUBLIC'),
                  DK: t('DENMARK'),
                  DJ: t('DJIBOUTI'),
                  DM: t('DOMINICA'),
                  DO: t('DOMINICAN REPUBLIC'),
                  EC: t('ECUADOR'),
                  EG: t('EGYPT'),
                  SV: t('EL SALVADOR'),
                  GQ: t('EQUATORIAL GUINEA'),
                  ER: t('ERITREA'),
                  EE: t('ESTONIA'),
                  ET: t('ETHIOPIA'),
                  FK: t('FALKLAND ISLANDS (MALVINAS)'),
                  FO: t('FAROE ISLANDS'),
                  FJ: t('FIJI'),
                  FI: t('FINLAND'),
                  FR: t('FRANCE'),
                  GF: t('FRENCH GUIANA'),
                  PF: t('FRENCH POLYNESIA'),
                  TF: t('FRENCH SOUTHERN TERRITORIES'),
                  GA: t('GABON'),
                  GM: t('GAMBIA'),
                  GE: t('GEORGIA'),
                  DE: t('GERMANY'),
                  GH: t('GHANA'),
                  GI: t('GIBRALTAR'),
                  GR: t('GREECE'),
                  GL: t('GREENLAND'),
                  GD: t('GRENADA'),
                  GP: t('GUADELOUPE'),
                  GU: t('GUAM'),
                  GT: t('GUATEMALA'),
                  GG: t('GUERNSEY'),
                  GN: t('GUINEA'),
                  GW: t('GUINEA-BISSAU'),
                  GY: t('GUYANA'),
                  HT: t('HAITI'),
                  HM: t('HEARD ISLAND AND MCDONALD ISLANDS'),
                  VA: t('HOLY SEE (VATICAN CITY STATE)'),
                  HN: t('HONDURAS'),
                  HK: t('HONG KONG'),
                  HU: t('HUNGARY'),
                  IS: t('ICELAND'),
                  IN: t('INDIA'),
                  ID: t('INDONESIA'),
                  IR: t('IRAN, ISLAMIC REPUBLIC OF'),
                  IQ: t('IRAQ'),
                  IE: t('IRELAND'),
                  IM: t('ISLE OF MAN'),
                  IL: t('ISRAEL'),
                  IT: t('ITALY'),
                  JM: t('JAMAICA'),
                  JP: t('JAPAN'),
                  JE: t('JERSEY'),
                  JO: t('JORDAN'),
                  KZ: t('KAZAKHSTAN'),
                  KE: t('KENYA'),
                  KI: t('KIRIBATI'),
                  KP: t("KOREA, DEMOCRATIC PEOPLE'S REPUBLIC OF"),
                  KR: t('KOREA, REPUBLIC OF'),
                  KW: t('KUWAIT'),
                  KG: t('KYRGYZSTAN'),
                  LA: t("LAO PEOPLE'S DEMOCRATIC REPUBLIC"),
                  LV: t('LATVIA'),
                  LB: t('LEBANON'),
                  LS: t('LESOTHO'),
                  LR: t('LIBERIA'),
                  LY: t('LIBYAN ARAB JAMAHIRIYA'),
                  LI: t('LIECHTENSTEIN'),
                  LT: t('LITHUANIA'),
                  LU: t('LUXEMBOURG'),
                  MO: t('MACAO'),
                  MK: t('MACEDONIA, THE FORMER YUGOSLAV REPUBLIC OF'),
                  MG: t('MADAGASCAR'),
                  MW: t('MALAWI'),
                  MY: t('MALAYSIA'),
                  MV: t('MALDIVES'),
                  ML: t('MALI'),
                  MT: t('MALTA'),
                  MH: t('MARSHALL ISLANDS'),
                  MQ: t('MARTINIQUE'),
                  MR: t('MAURITANIA'),
                  MU: t('MAURITIUS'),
                  YT: t('MAYOTTE'),
                  MX: t('MEXICO'),
                  FM: t('MICRONESIA, FEDERATED STATES OF'),
                  MD: t('MOLDOVA, REPUBLIC OF'),
                  MC: t('MONACO'),
                }}
              />
              <ProFormText
                width={'lg'}
                name="adress"
                label={t('ADRESS')}
                rules={[
                  {
                    required: true,
                  },
                ]}
              />
              <ProFormText
                name="email"
                label={t('EMAIL')}
                rules={[
                  { required: true, message: 'Please enter your email' },
                  { type: 'email', message: 'Please enter a valid email' },
                ]}
              />
              <ProFormText
                name="contacts"
                label={t('PHONE NUMBER')}
                rules={[
                  { required: true, message: 'Please enter your phone number' },
                  {
                    pattern:
                      /^\+?\d{1,4}?[-.\s]?\(?\d{1,3}?\)?[-.\s]?\d{1,4}[-.\s]?\d{1,4}[-.\s]?\d{1,9}$/,
                    message: 'Please enter a valid phone number',
                  },
                ]}
              />
            </ProFormGroup>
          </ProForm.Group>
          <ProForm.Item label={t('UPLOAD LOGO')}>
            <Upload
              name="FILES"
              fileList={company?.FILES}
              listType="picture"
              className="upload-list-inline"
              beforeUpload={handleUpload}
              accept="image/*"
            >
              <Button icon={<UploadOutlined />}>{t('CLICK TO UPLOAD')}</Button>
            </Upload>
          </ProForm.Item>{' '}
        </Tabs.TabPane>
      </Tabs>

      {/* <ProForm.Item>
        <Button type="primary" htmlType="submit">
          {company ? 'Update' : 'Create'}
        </Button>
      </ProForm.Item> */}
    </ProForm>
  );
};
export default CompanyForm;
