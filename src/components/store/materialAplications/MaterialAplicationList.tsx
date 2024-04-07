import {
  Button,
  Empty,
  Modal,
  Skeleton,
  Checkbox,
  Form,
  Input,
  Select,
  InputRef,
  Space,
} from 'antd';
import Table, { ColumnType, ColumnsType, TableProps } from 'antd/es/table';
import { useAppDispatch, useTypedSelector } from '@/hooks/useTypedSelector';
import React, { FC, useRef, useState } from 'react';
import {
  IMatRequestAplication,
  MatRequestAplication,
} from '@/store/reducers/ProjectTaskSlise';
import MaterialAplicationView from './MaterialAplucationView';
import {
  setCurrentMaterialAplication,
  setCurrentMaterialAplicationStatus,
  setEditedMaterialAplication,
} from '@/store/reducers/MatirialAplicationsSlise';
import moment from 'moment';
import {
  createPickSlip,
  createPurchaseItems,
  getAllAplication,
  getAllMaterialAplication,
  getCountAllprojectsAplications,
  getSelectedItems,
  updateAplicationById,
  updateForReservation,
} from '@/utils/api/thunks';
import {
  EditOutlined,
  DeleteOutlined,
  CheckOutlined,
  PlusOutlined,
  PrinterOutlined,
  SearchOutlined,
} from '@ant-design/icons';
import toast, { Toaster } from 'react-hot-toast';

import { CheckboxChangeEvent } from 'antd/es/checkbox';
import { useNavigate } from 'react-router-dom';
import { RouteNames } from '@/router';
import { IMaterialStoreRequestItem } from '@/models/IMaterialStoreItem';
import {
  FilterValue,
  SorterResult,
  FilterConfirmProps,
} from 'antd/es/table/interface';
import Highlighter from 'react-highlight-words';

