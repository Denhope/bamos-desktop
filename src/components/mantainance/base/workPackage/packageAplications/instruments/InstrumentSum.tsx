import { ProColumns } from '@ant-design/pro-components';
import { MenuProps } from 'antd';
import { useColumnSearchProps } from '@/components/shared/Table/columnSearch';
import React, { FC, useEffect, useState } from 'react';
import { exportToExcel } from '@/services/utilites';
import { IMatData } from '@/types/TypesData';
import { DownloadOutlined, PrinterOutlined } from '@ant-design/icons';
import { useAppDispatch } from '@/hooks/useTypedSelector';
import { AplicationResponce } from '@/store/reducers/WPGenerationSlise';
import {
  findInstrumentsByTaskNumbers,
  findMaterialsByTaskNumbers,
} from '@/utils/api/thunks';
import EditableTable from '@/components/shared/Table/EditableTable';
import { useTranslation } from 'react-i18next';

type FilteredTasksListPropsType = {
  data: any;

  scroll: string;
  isLoading: boolean;
};
const InstrumentSum: FC<FilteredTasksListPropsType> = ({
  data,
  isLoading,
  scroll,
}) => {
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const [visibleColumns, setVisibleColumns] = useState<string[]>([]);

  const handleSelectedRowKeysChange = (newSelectedRowKeys: React.Key[]) => {
    setSelectedRowKeys(newSelectedRowKeys);
  };

  const handleVisibleColumnsChange = (newVisibleColumns: string[]) => {
    setVisibleColumns(newVisibleColumns);
  };
  // const [filteredTaskNumberData, setFilteredTaskNumberData] = useState(data);
  const [instrumentItems, setInstrumentItems] = useState<any>([]);
  const dispatch = useAppDispatch();
  const { t } = useTranslation();
  useEffect(() => {
    const fetchData = async () => {
      const companyID = localStorage.getItem('companyID');

      if (companyID) {
        const result = await dispatch(
          findInstrumentsByTaskNumbers({
            taskDTO: data.tasks || data || [],
          })
        );
        if (result.meta.requestStatus === 'fulfilled') {
          // console.log(result.payload);

          setInstrumentItems(result.payload.uniqueInstruments);
        }
      }
    };
    fetchData();
  }, [dispatch]);
  const initialColumns: ProColumns<IMatData>[] = [
    {
      title: 'Index',
      dataIndex: 'id',
      valueType: 'index',
      width: '5%',

      editable: (text, record, index) => {
        return false;
      },
      // sorter: (a, b) => (a.id || 0) - (b.id || 0),
    },

    { title: `${t('PN')}`, dataIndex: 'PN', key: 'PN', responsive: ['sm'] },
    {
      title: 'Код',
      dataIndex: 'code',
      key: 'code',

      responsive: ['sm'],
    },

    {
      title: `${t('DESCRIPTION')}`,
      dataIndex: 'nameOfInstrument',
      key: 'nameOfInstrument',
      responsive: ['sm'],
      tooltip: 'Text Show',
      ellipsis: true,
    },
    {
      title: `${t('ALTERNATIVE')}`,
      dataIndex: 'alternative',
      key: 'alternative',
      responsive: ['sm'],
    },
    {
      title: `${t('QUANTITY')}`,
      dataIndex: 'amout',
      key: 'amout',
      // sorter: (a, b) => a.amout - b.amout,
      responsive: ['sm'],
    },
  ];

  type MenuItem = Required<MenuProps>['items'][number];
  function getItem(
    label: React.ReactNode,
    key?: React.Key | null,
    icon?: React.ReactNode,
    children?: any[],
    type?: 'group'
  ): MenuItem {
    return {
      key,
      icon,
      children,
      label,
      type,
    } as MenuItem;
  }

  const items: MenuProps['items'] = [
    {
      label: `${t('Report')}`,
      key: 'print',
      icon: null,
      children: [
        getItem('Print', 'sub4.1', null, [
          getItem('Selected Items', 'sub4.1.1', <PrinterOutlined />),
          getItem(
            <div
            // onClick={() => setOpenAddAppForm(true)}
            >
              <PrinterOutlined /> All Items
            </div>,
            '9ssxs'
          ),
        ]),

        getItem('Export to Exel', 'sub5', '', [
          getItem(
            <div
              onClick={() =>
                selectedRowKeys &&
                selectedRowKeys.length > 0 &&
                exportToExcel(
                  false,
                  selectedRowKeys,
                  visibleColumns,
                  instrumentItems,
                  `Filtred-SUMInstruments-${data.aplicationName}`
                )
              }
            >
              <DownloadOutlined /> Selected Items
            </div>,
            '5.1'
          ),
          getItem(
            <div
              onClick={() =>
                instrumentItems.length &&
                exportToExcel(
                  true,
                  selectedRowKeys,
                  visibleColumns,
                  instrumentItems,
                  `All SUMInstruments-${data.aplicationName}`
                )
              }
            >
              <PrinterOutlined /> All Items
            </div>,
            '5.2'
          ),
        ]),
        // ]),
      ],
    },
  ];
  return (
    <div className="flex my-0 mx-auto flex-col h-[67vh] relative overflow-hidden">
      <EditableTable
        recordCreatorProps={false}
        data={instrumentItems}
        initialColumns={initialColumns}
        isLoading={isLoading}
        menuItems={items}
        onRowClick={function (record: any): void {
          console.log(record);
        }}
        onSave={function (rowKey: any, data: any, row: any): void {
          console.log(data);
        }}
        yScroll={42}
        onSelectedRowKeysChange={handleSelectedRowKeysChange}
        onVisibleColumnsChange={handleVisibleColumnsChange}
        externalReload={function (): Promise<void> {
          throw new Error('Function not implemented.');
        }}
      ></EditableTable>
      {/* )} */}
    </div>
  );
};

export default InstrumentSum;
