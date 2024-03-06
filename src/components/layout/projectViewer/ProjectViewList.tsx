import { ProColumns } from '@ant-design/pro-components';
import { DatePicker } from 'antd';
import EditableTable from '@/components/shared/Table/EditableTable';
import React, { FC } from 'react';
import { useTranslation } from 'react-i18next';
type showProjectListType = {
  scroll: number;

  onSelectedIds?: (record: any) => void;
  onSingleRowClick?: (record: any) => void;
  onDoubleRowClick?: (record: any) => void;
  selectedProjects?: any;
  projects?: any;
};
//
const { RangePicker } = DatePicker;

const ProjectViewList: FC<showProjectListType> = ({
  scroll,
  onDoubleRowClick,
  onSingleRowClick,
  onSelectedIds,

  projects,
  selectedProjects,
}) => {
  const { t } = useTranslation();
  const initialColumns: ProColumns<any>[] = [
    {
      title: `${t('PROJECT No')}`,
      dataIndex: 'projectWO',
      key: 'projectWO',
      // tip: 'LOCAL_ID',
      ellipsis: true,
      // width: '13%',

      // responsive: ['sm'],
    },
    {
      title: `${t('NAME')}`,
      dataIndex: 'projectName', // обновлено
      key: 'projectName', // обновлено
      ellipsis: true,
    },
    {
      title: `${t('TYPE')}`,
      dataIndex: 'projectType', // обновлено
      key: 'projectType', // обновлено
      ellipsis: true,
    },
    {
      title: `${t('CUSTOMER')}`,
      dataIndex: 'customer', // обновлено
      key: 'customer', // обновлено
      ellipsis: true,
    },

    {
      title: `${t('STATUS')}`,
      dataIndex: 'status',
      key: 'status',
      ellipsis: true,
      // width: '10%',

      editable: (text, record, index) => {
        return false;
      },
      render: (text: any, record: any) => {
        // Определяем цвет фона в зависимости от условия
        let backgroundColor;
        if (record.state === 'CLOSED') {
          backgroundColor = '#62d156';
        } else if (
          record.status === 'OPEN' ||
          record.status === 'open' ||
          record.status === 'DRAFT'
        ) {
          backgroundColor = '	#BEBEBE';
        } else {
          backgroundColor = '#f0be37';
        }
        return (
          <div style={{ backgroundColor }}>
            {record.status && record.status}
          </div>
        );
      },
    },
    {
      title: `${t('CREATE DATE')}`,
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
    {
      title: `${t('PLANED START DATE')}`,
      editable: (text, record, index) => {
        return false;
      },

      dataIndex: 'planedStartDate',
      key: 'planedStartDate',
      // width: '9%',
      responsive: ['lg'],
      valueType: 'date',
      sorter: (a, b) => {
        if (a.planedStartDate && b.planedStartDate) {
          const aFinishDate = new Date(a.planedStartDate);
          const bFinishDate = new Date(b.planedStartDate);
          return aFinishDate.getTime() - bFinishDate.getTime();
        } else {
          return 0; // default value
        }
      },
      renderFormItem: () => {
        return <RangePicker />;
      },
    },
    {
      title: `${t('PLANED FINISH DATE')}`,
      editable: (text, record, index) => {
        return false;
      },

      dataIndex: 'planedFinishDate',
      key: 'planedFinishDate',
      // width: '9%',
      responsive: ['lg'],
      valueType: 'date',
      sorter: (a, b) => {
        if (a.planedFinishDate && b.planedFinishDate) {
          const aFinishDate = new Date(a.planedFinishDate);
          const bFinishDate = new Date(b.planedFinishDate);
          return aFinishDate.getTime() - bFinishDate.getTime();
        } else {
          return 0; // default value
        }
      },
      renderFormItem: () => {
        return <RangePicker />;
      },
    },
    {
      title: `${t(' DATE IN')}`,
      editable: (text, record, index) => {
        return false;
      },

      dataIndex: 'startDate',
      key: 'startDate',
      // width: '9%',
      responsive: ['lg'],
      valueType: 'date',
      sorter: (a, b) => {
        if (a.startDate && b.startDate) {
          const aFinishDate = new Date(a.startDate);
          const bFinishDate = new Date(b.startDate);
          return aFinishDate.getTime() - bFinishDate.getTime();
        } else {
          return 0; // default value
        }
      },
      renderFormItem: () => {
        return <RangePicker />;
      },
    },
    {
      title: `${t(' DATE OUT')}`,
      editable: (text, record, index) => {
        return false;
      },

      dataIndex: 'finishDate',
      key: 'finishDate',
      // width: '9%',
      responsive: ['lg'],
      valueType: 'date',
      sorter: (a, b) => {
        if (a.finishDate && b.finishDate) {
          const aFinishDate = new Date(a.finishDate);
          const bFinishDate = new Date(b.finishDate);
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
    <div className="flex w-[100%] my-0 mx-auto flex-col  h-[78vh] relative overflow-hidden">
      <EditableTable
        showSearchInput={false}
        data={projects}
        initialColumns={initialColumns}
        // isLoading={isLoading}
        menuItems={undefined}
        recordCreatorProps={false}
        isNoneRowSelection={true}
        xScroll={450}
        onDoubleRowClick={function (record: any, rowIndex?: any): void {
          onDoubleRowClick?.(record);
        }}
        onRowClick={function (record: any, rowIndex?: any): void {
          onSingleRowClick?.(record);
          // console.log(record);
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

export default ProjectViewList;
