import { ProColumns } from '@ant-design/pro-components';
import { MenuProps, message } from 'antd';
import { useColumnSearchProps } from '@/components/shared/Table/columnSearch';
import React, { FC, useEffect, useState } from 'react';
import { exportToExcel } from '@/services/utilites';
import { IMatData } from '@/types/TypesData';
import {
  DownloadOutlined,
  PrinterOutlined,
  PlusOutlined,
} from '@ant-design/icons';
import { useAppDispatch } from '@/hooks/useTypedSelector';
import { AplicationResponce } from '@/store/reducers/WPGenerationSlise';
import {
  createRequirement,
  findMaterialsByTaskNumbers,
} from '@/utils/api/thunks';
import EditableTable from '@/components/shared/Table/EditableTable';
import { useTranslation } from 'react-i18next';
import { USER_ID } from '@/utils/api/http';
type FilteredTasksListPropsType = {
  data: any;
  projectData: any;
  scroll: string;
  isLoading: boolean;
};
const MaterialItems: FC<FilteredTasksListPropsType> = ({
  data,
  isLoading,
  scroll,
  projectData,
}) => {
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const [visibleColumns, setVisibleColumns] = useState<string[]>([]);
  const [allRowKeys, setAllRowKeys] = useState<React.Key[]>([]);
  const { t } = useTranslation();
  const handleSelectedRowKeysChange = (newSelectedRowKeys: React.Key[]) => {
    setSelectedRowKeys(newSelectedRowKeys);
  };

  const handleVisibleColumnsChange = (newVisibleColumns: string[]) => {
    setVisibleColumns(newVisibleColumns);
  };
  type ObjectType = {
    _id: string;
    taskNumber: string;
    startOfWork: string;
    workInterval: string;
    amtoss: string;
    code: string;
    PN: string;
    alternative: string;
    nameOfMaterial: string;
    amout: number;
    unit: string;
  };

  function extractIds(objects: ObjectType[]): string[] {
    return objects.map((object) => object._id);
  }

  const [materials, setMaterials] = useState<any>([]);
  const dispatch = useAppDispatch();
  useEffect(() => {
    const fetchData = async () => {
      const companyID = localStorage.getItem('companyID');

      if (companyID) {
        const result = await dispatch(
          findMaterialsByTaskNumbers({
            taskDTO: data.tasks || data || [],
          })
        );
        if (result.meta.requestStatus === 'fulfilled') {
          // console.log(result.payload);

          setMaterials(result.payload.materials);
        }
      }
    };
    fetchData();
  }, [dispatch, data]);
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
    {
      title: 'Task Nbr',
      key: 'taskNumber',
      width: '10%',

      dataIndex: 'taskNumber',
    },
    {
      title: 'Код',
      dataIndex: 'code',
      key: 'code',

      responsive: ['sm'],
    },
    { title: `${t('PN')}`, dataIndex: 'PN', key: 'PN', responsive: ['sm'] },

    {
      title: `${t('DESCRIPTION')}`,
      dataIndex: 'nameOfMaterial',
      key: 'nameOfMaterial',
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
    {
      title: `${t('UNIT')}`,
      dataIndex: 'unit',
      key: 'unit',
      responsive: ['sm'],
      // sorter: (a, b) => a.unit.length - b.unit.length,
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
      label: `${t('Actions')}`,
      key: 'actions',
      icon: null,
      children: [
        getItem('Add Items to Requirements', 'sub5', <PlusOutlined />, [
          getItem(
            <div
              onClick={async () => {
                const selectedCount = selectedRowKeys && selectedRowKeys.length;
                if (selectedCount < 1) {
                  message.error('Please select  Items.');
                  return;
                }
                const result = await dispatch(
                  createRequirement({
                    ids: selectedRowKeys,
                    projectID: projectData._id,
                    companyID: projectData.companyID,
                    createDate: new Date(),
                    createUserID: USER_ID || '',
                    status: 'onCheack',
                    cascader: ['ed', 'check'],
                    rewiewStatus: 'waiting',
                    issuedQuantity: 0,
                  })
                );
                if (result.meta.requestStatus === 'fulfilled') {
                  message.success('Selected Requirements created');
                }
              }}
            >
              Selected Items
            </div>,
            '5.1'
          ),
          getItem(
            <div
              onClick={async () => {
                const result = await dispatch(
                  createRequirement({
                    ids: extractIds(materials),
                    projectID: projectData._id,
                    companyID: projectData.companyID,
                    createDate: new Date(),
                    createUserID: USER_ID || '',
                    status: 'onCheack',
                    cascader: ['ed', 'check'],
                    rewiewStatus: 'waiting',
                    issuedQuantity: 0,
                  })
                );
                if (result.meta.requestStatus === 'fulfilled') {
                  message.success('All Requirements created');
                }
              }}
            >
              All Items
            </div>,
            '5.12'
          ),
        ]),
      ],
    },
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
                  materials,
                  `Filtred-MaterialsTask-${data.aplicationName}`
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
                materials.length &&
                exportToExcel(
                  true,
                  selectedRowKeys,
                  visibleColumns,
                  materials,
                  `All MaterialsTask-${data.aplicationName}`
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
        data={materials}
        initialColumns={initialColumns}
        isLoading={isLoading}
        menuItems={items}
        onRowClick={function (record: any): void {
          console.log(record);
        }}
        onSave={function (rowKey: any, data: any, row: any): void {
          console.log(data);
        }}
        yScroll={46}
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

export default MaterialItems;
