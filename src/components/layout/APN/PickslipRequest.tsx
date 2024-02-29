import React, { FC, useState } from 'react';
import PickslipRequestForm from '../pickslipRequest/PickslipRequestForm';
import { Button, Col, Input, Row, Space } from 'antd';
import PickSlipRequestPartList from '../pickslipRequest/PickSlipRequestPartList';
import { ProColumns } from '@ant-design/pro-components';
import DoubleClickPopover from '@/components/shared/form/DoubleClickProper';
import PartNumberSearch from '@/components/store/search/PartNumberSearch';
import { useTranslation } from 'react-i18next';
import {
  TransactionOutlined,
  EditOutlined,
  PrinterOutlined,
  CloseCircleOutlined,
  SaveOutlined,
} from '@ant-design/icons';

const PickslipRequest: FC = () => {
  const { t } = useTranslation();
  const [selectedPN, setSelectedPN] = React.useState<any>();
  const [currentPickData, setCurrentPickData] = React.useState<any>();
  const [isEditing, setIsEditing] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [isCancel, setCancel] = useState(false);
  const [partData, setPartData] = useState(false);
  const initialColumns: ProColumns<any>[] = [
    {
      title: `${t('PART NUMBER')}`,
      dataIndex: 'PN',
      key: 'PN',
      tip: ' Click open Store search',
      ellipsis: true,
      width: '14%',
      formItemProps: (form, { rowIndex }) => {
        return {
          rules: rowIndex > 1 ? [{ required: true }] : [],
        };
      },

      editable: (text, record, index) => {
        return index !== 0;
      },

      renderFormItem: (item2, { onChange }) => {
        return (
          <DoubleClickPopover
            content={
              <div className="flex my-0 mx-auto  h-[44vh] flex-col relative overflow-hidden">
                <PartNumberSearch
                  initialParams={{ partNumber: '' }}
                  scroll={18}
                  onRowClick={function (record: any, rowIndex?: any): void {
                    // setOpenStoreFind(false);
                    setSelectedPN(record);
                    // setInitialPN(record.PART_NUMBER);
                  }}
                  isLoading={false}
                  onRowSingleClick={function (
                    record: any,
                    rowIndex?: any
                  ): void {
                    setSelectedPN(record);
                  }}
                />
              </div>
            }
            overlayStyle={{ width: '70%' }}
          >
            <Input
              value={selectedPN.PART_NUMBER}
              onChange={(e) => {
                setSelectedPN({
                  ...selectedPN,
                  PART_NUMBER: e.target.value,
                });
                if (onChange) {
                  onChange(e.target.value);
                }
              }}
            />
          </DoubleClickPopover>
        );
      },

      // responsive: ['sm'],
    },
    {
      title: `${t('QTY REQ ')}`,
      dataIndex: 'amout',
      key: 'amout',
      width: '7%',
    },
    {
      title: `${t('REQUESTED SERIAL')}`,
      dataIndex: 'serialNumber',
      key: 'serialNumber',
      width: '10%',
    },
    {
      title: `${t('AVAIL QTY')}`,
      dataIndex: 'availableQTY',
      key: 'availableQTY',
      width: '7%',
      responsive: ['sm'],
      // sorter: (a, b) => a.unit.length - b.unit.length,
    },
    {
      title: `${t('DESCRIPTION')}`,
      dataIndex: 'nameOfMaterial',
      key: 'nameOfMaterial',
      // responsive: ['sm'],

      ellipsis: true, //
      width: '14%',
    },
    {
      title: `${t('UNIT')}`,
      dataIndex: 'unit',
      key: 'unit',
      width: '4%',
      responsive: ['sm'],
      // sorter: (a, b) => a.unit.length - b.unit.length,
    },
    {
      title: `${t('GROUP')}`,
      dataIndex: 'group',
      key: 'group',
      // responsive: ['sm'],

      ellipsis: true, //
      width: '6%',
    },
  ];
  return (
    <div className="h-[82vh]  bg-white px-4 py-3  overflow-hidden flex flex-col justify-between gap-1">
      <div className="flex flex-col">
        <div className="py-4">
          <Row gutter={{ xs: 8, sm: 11, md: 24, lg: 32 }}>
            <Col sm={18}>
              <PickslipRequestForm
                onFilterPickSlip={function (record: any): void {}}
                onCurrentPickSlip={function (data: any): void {
                  setCurrentPickData(data);
                }}
                setCancel={isCancel}
              />
            </Col>
            <Col sm={6}>
              <Button type="primary" className="w-11/12" size="large">
                SEND TO STORE (ISSUE)
              </Button>
            </Col>
          </Row>
        </div>
        <PickSlipRequestPartList
          data={currentPickData?.parts || null}
          isLoading={false}
          onRowClick={function (record: any, rowIndex?: any): void {
            throw new Error('Function not implemented.');
          }}
          onSave={function (data: any): void {
            setPartData(data);
          }}
          yScroll={40}
        />
      </div>
      <div className="flex justify-between">
        <Space align="center">
          <Button
            disabled={!isEditing && !isCreating}
            onClick={() => {}}
            size="small"
            icon={<SaveOutlined />}
          >
            {t('SAVE')}
          </Button>
        </Space>
        <Space>
          <Button
            // disabled={!isEditing && !isCreating}
            icon={<CloseCircleOutlined />}
            onClick={() => {
              setCancel(true);
            }}
            size="small"
          >
            {t('CANCEL')}
          </Button>
        </Space>
      </div>
    </div>
  );
};

export default PickslipRequest;
