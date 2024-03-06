import { ModalForm, ProColumns } from '@ant-design/pro-components';
import { ConfigProvider, Modal } from 'antd';

import EditableTable from '@/components/shared/Table/EditableTable';
import React, { FC, useState } from 'react';
import { useTranslation } from 'react-i18next';
interface IssuedMatFormProps {
  issuedRecord: any;
  isLoading: boolean;
  menuItems: any;
  yScroll: number;
  open: boolean; // Добавьте эту строку
  onClose: () => void; // Добавьте эту строку, если вы хотите передать обработчик
}
const IssuedMatForm: FC<IssuedMatFormProps> = ({
  issuedRecord,
  isLoading,
  menuItems,
  yScroll,
  onClose,
  open,
}) => {
  const { t } = useTranslation();
  const initialBlockColumns: ProColumns<any>[] = [
    {
      title: 'LABEL',
      dataIndex: 'LOCAL_ID',
      // valueType: 'index',
      ellipsis: true,
      key: 'LOCAL_ID',
      width: '12%',

      editable: (text, record, index) => {
        return false;
      },
      render: (text: any, record: any) => {
        return (
          <a
            onClick={() => {
              // dispatch(setCurrentProjectTask(record));
              // setOpenRequirementDrawer(true);
              // onReqClick(record);
            }}
          >
            {record.ID}
          </a>
        );
      },
      // sorter: (a, b) => (a.id || 0) - (b.id || 0),
    },

    {
      title: `${t('PN')}`,
      dataIndex: 'PART_NUMBER',
      key: 'PART_NUMBER',
      ellipsis: true,
      formItemProps: {
        name: 'PART_NUMBER',
      },

      // responsive: ['sm'],
    },

    {
      title: `${t('DESCRIPTION')}`,
      dataIndex: 'NAME_OF_MATERIAL',
      key: 'NAME_OF_MATERIAL',
      // responsive: ['sm'],
      tip: 'Text Show',
      ellipsis: true, //
      // width: '20%',
    },
    {
      title: `${t('QUANTITY')}`,
      dataIndex: 'QUANTITY',
      key: 'QUANTITY',
      responsive: ['sm'],
      search: false,
      // sorter: (a, b) => a.unit.length - b.unit.length,
    },

    {
      title: `${t('UNIT')}`,
      dataIndex: 'UNIT_OF_MEASURE',
      key: 'UNIT_OF_MEASURE',
      responsive: ['sm'],
      search: false,
      // sorter: (a, b) => a.unit.length - b.unit.length,
    },

    {
      title: 'B/S NUMBER',
      dataIndex: 'BATCH_ID',
      key: 'BATCH_ID',
      editable: (text, record, index) => {
        return false;
      },
      search: false,
    },
    {
      title: 'STOCK',
      dataIndex: 'STOCK',
      key: 'BATCH_ID',
      editable: (text, record, index) => {
        return false;
      },
      search: false,
    },
    {
      title: `${t('DOC')}`,
      dataIndex: 'DOC',
      key: 'DOC',
      editable: (text, record, index) => {
        return false;
      },
      search: false,
    },
  ];
  return (
    <div>
      {' '}
      <Modal
        title={`ISSUE PICKSLIP INFORMARION`}
        // placement={'bottom'}
        open={open}
        onCancel={onClose}
        width={'70vw'}

        // getContainer={false}
      >
        <EditableTable
          data={issuedRecord}
          initialColumns={initialBlockColumns}
          isLoading={isLoading}
          menuItems={menuItems}
          recordCreatorProps={false}
          onRowClick={function (record: any, rowIndex?: any): void {
            console.log(record);
          }}
          onSave={function (rowKey: any, data: any, row: any): void {
            console.log(rowKey);
          }}
          yScroll={yScroll}
          externalReload={function (): Promise<void> {
            throw new Error('Function not implemented.');
          }}
          // onTableDataChange={}
        />
      </Modal>
    </div>
  );
};

export default IssuedMatForm;
