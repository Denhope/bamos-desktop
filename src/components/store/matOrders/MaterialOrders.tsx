import { ProColumns } from '@ant-design/pro-components';
import { DatePicker, TimePicker } from 'antd';
import EditableTable from '@/components/shared/Table/EditableTable';
import { useColumnSearchProps } from '@/components/shared/Table/columnSearch';
import { useAppDispatch, useTypedSelector } from '@/hooks/useTypedSelector';
import moment from 'moment';
import React, { FC, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { MaterialOrder } from '@/store/reducers/StoreLogisticSlice';
import { getFilteredMaterialOrders } from '@/utils/api/thunks';
export interface MaterialOrdersListPrors {
  data: MaterialOrder[] | [];
  scroll: number;
  isLoading: boolean;
  onRowClick: (record: any) => void;
  onDoubleRowClick?: (record: any) => void;
  canselVoidType?: boolean;
}
const MaterialOrdersList: FC<MaterialOrdersListPrors> = ({
  data,
  // isLoading,
  onRowClick,
  onDoubleRowClick,
  scroll,
  canselVoidType,
}) => {
  const dispatch = useAppDispatch();
  const { filteredMaterialOrders, filteredPickSlipsForCancel, isLoading } =
    useTypedSelector((state) => state.storesLogistic);
  // useEffect(() => {
  //   const currentCompanyID = localStorage.getItem('companyID');
  //   if (currentCompanyID) {
  //     // Вызываем функцию сразу при монтировании компонента
  //     dispatch(
  //       getFilteredMaterialOrders({
  //         companyID: currentCompanyID,
  //         projectId: '',
  //       })
  //     );

  //     // Затем устанавливаем интервал для повторного вызова функции каждые 3 минуты
  //     const intervalId = setInterval(() => {
  //       dispatch(
  //         getFilteredMaterialOrders({
  //           companyID: currentCompanyID,
  //           projectId: '',
  //         })
  //       );
  //     }, 180000); // 180000 миллисекунд = 3 минуты

  //     // Не забываем очистить интервал при размонтировании компонента
  //     return () => clearInterval(intervalId);
  //   }
  // }, []);
  useEffect(() => {
    setRequirements(
      canselVoidType ? filteredPickSlipsForCancel : filteredMaterialOrders
    );
    setInitialRequirements(
      canselVoidType ? filteredPickSlipsForCancel : filteredMaterialOrders
    );
  }, [canselVoidType ? filteredPickSlipsForCancel : filteredMaterialOrders]);
  const { t } = useTranslation();
  const [materialsRequirements, setRequirements] = useState<any>([]);
  const [initialMaterialsRequirements, setInitialRequirements] = useState<any>([
    canselVoidType ? filteredPickSlipsForCancel : filteredMaterialOrders,
  ]);

  const { RangePicker } = DatePicker;
  const initialColumns: ProColumns<any>[] = [
    {
      title: `${t('Status')}`,
      key: 'status',
      width: '10%',
      valueType: 'select',
      filterSearch: true,
      filters: true,
      editable: (text, record, index) => {
        return false;
      },
      onFilter: true,
      valueEnum: {
        issued: { text: t('ISSUED'), status: 'Processing' },
        open: { text: t('NEW'), status: 'Error' },
        closed: { text: t('CLOSED'), status: 'Default' },
        cancelled: { text: t('CANCELLED'), status: 'Error' },
        partyCancelled: { text: t('PARTY_CANCELLED'), status: 'Error' },
        transfer: { text: t('TRANSFER'), status: 'Processing' },
        completed: { text: t('COMPLETED'), status: 'Success' },
      },

      dataIndex: 'status',
    },
    {
      title: `${t('MAT ORDER NBR')}`,
      dataIndex: 'materialAplicationNumber',
      key: 'materialAplicationNumber',
      // responsive: ['sm'],
      // filteredValue: [searchedText],
      editable: (text, record, index) => {
        return false;
      },
      render: (text: any, record: any) => {
        return (
          <a
            onClick={() => {
              // dispatch(setCurrentProjectTask(record));
              // setOpenRequirementDrawer(true);
              onRowClick(record);
            }}
          >
            {record.materialAplicationNumber}
          </a>
        );
      },
      ...useColumnSearchProps({
        dataIndex: 'materialAplicationNumber',
        onSearch: (value) => {
          if (value) {
            // Отфильтруйте данные на основе поискового запроса
            const filteredData = materialsRequirements.filter((item: any) =>
              item.materialAplicationNumber
                .toString()
                .toLowerCase()
                .includes(value.toLowerCase())
            );
            // Обновление данных в таблице
            setRequirements(filteredData);
          } else {
            // Отобразите все данные, если поисковый запрос пуст
            setRequirements(initialMaterialsRequirements);
          }
        },
        data: materialsRequirements,
      }),
    },
    {
      title: `${t('SEND TO')}`,
      dataIndex: 'neededOn',
      key: 'neededOn',

      width: '7%',
    },
    {
      title: `${t('SEND FROM')}`,
      dataIndex: 'getFrom',
      key: 'storeFrom',
      width: '7%',
    },
    {
      title: 'MECH',
      dataIndex: 'createBy',
      key: 'createBy',
      responsive: ['sm'],
      ellipsis: true,
    },
    {
      title: `${t('RECEIVER')}`,
      dataIndex: 'registrationNumber',
      key: 'registrationNumber',
      ...useColumnSearchProps({
        dataIndex: 'registrationNumber',
        onSearch: (value) => {
          if (value) {
            // Отфильтруйте данные на основе поискового запроса
            const filteredData = materialsRequirements.filter((item: any) =>
              item.registrationNumber
                .toString()
                .toLowerCase()
                .includes(value.toLowerCase())
            );
            // Обновление данных в таблице
            setRequirements(filteredData);
          } else {
            // Отобразите все данные, если поисковый запрос пуст
            setRequirements(initialMaterialsRequirements);
          }
        },
        data: materialsRequirements,
      }),
    },

    {
      title: `${t('WORKORDER')}`,
      dataIndex: 'projectTaskWO',
      key: 'projectTaskWO',
      // responsive: ['sm'],

      ...useColumnSearchProps({
        dataIndex: 'projectTaskWO',
        onSearch: (value) => {
          if (value) {
            // Отфильтруйте данные на основе поискового запроса
            const filteredData = materialsRequirements.filter((item: any) =>
              String(item.projectTaskWO)
                .toString()
                .toLowerCase()
                .includes(value.toLowerCase())
            );
            // Обновление данных в таблице
            setRequirements(filteredData);
          } else {
            // Отобразите все данные, если поисковый запрос пуст
            setRequirements(initialMaterialsRequirements);
          }
        },
        data: materialsRequirements,
      }),
    },
    {
      title: `${t('PROJECT')}`,
      dataIndex: 'projectWO',
      key: 'projectWO',
      // responsive: ['sm'],
      ...useColumnSearchProps({
        dataIndex: 'projectWO',
        onSearch: (value) => {
          if (value) {
            // Отфильтруйте данные на основе поискового запроса
            const filteredData = materialsRequirements.filter((item: any) =>
              String(item.projectWO)
                .toString()
                .toLowerCase()
                .includes(value.toLowerCase())
            );
            // Обновление данных в таблице
            setRequirements(filteredData);
          } else {
            // Отобразите все данные, если поисковый запрос пуст
            setRequirements(initialMaterialsRequirements);
          }
        },
        data: materialsRequirements,
      }),
    },

    {
      title: `${t('ISSUED')}`,
      editable: (text, record, index) => {
        return false;
      },

      dataIndex: 'createDate',
      key: 'createDate',
      // width: '7%',
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
      title: `${t('TIME ISSUED')}`,
      editable: (text, record, index) => {
        return false;
      },
      dataIndex: 'createDate',
      key: 'createDate',

      width: '7%',
      responsive: ['lg'],
      valueType: 'dateTime',
      sorter: (a, b) => {
        if (a.createDate && b.createDate) {
          const aFinishDate = new Date(a.createDate);
          const bFinishDate = new Date(b.createDate);
          return aFinishDate.getTime() - bFinishDate.getTime();
        } else {
          return 0; // default value
        }
      },
      render: (_, record) => {
        const date = new Date(record.createDate);
        return `${date.getUTCHours()}:${date.getUTCMinutes()}`;
      },
      renderFormItem: () => {
        return <TimePicker />;
      },
    },

    {
      title: `${t('PLANNED DATE')}`,
      editable: (text, record, index) => {
        return false;
      },

      dataIndex: 'plannedDate',
      key: 'plannedDate',
      width: '9%',
      responsive: ['lg'],
      valueType: 'date',
      sorter: (a, b) => {
        if (a.plannedDate && b.plannedDate) {
          const aFinishDate = new Date(a.plannedDate);
          const bFinishDate = new Date(b.plannedDate);
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
      title: `${t('BOOKED')}`,
      editable: (text, record, index) => {
        return false;
      },

      dataIndex: 'closedDate',
      key: 'closedDate',
      width: '8%',
      responsive: ['lg'],
      valueType: 'date',
      sorter: (a, b) => {
        if (a.closedDate && b.closedDate) {
          const aFinishDate = new Date(a.closedDate);
          const bFinishDate = new Date(b.closedDate);
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
      title: `${t('TIME BOOKED')}`,
      editable: (text, record, index) => {
        return false;
      },
      width: '8%',
      dataIndex: 'closedDate',
      key: 'closedDate',
      responsive: ['lg'],
      valueType: 'dateTime',
      sorter: (a, b) => {
        if (a.closedDate && b.closedDate) {
          const aFinishDate = new Date(a.closedDate);
          const bFinishDate = new Date(b.closedDate);
          return aFinishDate.getTime() - bFinishDate.getTime();
        } else {
          return 0; // default value
        }
      },
      render: (_, record) => {
        if (record.closedDate) {
          const date = new Date(record.closedDate);
          return `${date.getUTCHours()}:${date.getUTCMinutes()}`;
        } else return '-';
      },
      renderFormItem: () => {
        return <TimePicker />;
      },
    },
    {
      title: `${t('REMARKS')}`,
      width: '8%',
      dataIndex: 'remarks',
      key: 'remarks',
      responsive: ['sm'],
    },
  ];
  return (
    <div className="flex my-0 mx-auto flex-col  h-[78vh] relative overflow-hidden">
      <EditableTable
        isNoneRowSelection={true}
        showSearchInput={true}
        data={materialsRequirements}
        initialColumns={initialColumns}
        isLoading={isLoading}
        menuItems={undefined}
        recordCreatorProps={false}
        xScroll={1750}
        onDoubleRowClick={function (record: any, rowIndex?: any): void {
          onDoubleRowClick && onDoubleRowClick(record);
        }}
        onRowClick={function (record: any, rowIndex?: any): void {
          onRowClick && onRowClick(record);
        }}
        onSave={function (rowKey: any, data: any, row: any): void {
          throw new Error('Function not implemented.');
        }}
        yScroll={scroll}
        externalReload={function (): Promise<void> {
          throw new Error('Function not implemented.');
        }}
      />
    </div>
  );
};

export default MaterialOrdersList;
