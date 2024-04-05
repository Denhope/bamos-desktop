import ContextMenuWrapper from '@/components/shared/ContextMenuWrapperProps';
import EditableTable from '@/components/shared/Table/EditableTable';
import { IRequirement } from '@/models/IRequirement';
import { ProColumns } from '@ant-design/pro-components';
import { Tag, TimePicker } from 'antd';

import React, { FC } from 'react';
import { useTranslation } from 'react-i18next';
type RequirementsListPropsType = {
  data: IRequirement[];
  scroll: number;
  scrollX?: number;
  isLoading: boolean;
  onSingleRowClick?: (record: any) => void;
  onDoubleRowClick?: (record: any) => void;
  foForecast?: boolean;
};
const RequirementsList: FC<RequirementsListPropsType> = ({
  data,
  onDoubleRowClick,
  onSingleRowClick,
  isLoading,
  scroll,
  scrollX,
}) => {
  const handleCopy = (target: EventTarget | null) => {
    const value = (target as HTMLDivElement).innerText;
    navigator.clipboard.writeText(value);
  };
  const handleAddPick = (target: EventTarget | null) => {
    const value = (target as HTMLDivElement).innerText;
    console.log('Добавить Pick:', value);
  };
  const { t } = useTranslation();
  const initialColumns: ProColumns<any>[] = [
    {
      title: '',
      dataIndex: 'readyStatus',
      key: 'readyStatus',
      width: '3%',
      editable: (text, record, index) => {
        return false;
      },
      valueType: 'select',

      filters: true,
      onFilter: true,
      valueEnum: {
        'not Ready': { text: t('NOT AVAILABLE') },
        Ready: { text: t('AVAILABLE') },
      },
      render: (text: any, record: any) => {
        let color =
          record?.availableQTY &&
          record.availableQTY >= (record?.amout - record?.issuedQuantity || 0)
            ? 'green'
            : 'red';
        return (
          <Tag
            color={color}
            style={{ borderRadius: '50%', width: '16px', height: '16px' }}
          />
        );
      },
    },
    {
      title: `${t('REQUIREMENT No')}`,
      dataIndex: 'partRequestNumberNew',
      // valueType: 'index',
      ellipsis: true,
      width: '4%',

      editable: (text, record, index) => {
        return false;
      },
      render: (text: any, record: any) => {
        return (
          <a>{record?.partRequestNumberNew && record?.partRequestNumberNew}</a>
        );
      },
      // sorter: (a, b) => (a.id || 0) - (b.id || 0),
    },
    {
      title: `${t('Status')}`,
      key: 'status',
      width: '7%',
      valueType: 'select',
      // filterSearch: true,
      // filters: true,
      editable: (text, record, index) => {
        return false;
      },

      valueEnum: {
        draft: { text: t('DRAFT'), status: 'Default' },
        inStockReserve: { text: t('RESERVATION'), status: 'SUCCESS' },
        onQuatation: { text: t('QUATATION'), status: 'Warning' },
        onShort: { text: t('ON SHORT'), status: 'Warning' },

        //onPurchasing: { text: t('PURCHASING'), status: 'Processing' },
        onCheack: { text: t('CHECK'), status: 'Warning' },
        open: { text: t('NEW'), status: 'Error' },
        closed: { text: t('CLOSED'), status: 'Default' },
        canceled: { text: t('CANCELLED'), status: 'Error' },
        onOrder: { text: t('ISSUED'), status: 'Processing' },
      },

      dataIndex: 'status',
    },
    {
      title: `${t('WO No')}`,
      dataIndex: 'taskWO',
      key: 'taskWO',
      width: '7%',
      editable: (text, record, index) => {
        return false;
      },
      render: (text: any, record: any) => {
        return <>{record?.projectTaskID?.projectTaskWO}</>;
      },
    },
    {
      title: `${t('PROJECT')}`,
      dataIndex: 'projectWO',
      key: 'projectWO',
      width: '5%',
      render: (text: any, record: any) => {
        return <>{record?.projectTaskID?.projectWO}</>;
      },
    },
    {
      title: `${t('RECEIVER')}`,
      dataIndex: 'planeNumber',
      width: '5%',
      key: 'planeNumber',
      responsive: ['sm'],
      render: (text: any, record: any) => {
        return <>{record?.projectTaskID?.plane?.registrationNumber}</>;
      },
    },

    {
      title: `${t('PART No')}`,
      dataIndex: 'PN',
      key: 'PN',
      ellipsis: true,
      //tooltip: 'ITEM PART_NUMBER',
      // ellipsis: true,
      width: '10%',
      formItemProps: {
        name: 'PN',
      },
      render: (text: any, record: any) => {
        return (
          <ContextMenuWrapper
            items={[
              {
                label: 'Copy',
                action: handleCopy,
              },
              {
                label: 'Open with',
                action: () => {},
                submenu: [
                  // { label: 'PART TRACKING', action: handleAdd },
                  { label: 'PICKSLIP REQUEST', action: handleAddPick },
                ],
              },
            ]}
          >
            <a onClick={() => {}}>{record?.partNumberID?.PART_NUMBER}</a>
          </ContextMenuWrapper>
        );
      },

      // responsive: ['sm'],
    },

    {
      title: `${t('DESCRIPTION')}`,
      dataIndex: 'nameOfMaterial',
      key: 'nameOfMaterial',
      // responsive: ['sm'],

      ellipsis: true, //
      width: '10%',
      render: (text: any, record: any) => {
        return <>{record?.partNumberID?.DESCRIPTION}</>;
      },
    },
    {
      title: `${t('GROUP')}`,
      dataIndex: 'group',
      key: 'group',
      // responsive: ['sm'],

      ellipsis: true, //
      width: '6%',
      render: (text: any, record: any) => {
        return <>{record?.partNumberID?.GROUP}</>;
      },
    },
    // {
    //   title: `${t('DUE DATE')}`,
    //   dataIndex: 'dueDate',
    //   key: 'dueDate',
    //   // responsive: ['sm'],

    //   ellipsis: true, //
    //   width: '6%',
    // },
    {
      title: `${t('PLANNED DATE')}`,
      dataIndex: 'plannedDate',
      key: 'plannedDate',
      ellipsis: true,
      width: '6%',
      render(value: any, record: any) {
        // Преобразование даты в более читаемый формат
        const date = new Date(record.plannedDate);
        const formattedDate = record.plannedDate && date.toLocaleDateString();
        return formattedDate;
      },
      sorter: (a, b) => {
        if (a.plannedDate && b.plannedDate) {
          const aFinishDate = new Date(a.plannedDate);
          const bFinishDate = new Date(b.plannedDate);
          return aFinishDate.getTime() - bFinishDate.getTime();
        } else {
          return 0; // default value
        }
      },
      // renderFormItem: () => {
      //   return <DatePicker />;
      // },
    },

    // {
    //   title: `${t('PRIO')}`,
    //   dataIndex: 'prio',
    //   key: 'prio',
    //   width: '3%',
    //   responsive: ['sm'],
    //   // sorter: (a, b) => a.unit.length - b.unit.length,
    // },

    {
      title: `${t('QTY')}`,
      dataIndex: 'amout',
      key: 'amout',
      width: '4%',
      editable: (text, record, index) => {
        return false;
      },
    },
    {
      title: `${t('UNIT')}`,
      dataIndex: 'unit',
      key: 'unit',
      width: '4%',
      responsive: ['sm'],
      render: (text: any, record: any) => {
        return <>{record?.partNumberID?.UNIT_OF_MEASURE}</>;
      },
    },
    {
      title: `${t('REQUESTED QTY')}`,
      dataIndex: 'issuedQuantity',
      width: '7%',
      key: 'issuedQuantity',
      editable: (text, record, index) => {
        return false;
      },
      render: (text: any, record: any) => {
        // Вычисляем разницу между record.amout и record.issuedQuantity
        const difference = record.amout - record.issuedQuantity;
        // Определяем цвет фона в зависимости от условия
        const backgroundColor = difference > 0 ? '#f0be37' : '';
        return (
          <div
            style={{ backgroundColor }} // Применяем цвет фона
          >
            {record?.issuedQuantity && record?.issuedQuantity}
          </div>
        );
      },
    },

    {
      title: `${t(' BOOKED QTY')}`,
      width: '6%',
      dataIndex: 'bookedQuantity',
      key: 'bookedQuantity',
      editable: (text, record, index) => {
        return false;
      },
      render: (text: any, record: any) => {
        const difference = record.amout - record.issuedQuantity;
        // Определяем цвет фона в зависимости от условия
        const backgroundColor = difference > 0 ? '#f0be37' : '#62d156';
        return (
          <div style={{ backgroundColor }}>
            {record?.bookedQuantity && record?.bookedQuantity}
          </div>
        );
      },
      // responsive: ['sm'],
    },
    {
      title: `${t('AVAIL QTY')}`,
      dataIndex: 'availableQTY',
      key: 'availableQTY',
      width: '4%',
      responsive: ['sm'],
      // sorter: (a, b) => a.unit.length - b.unit.length,
    },
    {
      title: `${t('LINK QTY')}`,
      dataIndex: 'reservationQTY',
      key: 'reservationQTY',
      width: '4%',
      responsive: ['sm'],
      // sorter: (a, b) => a.unit.length - b.unit.length,
      render: (text: any, record: any) => {
        const difference = record.amout - record.reservedQuantity;
        // Определяем цвет фона в зависимости от условия
        const backgroundColor = difference > 0 ? '#f0be37' : '#62d156';
        return (
          <div style={{ backgroundColor }}>
            {record.reservedQuantity && record.reservedQuantity}
          </div>
        );
      },
    },
    {
      title: `${t('MAT UNAV.')}`,
      dataIndex: 'unAvailableQTY',
      key: 'unAvailableQTY',
      width: '4%',
      responsive: ['sm'],
      render: (text: any, record: any) => {
        return (
          <div>
            {record.unAvailableQTY &&
            record.unAvailableQTY > 0 &&
            record.unAvailableQTY
              ? record.unAvailableQTY
              : '-'}
          </div>
        );
      },
      // sorter: (a, b) => a.unit.length - b.unit.length,
    },
    {
      title: `${t('NEEDED ON')}`,
      dataIndex: 'neededOn',
      key: 'neededOn',
      width: '4%',
      responsive: ['sm'],
      // sorter: (a, b) => a.unit.length - b.unit.length,
    },
    {
      title: `${t('DELIVERY DATE')}`,
      dataIndex: 'deliveryDate',
      key: 'deliveryDate',
      width: '5%',
      responsive: ['sm'],
      // sorter: (a, b) => a.unit.length - b.unit.length,
    },
  ];
  return (
    <div>
      <EditableTable
        data={data}
        recordCreatorProps={false}
        showSearchInput={true}
        initialColumns={initialColumns}
        isLoading={isLoading}
        menuItems={[]}
        onDoubleRowClick={function (record: any, rowIndex?: any): void {
          onDoubleRowClick && onDoubleRowClick(record);
        }}
        onRowClick={function (record: any): void {
          onSingleRowClick?.(record);
        }}
        yScroll={scroll}
        xScroll={scrollX}
        externalReload={function () {
          null;
        }}
        onSave={function (rowKey: any, data: any, row: any): void {
          null;
        }}
      ></EditableTable>
    </div>
  );
};

export default RequirementsList;
