import { ProColumns } from '@ant-design/pro-components';
import { DatePicker } from 'antd';
import EditableTable from '@/components/shared/Table/EditableTable';
import React, { FC } from 'react';
import { useTranslation } from 'react-i18next';
type showProjectListType = {
  scroll: number;
  onSelectedRequirements: (record: any) => void;
  onSelectedIds?: (record: any) => void;
  selectedRequirements?: any;
  requirements?: any;
};
//
const { RangePicker } = DatePicker;

const RequirementList: FC<showProjectListType> = ({
  scroll,
  onSelectedIds,
  onSelectedRequirements,
  requirements,
  selectedRequirements,
}) => {
  const { t } = useTranslation();
  const initialColumns: ProColumns<any>[] = [
    {
      title: `${t('REQUIREMENT No')}`,
      dataIndex: 'partRequestNumber',
      key: 'partRequestNumber',
      // tooltip: 'LOCAL_ID',
      ellipsis: true,
      // width: '13%',

      // responsive: ['sm'],
      sorter: (a, b) => {
        if (a.partRequestNumber && b.partRequestNumber) {
          return a.partRequestNumber - b.partRequestNumber;
        } else {
          return 0; // default value
        }
      },
    },

    {
      title: `${t('PROJECT')}`,
      dataIndex: 'projectWO', // обновлено
      key: 'projectWO', // обновлено
      ellipsis: true,
    },

    {
      title: `${t('STATUS')}`,
      dataIndex: 'status',
      valueType: 'select',
      key: 'status',
      ellipsis: true,
      // width: '10%',

      editable: (text, record, index) => {
        return false;
      },
      valueEnum: {
        inStockReserve: { text: t('RESERVATION'), status: 'SUCCESS' },
        //onPurchasing: { text: t('PURCHASING'), status: 'Processing' },
        onCheack: { text: t('CHECK'), status: 'Warning' },
        open: { text: t('NEW'), status: 'Error' },
        closed: { text: t('CLOSED'), status: 'Default' },
        canceled: { text: t('CANCELLED'), status: 'Error' },
        onOrder: { text: t('ISSUED'), status: 'Processing' },
      },

      // render: (text: any, record: any) => {
      //   // Определяем цвет фона в зависимости от условия
      //   let backgroundColor;
      //   if (record.state === 'closed') {
      //     backgroundColor = '#62d156';
      //   } else if (
      //     record.status === 'OPEN' ||
      //     record.status === 'open' ||
      //     record.status === 'DRAFT'
      //   ) {
      //     backgroundColor = 'red';
      //   } else {
      //     backgroundColor = '#f0be37';
      //   }
      //   return (
      //     <div style={{ backgroundColor }}>
      //       {/* {record.status && record.status} */}
      //     </div>
      //   );
      // },
    },
    {
      title: `${t('DATE')}`,
      editable: (text, record, index) => {
        return false;
      },

      dataIndex: 'createDate',
      key: 'createDate',
      // width: '9%',
      responsive: ['lg'],
      valueType: 'date',
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
        return <RangePicker />;
      },
    },
  ];
  return (
    <div className="flex w-[100%] my-3 mx-auto flex-col  h-[78vh] relative overflow-hidden">
      <EditableTable
        recordSearchProps={false}
        isOptionsNone={false}
        showSearchInput={false}
        data={requirements}
        initialColumns={initialColumns}
        // isLoading={isLoading}
        menuItems={undefined}
        recordCreatorProps={false}
        isNoneRowSelection={true}
        xScroll={450}
        onDoubleRowClick={function (record: any, rowIndex?: any): void {}}
        onRowClick={function (record: any, rowIndex?: any): void {
          onSelectedRequirements(record);
        }}
        onSave={function (rowKey: any, data: any, row: any): void {
          throw new Error('Function not implemented.');
        }}
        yScroll={scroll}
        externalReload={function (): Promise<void> {
          throw new Error('Function not implemented.');
        }}
        isLoading={false}
      />
    </div>
  );
};

export default RequirementList;
