import { ProColumns } from '@ant-design/pro-components';
import { TimePicker } from 'antd';
import EditableTable from '@/components/shared/Table/EditableTable';
import React, { FC, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import PartContainer from '@/components/woAdministration/PartContainer';
import { ColDef } from 'ag-grid-community';
import { transformToPartBooking } from '@/services/utilites';
type TechnicalViewType = {
  scroll: number;
  data: any[];
  isLoading: boolean;
  onSingleRowClick?: (record: any, rowIndex?: any) => void;
};
const TechnicalView: FC<TechnicalViewType> = ({
  data,
  scroll,
  onSingleRowClick,
  isLoading,
}) => {
  const { t } = useTranslation();
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const initialColumns: ProColumns<any>[] = [
    {
      title: `${t('DATE')}`,
      dataIndex: 'createDate',

      key: 'createDate',
      //tooltip: 'ITEM EXPIRY DATE',
      ellipsis: true,
      valueType: 'date',

      formItemProps: {
        name: 'createDate',
      },
      sorter: (a, b) => {
        if (a.createDate && b.createDate) {
          const aFinishDate = new Date(a.createDate);
          const bFinishDate = new Date(b.createDate);
          return aFinishDate.getTime() - bFinishDate.getTime();
        } else {
          return 0; // default value
        }
      },
      renderFormItem: () => {
        return <TimePicker />;
      },

      // responsive: ['sm'],
    },
    {
      title: `${t('BOOKING')}`,
      dataIndex: 'voucherModel',
      key: 'voucherModel',
      // tooltip: 'LOCAL_ID',
      ellipsis: true,

      // responsive: ['sm'],
    },
    {
      title: `${t('PART No')}`,
      dataIndex: 'PART_NUMBER',
      key: 'PART_NUMBER',
      ellipsis: true,
      //tooltip: 'ITEM PART_NUMBER',
      // ellipsis: true,

      formItemProps: {
        name: 'PART_NUMBER',
      },
    },
    {
      title: `${t('B/SERIAL')}`,
      dataIndex: 'SERIAL_NUMBER',
      key: 'SERIAL_NUMBER',
      ellipsis: true,
      render: (text: any, record: any) =>
        record.SERIAL_NUMBER || record.SUPPLIER_BATCH_NUMBER,
    },
    {
      title: `${t('CONDITION')}`,
      dataIndex: 'CONDITION',
      key: 'CONDITION',
      //tooltip: 'CONDITION',
      ellipsis: true,

      formItemProps: {
        name: 'CONDITION',
      },
      render: (text: any, record: any) => {
        return <div onClick={() => {}}>{record.CONDITION}</div>;
      },

      // responsive: ['sm'],
    },
    {
      title: `${t('A/C')}`,
      dataIndex: 'registrationNumber',
      key: 'registrationNumber',
      // tooltip: 'LOCAL_ID',
      ellipsis: true,

      // responsive: ['sm'],
    },
    {
      title: `${t('QTY')}`,
      dataIndex: 'QUANTITY',
      key: 'QUANTITY',
      width: '5%',
      responsive: ['sm'],
      search: false,

      // sorter: (a, b) => a.unit.length - b.unit.length,
    },
    {
      title: `${t('LABEL')}`,
      dataIndex: 'LOCAL_ID',
      key: 'LOCAL_ID',
      // tooltip: 'LOCAL_ID',
      ellipsis: true,

      formItemProps: {
        name: 'LOCAL_ID',
      },
      sorter: (a: any, b: any) => a.LOCAL_ID - b.LOCAL_ID, //

      // responsive: ['sm'],
    },
    {
      title: `${t('PROJECT No')}`,
      dataIndex: 'projectWO',
      key: 'projectWO',
      // tooltip: 'LOCAL_ID',
      ellipsis: true,

      formItemProps: {
        name: 'projectWO',
      },
      sorter: (a: any, b: any) => a.projectWO - b.projectWO, //

      // responsive: ['sm'],
    },
    {
      title: `${t('WO No')}`,
      dataIndex: 'projectTaskWO',
      key: 'projectTaskWO',
      // tooltip: 'LOCAL_ID',
      ellipsis: true,

      formItemProps: {
        name: 'projectTaskWO',
      },
      sorter: (a: any, b: any) => a.projectTaskWO - b.projectTaskWO, //

      // responsive: ['sm'],
    },
    {
      title: `${t('DESCRIPTION')}`,
      dataIndex: 'NAME_OF_MATERIAL',
      key: 'NAME_OF_MATERIAL',
      // tooltip: 'ITEM STORE',
      ellipsis: true,

      formItemProps: {
        name: 'NAME_OF_MATERIAL',
      },

      // responsive: ['sm'],
    },
  ];
  type CellDataType = 'text' | 'number' | 'date' | 'boolean';

  interface ExtendedColDef extends ColDef {
    cellDataType: CellDataType;
  }
  const [columnDefs, setColumnDefs] = useState<ExtendedColDef[]>([
    {
      field: 'createDate',
      editable: false,
      cellDataType: 'date',
      headerName: `${t('CREATE DATE')}`,
      width: 150,
      valueFormatter: (params: any) => {
        if (!params.value) return ''; // Проверка отсутствия значения
        const date = new Date(params.value);
        return date.toLocaleDateString('ru-RU', {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
          hour: '2-digit',
          minute: '2-digit',
        });
      },
    },

    {
      headerName: `${t('BOOKING')}`,
      field: 'voucherModel',
      editable: false,
      cellDataType: 'text',
    },
    {
      headerName: `${t('PART No')}`,
      field: 'PART_NUMBER',
      editable: false,
      cellDataType: 'text',
    },
    {
      field: 'SUPPLIER_BATCH_NUMBER',
      editable: false,
      filter: false,
      headerName: `${t('BATCH')}`,
      cellDataType: 'text',
    },
    {
      field: 'SERIAL_NUMBER',
      editable: false,
      filter: false,
      headerName: `${t('SERIAL')}`,
      cellDataType: 'text',
    },
    {
      field: 'STOCK',
      editable: false,
      filter: false,
      headerName: `${t('STORE')}`,
      cellDataType: 'text',
    },
    {
      field: 'SHELF_NUMBER',
      editable: false,
      filter: false,
      headerName: `${t('LOCATION')}`,
      cellDataType: 'text',
    },
    {
      field: 'CONDITION',
      editable: false,
      filter: false,
      headerName: `${t('CONDITION')}`,
      cellDataType: 'text',
    },
    {
      field: 'NAME_OF_MATERIAL',
      headerName: `${t('DESCRIPTION')}`,
      cellDataType: 'text',
    },

    {
      field: 'LOCAL_ID',
      headerName: `${t('LABEL')}`,
      cellDataType: 'text',
    },
    {
      field: 'QUANTITY',
      editable: false,
      filter: false,
      headerName: `${t('QTY')}`,
      cellDataType: 'number',
    },
    {
      field: 'UNIT_OF_MEASURE',
      editable: false,
      filter: false,
      headerName: `${t('UNIT OF MEASURE')}`,
      cellDataType: 'text',
    },

    // {
    //   field: 'projectWO',
    //   headerName: `${t('WO No')}`,
    //   cellDataType: 'text',
    // },
    {
      field: 'projectWO',
      headerName: `${t('PROJECT No')}`,
      cellDataType: 'text',
    },
    {
      field: 'projectTaskWO',
      headerName: `${t('TRACE No')}`,
      cellDataType: 'text',
    },
    {
      field: 'CREATE_BY',
      editable: false,
      filter: false,
      headerName: `${t('CREATE BY')}`,
      cellDataType: 'text',
    },
  ]);

  const handleSelectedRowKeysChange = (newSelectedRowKeys: React.Key[]) => {
    setSelectedRowKeys(newSelectedRowKeys);
  };
  const transformedPartNumbers = useMemo(() => {
    return transformToPartBooking(data || []);
  }, [data]);
  return (
    <div>
      <PartContainer
        isLoading={isLoading}
        isFilesVisiable={true}
        isVisible={true}
        pagination={true}
        isAddVisiable={true}
        isButtonVisiable={false}
        isEditable={true}
        height={'68vh'}
        columnDefs={columnDefs}
        partNumbers={[]}
        isChekboxColumn={true}
        onUpdateData={(data: any[]): void => {}}
        rowData={transformedPartNumbers}
        onCheckItems={setSelectedRowKeys}
        //
        onRowSelect={(data: any): void => {
          onSingleRowClick && onSingleRowClick(data);
        }}
      />
    </div>
  );
};

export default TechnicalView;