type AplicationsPropsType = {
  data: MatRequestAplication[];
};
const AplicationList: FC<AplicationsPropsType> = ({ data }) => {
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const [loading, setLoading] = useState(false);

  const idr = [];
  const onSelectChange = (newSelectedRowKeys: React.Key[]) => {
    setSelectedRowKeys(newSelectedRowKeys);

    dispatch(getSelectedItems(newSelectedRowKeys));
  };

  const rowSelection = {
    selectedRowKeys,
    onChange: onSelectChange,
  };
  const hasSelected = selectedRowKeys.length > 0;

  const [searchText, setSearchText] = useState('');
  const [searchedColumn, setSearchedColumn] = useState('');
  const [filteredInfo, setFilteredInfo] = useState<
    Record<string, FilterValue | null>
  >({});
  const [sortedInfo, setSortedInfo] = useState<
    SorterResult<MatRequestAplication>
  >({});
  const handleChange: TableProps<MatRequestAplication>['onChange'] = (
    pagination,
    filters,
    sorter
  ) => {
    console.log('Various parameters', pagination, filters, sorter);
    setFilteredInfo(filters);
    setSortedInfo(sorter as SorterResult<MatRequestAplication>);
  };

  const clearFilters = () => {
    setFilteredInfo({});
  };

  const clearAll = () => {
    setFilteredInfo({});
    setSortedInfo({});
  };

  const setAgeSort = () => {
    setSortedInfo({
      order: 'descend',
      columnKey: 'age',
    });
  };

  const searchInput = useRef<InputRef>(null);
  type DataIndex = keyof MatRequestAplication;
  const handleSearch = (
    selectedKeys: string[],
    confirm: (param?: FilterConfirmProps) => void,
    dataIndex: DataIndex
  ) => {
    confirm();
    setSearchText(selectedKeys[0]);
    setSearchedColumn(dataIndex);
  };

  const handleReset = (clearFilters: () => void) => {
    clearFilters();
    setSearchText('');
  };

  const getColumnSearchProps = (
    dataIndex: DataIndex
  ): ColumnType<MatRequestAplication> => ({
    filterDropdown: ({
      setSelectedKeys,
      selectedKeys,
      confirm,
      clearFilters,
      close,
    }) => (
      <div style={{ padding: 8 }} onKeyDown={(e) => e.stopPropagation()}>
        <Input
          ref={searchInput}
          placeholder={`Search ${dataIndex}`}
          value={selectedKeys[0]}
          onChange={(e) =>
            setSelectedKeys(e.target.value ? [e.target.value] : [])
          }
          onPressEnter={() =>
            handleSearch(selectedKeys as string[], confirm, dataIndex)
          }
          style={{ marginBottom: 8, display: 'block' }}
        />
        <Space>
          <Button
            type="primary"
            onClick={() =>
              handleSearch(selectedKeys as string[], confirm, dataIndex)
            }
            icon={<SearchOutlined />}
            size="small"
            style={{ width: 90 }}
          >
            Search
          </Button>
          <Button
            onClick={() => clearFilters && handleReset(clearFilters)}
            size="small"
            style={{ width: 90 }}
          >
            Reset
          </Button>
          <Button
            type="link"
            size="small"
            onClick={() => {
              confirm({ closeDropdown: false });
              setSearchText((selectedKeys as string[])[0]);
              setSearchedColumn(dataIndex);
            }}
          >
            Filter
          </Button>
          <Button
            type="link"
            size="small"
            onClick={() => {
              close();
            }}
          >
            close
          </Button>
        </Space>
      </div>
    ),
    filterIcon: (filtered: boolean) => (
      <SearchOutlined style={{ color: filtered ? '#1677ff' : undefined }} />
    ),
    onFilter: (value, record) =>
      record[dataIndex]
        .toString()
        .toLowerCase()
        .includes((value as string).toLowerCase()),
    onFilterDropdownOpenChange: (visible) => {
      if (visible) {
        setTimeout(() => searchInput.current?.select(), 100);
      }
    },
    render: (text) =>
      searchedColumn === dataIndex ? (
        <Highlighter
          highlightStyle={{ backgroundColor: '#ffc069', padding: 0 }}
          searchWords={[searchText]}
          autoEscape
          textToHighlight={text ? text.toString() : ''}
        />
      ) : (
        text
      ),
  });

  const history = useNavigate();
  const [checked, setChecked] = useState(false);
  const [buttonDisabled, setButtonDisabled] = useState<boolean>(false);
  const [disabled, setDisabled] = useState(false);
  const [searchedText, setSerchedText] = useState('');

  const label = `${'Подтверждаю, введенную информацию'}`;
  const [searchedStatus, setSerchedStatus] = useState('');
  const dispatch = useAppDispatch();

  const { isLoading, currentMaterialsAplication } = useTypedSelector(
    (state) => state.materialAplication
  );

  const onChange = (e: CheckboxChangeEvent) => {
    setChecked(e.target.checked);
    if (
      !currentMaterialsAplication.editedAction?.editedStoreMaterials?.length
    ) {
    }
  };

  const columns: ColumnsType<MatRequestAplication> = [
    {
      title: 'Номер заявки',
      dataIndex: 'materialAplicationNumber',
      key: 'materialAplicationNumber',
      responsive: ['sm'],
      filteredValue: [searchedText],
      onFilter: (value: any, record: any) => {
        return (
          String(record?.materialAplicationNumber).includes(value) ||
          String(record.materialAplicationNumber)
            ?.toLowerCase()
            .includes(value.toLowerCase()) ||
          String(record.projectWO)
            ?.toLowerCase()
            .includes(value.toLowerCase()) ||
          String(record.projectTaskWO)
            ?.toLowerCase()
            .includes(value.toLowerCase())
        );
      },
      sorter: (a: any, b: any) =>
        a.materialAplicationNumber - b.materialAplicationNumber,
    },
    {
      title: 'Внутренний W/O',
      dataIndex: 'projectWO',
      key: 'projectWO',
      responsive: ['sm'],
    },
    {
      title: 'Номер карты',
      // dataIndex: ['projectTaskId', 'projectTaskWO'],
      dataIndex: 'projectTaskWO',
      key: 'projectTaskWO',
      responsive: ['sm'],
      // ...getColumnSearchProps('projectTaskWO'),
    },
    // {
    //   title: 'Amtoss',
    //   dataIndex: ['projectTaskId', 'optional', 'amtoss'],
    //   key: 'materialAplicationNumber',
    //   responsive: ['sm'],

    // },
    {
      title: 'Заказчик',
      // dataIndex: ['userId', 'email'] || 'user',
      dataIndex: 'user',
      key: 'performedSing',
      responsive: ['sm'],
      // ...getColumnSearchProps('user'),
      // width: 150,
    },
    {
      title: 'Дата создания',
      dataIndex: 'createDate',
      key: 'createDate',
      responsive: ['sm'],
      render(text: Date) {
        return moment(text).format('D.MM.YY, HH:mm');
      },
      sorter: (a, b) =>
        moment(a.createDate).unix() - moment(b.createDate).unix(),
    },

    {
      title: 'Тип ВС',
      dataIndex: 'planeType',
      key: 'planeType',
      responsive: ['sm'],
      // width: 150,
    },
    {
      title: 'Номер ВС',
      dataIndex: 'registrationNumber',
      key: 'registrationNumber',
      responsive: ['sm'],
      // width: 150,
    },
    {
      title: 'Статус',
      dataIndex: 'status',
      key: 'status',
      responsive: ['sm'],
      render(text) {
        if (text == 'расходное требование создано') {
          return {
            props: {
              style: { background: '#09F600' },
            },
            children: <div>закрыта</div>,
          };
        } else if (text == 'собрана') {
          return {
            props: {
              style: { background: '#097800' },
            },
            children: <div>{text}</div>,
          };
        } else if (text == 'отложена') {
          return {
            props: {
              style: { background: '' },
            },
            children: <div>Новая</div>,
          };
        } else if (text == 'в работе') {
          return {
            props: {
              style: { background: '#FBAC05' },
            },
            children: <div>{text}</div>,
          };
        } else if (text == 'частично закрыта') {
          return {
            props: {
              style: { background: '#e63715' },
            },
            children: <div>{text}</div>,
          };
        } else if (text == 'частично собрана') {
          return {
            props: {
              style: { background: '#e63715' },
            },
            children: <div>{text}</div>,
          };
        } else if (text == 'в закупку') {
          return {
            props: {
              style: { background: '#e63715' },
            },
            children: <div>{text}</div>,
          };
        }
      },
      width: 150,
      filteredValue: [searchedStatus],
      onFilter: (value: any, record: any) => {
        return record.status.includes(String(value));
      },
    },
  ];
  const dataEmpty: readonly MatRequestAplication[] | undefined = [];
  const [open, setOpen] = useState(false);

  return (
    <div className="flex flex-col">
      <div className="flex gap-x-2">
        <Form.Item>
          <Input.Search
            style={{ width: 170 }}
            allowClear
            placeholder="Поиск..."
            onSearch={(value) => {
              setSerchedText(value);
            }}
            onChange={(e) => {
              setSerchedText(e.target.value);
            }}
          />
        </Form.Item>
        <Form.Item name="status">
          <Select
            style={{ width: 170 }}
            placeholder="Статус задачи"
            allowClear
            onClear={() => setSerchedStatus('')}
            onSelect={setSerchedStatus}
          >
            <Select.Option value="отложен">Новые</Select.Option>
            <Select.Option value="собрана">Собранные</Select.Option>
            <Select.Option value="в работе">В работе</Select.Option>
            <Select.Option value="расходное требование создано">
              Закрытые
            </Select.Option>
            {/* <Select.Option value="частично закрыта">
              Частично закрытые
            </Select.Option> */}
          </Select>
        </Form.Item>
      </div>

      <Table
        onChange={handleChange}
        rowClassName="cursor-pointer text-xs  text-transform: uppercase"
        columns={columns}
        pagination={{ defaultPageSize: 100 }}
        dataSource={data.length > 0 ? data : dataEmpty}
        bordered
        size="small"
        scroll={{ y: 'calc(65vh)' }}
        locale={{
          emptyText: isLoading ? <Skeleton active={true} /> : <Empty />,
        }}
        onRow={(record, rowIndex) => {
          return {
            onClick: async (event) => {
              setOpen(true);
              dispatch(setCurrentMaterialAplication(record));
              if (record.status == 'отложена') {
                dispatch(setCurrentMaterialAplicationStatus('в работе'));
              }
            },
          };
        }}
      ></Table>

      <Modal
        okButtonProps={{
          disabled:
            isLoading ||
            currentMaterialsAplication?.status === 'в работе' ||
            currentMaterialsAplication?.status === 'закрыта' ||
            currentMaterialsAplication.status === 'в закупку' ||
            !checked,
        }}
        title="Просмотр Заявки"
        centered
        open={open}
        cancelText="отмена"
        okType={'default'}
        okText={
          currentMaterialsAplication &&
          currentMaterialsAplication.status === 'расходное требование создано'
            ? 'Перейти к рассходным требованиям'
            : 'Создать расходное требование'
        }
        onOk={async () => {
          if (
            currentMaterialsAplication.status === 'расходное требование создано'
          ) {
            history(`${RouteNames.PICKSLIPS}`);
          }

          if (
            buttonDisabled ||
            ((currentMaterialsAplication.status === 'собрана' ||
              currentMaterialsAplication.status === 'частично собрана') &&
              !currentMaterialsAplication.isPickSlipCreated === true &&
              currentMaterialsAplication.editedAction.editedStoreMaterials
                .length > 0)
          ) {
            Modal.confirm({
              title: 'Вы уверены что хотите сформировать расходное требование?',
              okText: 'Да',
              cancelText: 'Отмена',
              okType: 'danger',
              onOk: async () => {
                function removeProperties(arr: any[]) {
                  return arr.map((obj) => {
                    let newObj = { ...obj };
                    delete newObj.RACK_NUMBER;
                    delete newObj.SHELF_NUMBER;
                    return newObj;
                  });
                }

                // if (
                //   buttonDisabled ||
                //   (currentMaterialsAplication.status === 'собрана' &&
                //     !currentMaterialsAplication.isPickSlipCreated === true &&
                //     currentMaterialsAplication.editedAction.editedStoreMaterials
                //       .length > 0)
                // ) {
                const result = await dispatch(
                  createPickSlip({
                    materialAplicationId:
                      currentMaterialsAplication._id ||
                      currentMaterialsAplication.id ||
                      '',
                    status: 'открыто',
                    materials: [
                      ...removeProperties(
                        currentMaterialsAplication.editedAction
                          .editedStoreMaterials
                      ),
                    ].flat(3),
                    createDate: new Date(),
                    consigneeName: currentMaterialsAplication.user,
                    taskNumber: currentMaterialsAplication.taskNumber,
                    registrationNumber:
                      currentMaterialsAplication.registrationNumber,
                    planeType: currentMaterialsAplication.planeType,
                    projectWO: currentMaterialsAplication.projectWO,
                    projectTaskWO: currentMaterialsAplication.projectTaskWO,
                    materialAplicationNumber:
                      currentMaterialsAplication.materialAplicationNumber,
                    additionalTaskId:
                      currentMaterialsAplication.additionalTaskId,
                    store: '10',
                    workshop: '0700',
                    neededOnID: undefined,
                  })
                );
                if (result.meta.requestStatus === 'fulfilled') {
                  dispatch(
                    updateAplicationById({
                      ...currentMaterialsAplication,
                      _id:
                        currentMaterialsAplication._id ||
                        currentMaterialsAplication.id,
                      status: 'расходное требование создано',
                      isPickSlipCreated: true,
                    })
                  );
                  toast.success('Расходное требование создано');
                }
                // }
              },
              onCancel: () => {
                // setOpen(false);
              },
            });
          }
        }}
        onCancel={() => {
          setOpen(false);
        }}
        width={'80%'}
      >
        <MaterialAplicationView data={currentMaterialsAplication} />
        <p style={{ marginBottom: '20px' }}>
          {currentMaterialsAplication &&
          currentMaterialsAplication.status ===
            'расходное требование создано' ? (
            <Checkbox
              checked={true}
              disabled={
                true ||
                localStorage.getItem('role') == 'boss' ||
                localStorage.getItem('role') == 'engineer' ||
                currentMaterialsAplication.status === 'в закупку'
              }
              onChange={onChange}
            >
              {label}
            </Checkbox>
          ) : (
            <Checkbox
              checked={checked}
              disabled={
                disabled ||
                localStorage.getItem('role') == 'boss' ||
                localStorage.getItem('role') == 'engineer' ||
                localStorage.getItem('role') == 'logistic' ||
                currentMaterialsAplication.status === 'в закупку'
              }
              onChange={onChange}
            >
              {label}
            </Checkbox>
          )}
        </p>
        <Button
          disabled={
            localStorage.getItem('role') == 'boss' ||
            localStorage.getItem('role') == 'logistic' ||
            localStorage.getItem('role') == 'engineer' ||
            buttonDisabled ||
            !checked ||
            currentMaterialsAplication.status === 'собрана' ||
            currentMaterialsAplication.status === 'частично собрана' ||
            currentMaterialsAplication.status === 'в закупку' ||
            currentMaterialsAplication.status ===
              'расходное требование создано' ||
            (!currentMaterialsAplication.editedAction.editedStoreMaterials
              .length &&
              !currentMaterialsAplication.editedAction.purchaseStoreMaterials
                ?.length)
          }
          onClick={async () => {
            Modal.confirm({
              title: 'Вы уверены, что хотите  уведомить заказчика ',

              okText: 'Да',
              cancelText: 'Отмена',
              okType: 'danger',
              onOk: async () => {
                if (
                  !currentMaterialsAplication.editedAction
                    .purchaseStoreMaterials?.length &&
                  currentMaterialsAplication.editedAction.editedStoreMaterials
                    ?.length
                ) {
                  const result = await dispatch(
                    updateAplicationById({
                      ...currentMaterialsAplication,
                      _id:
                        currentMaterialsAplication._id ||
                        currentMaterialsAplication.id,
                      status: 'собрана',
                    })
                  );
                  if (result.meta.requestStatus === 'fulfilled') {
                    dispatch(getAllMaterialAplication());
                    dispatch(getCountAllprojectsAplications());
                    toast.success('Заявка собрана');
                    currentMaterialsAplication.editedAction.editedStoreMaterials.forEach(
                      (item: IMaterialStoreRequestItem) => {
                        dispatch(updateForReservation(item));
                      }
                    );
                  } else {
                    toast.error('Информация не обновлена');
                  }
                } else if (
                  currentMaterialsAplication.editedAction.purchaseStoreMaterials
                    ?.length &&
                  !currentMaterialsAplication.editedAction.editedStoreMaterials
                    ?.length
                ) {
                  const result = await dispatch(
                    updateAplicationById({
                      ...currentMaterialsAplication,
                      _id:
                        currentMaterialsAplication._id ||
                        currentMaterialsAplication.id,
                      status: 'в закупку',
                    })
                  );
                  if (result.meta.requestStatus === 'fulfilled') {
                    dispatch(
                      createPurchaseItems(
                        currentMaterialsAplication.editedAction
                          .purchaseStoreMaterials
                      )
                    );
                    dispatch(getAllMaterialAplication());
                    dispatch(getCountAllprojectsAplications());
                    toast.success('Материалы отправлены в закупку');
                    // currentMaterialsAplication.editedAction.editedStoreMaterials.forEach(
                    //   (item: IMaterialStoreRequestItem) => {
                    //     dispatch(updateForReservation(item));
                    //   }
                    // );
                  } else {
                    toast.error('Информация не обновлена');
                  }
                } else if (
                  currentMaterialsAplication.editedAction.purchaseStoreMaterials
                    ?.length &&
                  currentMaterialsAplication.editedAction.editedStoreMaterials
                    ?.length
                ) {
                  const result = await dispatch(
                    updateAplicationById({
                      ...currentMaterialsAplication,
                      _id:
                        currentMaterialsAplication._id ||
                        currentMaterialsAplication.id,
                      status: 'частично собрана',
                    })
                  );
                  if (result.meta.requestStatus === 'fulfilled') {
                    dispatch(
                      createPurchaseItems(
                        currentMaterialsAplication.editedAction
                          .purchaseStoreMaterials
                      )
                    );
                    dispatch(getAllMaterialAplication());
                    dispatch(getCountAllprojectsAplications());
                    toast.success(
                      'Заявка частично собрана, недастоющие материалы отправлены в закупку'
                    );
                    currentMaterialsAplication.editedAction.editedStoreMaterials.forEach(
                      (item: IMaterialStoreRequestItem) => {
                        dispatch(updateForReservation(item));
                      }
                    );
                  } else {
                    toast.error('Информация не обновлена');
                  }
                }
              },
            });
          }}
        >
          Применить
        </Button>
      </Modal>
      <Toaster position="top-center" reverseOrder={false} />
    </div>
  );
};

export default AplicationList;
