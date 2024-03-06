import {
  Button,
  Layout,
  Menu,
  MenuProps,
  Modal,
  Space,
  Tag,
  message,
} from 'antd';
import Sider from 'antd/es/layout/Sider';
import { Content } from 'antd/es/layout/layout';
import React, { FC, useEffect, useState } from 'react';
import { getItem } from '@/services/utilites';
import { EditOutlined, ShoppingCartOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import StoreFilterForm from '../store/storeManagment/StoreFilterForm';
import { IStore, IStoreLocation } from '@/models/IStore';
import {
  ModalForm,
  ProColumns,
  ProDescriptions,
} from '@ant-design/pro-components';
import EditableTable from '@/components/shared/Table/EditableTable';
import CreateNewLocation from '../store/storeManagment/CreateNewLocation';
import { useAppDispatch } from '@/hooks/useTypedSelector';
import { updateStoreByID } from '@/utils/api/thunks';
import EditLocation from '../store/storeManagment/EditNewLocation';
import ShowParts from '../store/storeManagment/ShowParts';
import StoreEditForm from '../store/storeManagment/StoreEditForm';

const StoreManagment: FC = () => {
  const { t } = useTranslation();
  type MenuItem = Required<MenuProps>['items'][number];
  const [collapsed, setCollapsed] = useState(false);
  const [currentStore, setCurrenStore] = useState<IStore | null>(null);
  const [locations, setLocations] = useState<IStoreLocation[]>([]);
  const [openCreateLocation, setOpenCreateLocation] = useState(false);
  const [editCreateLocation, setOpenEditLocation] = useState(false);
  const [openShowParts, setOpenShowParts] = useState(false);
  const [openEditStore, setOpenEditStore] = useState(false);
  const sortedLocations = [...locations].sort((a, b) => {
    const [aLetter, aNumber] = a.locationName.split('-');
    const [bLetter, bNumber] = b.locationName.split('-');

    if (aLetter < bLetter) {
      return -1;
    } else if (aLetter > bLetter) {
      return 1;
    } else {
      return Number(aNumber) - Number(bNumber);
    }
  });

  const items: MenuItem[] = [
    getItem(
      <>{t('STORE MANAGEMENT (BAN:220)')}</>,
      'sub1',
      <ShoppingCartOutlined />
    ),
    // ]
    // ),
  ];
  useEffect(() => {
    setLocations(currentStore?.locations || []);
  }, [currentStore]);
  const initialReleseColumns: ProColumns<IStoreLocation>[] = [
    {
      title: `${t('LOCATION')}`,
      dataIndex: 'locationName',
      key: 'PN',
      ellipsis: true,

      editable: (text, record, index) => {
        return false;
      },
      width: '8%',

      // responsive: ['sm'],
    },
    {
      title: `${t('DESCRIPTION')}`,
      dataIndex: 'description',
      key: 'description',
      ellipsis: true,
      valueType: 'select',
      valueEnum: {
        LOCATION_FOR_UNSERVICEABLE_PARTS: {
          text: t('LOCATION FOR UNSERVICEABLE_PARTS'),
        },
        LOCATION_FOR_PARTS_IN_HANGAR: {
          text: t('LOCATION FOR PARTS IN HANGAR'),
        },
        LOCATION_FOR_PARTS_IN_INVENTORY: {
          text: t('LOCATION FOR PARTS IN INVENTORY'),
        },
        LOCATION_FOR_SERVICEABLE_PARTS: {
          text: t('LOCATION FOR SERVICEABLE PARTS'),
        },
        LOCATION_FOR_PARTS_TO_SCRAP: {
          text: t('LOCATION FOR PARTS TO SCRAP'),
        },
        LOCATION_FOR_PARTS_IN_QUARANTINE: {
          text: t('LOCATION FOR PARTS IN QUARANTINE'),
        },
        LOCATION_FOR_PARTS_ON_ROLLOUT: {
          text: t('LOCATION FOR PARTS ON ROLLOUT'),
        },
        LOCATION_FOR_PARTS_IN_SHOP: {
          text: t('LOCATION FOR PARTS IN SHOP'),
        },
        QUAR_LOCATION: { text: t('QUAR LOCATION') },
        DROP_LOCATION: { text: t('DROP LOCATION') },
      },

      editable: (text, record, index) => {
        return false;
      },
      width: '32%',

      // responsive: ['sm'],
    },
    // {
    //   title: `${t('STORAGE TYPE')}`,
    //   dataIndex: 'storageType',
    //   key: 'storageType',
    //   ellipsis: true,
    //   valueType: 'select',
    //   valueEnum: {
    //     manual: { text: t('MANUAL') },
    //     auto: { text: t('AUTO') },
    //   },
    //   editable: (text, record, index) => {
    //     return false;
    //   },

    //   // responsive: ['sm'],
    // },

    {
      title: `${t('RESTRICTION')}`,
      dataIndex: 'rectriction',
      key: 'rectriction',
      ellipsis: true,
      valueType: 'select',
      valueEnum: {
        standart: { text: t('STANDART') },
        inaccessible: { text: t('INACCESSIBLE') },
        restricted: { text: t('RESTRICTED') },
      },

      editable: (text, record, index) => {
        return false;
      },

      // responsive: ['sm'],
    },
    {
      title: `${t('LOCATION TYPE')}`,
      dataIndex: 'locationType',
      key: 'locationType',
      valueType: 'select',
      ellipsis: true,
      valueEnum: {
        standart: { text: t('STANDART') },
        hangar: { text: t('HANGAR') },
        inventory: { text: t('INVENTORY') },
        quarantine: { text: t('QUARANTINE') },
        rollOut: { text: t('ROLLOUT') },
        scrap: { text: t('SCRAP') },
        shipment: { text: t('SHIPMENT') },
        transfer: { text: t('TRANSFER') },
        shop: { text: t('SHOP') },
        unserviceable: { text: t('UNSERVICEABLE') },
        reservation: { text: t('RESERVATION') },
        customer: { text: t('CUSTOMER') },
        consingment: { text: t('CONSIGNMENT') },
        // pool: { text: t('POOL') },
        tool: { text: t('TOOL') },
        arhive: { text: t('ARCHIVE') },
        moving: { text: t('MOVING') },
      },
      editable: (text, record, index) => {
        return false;
      },

      // responsive: ['sm'],
    },
    {
      title: `${t('OWNER')}`,
      dataIndex: 'ownerShotName',
      key: 'ownerShotName',
      ellipsis: true,

      editable: (text, record, index) => {
        return false;
      },

      // responsive: ['sm'],
    },
    {
      title: `${t('REMARKS')}`,
      dataIndex: 'remarks',
      key: 'remarks',
      ellipsis: true,

      editable: (text, record, index) => {
        return false;
      },

      // responsive: ['sm'],
    },
  ];
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const [selectedLocation, setSelectedLocation] =
    useState<IStoreLocation | null>(null);
  const [selectedLocationsItems, setSelectedLocationsItems] = useState<any>([]);
  const handleSelectedRowKeysChange = (newSelectedRowKeys: React.Key[]) => {
    setSelectedRowKeys(newSelectedRowKeys);
  };
  const dispatch = useAppDispatch();

  return (
    <Layout>
      <Sider
        className="h-[85vh] overflow-hidden"
        theme="light"
        style={{
          paddingBottom: 0,
          marginBottom: 0,
          // marginLeft: 'auto',
          // background: 'rgba(255, 255, 255, 0.2)',
        }}
        width={340}
        // trigger
        collapsible
        collapsed={collapsed}
        onCollapse={(value: boolean | ((prevState: boolean) => boolean)) =>
          setCollapsed(value)
        }
      >
        <Menu
          theme="light"
          className="h-max"
          // defaultSelectedKeys={['/']}
          mode="inline"
          items={items}
        />
        <div className="mx-auto px-5">
          <div
            style={{
              display: !collapsed ? 'block' : 'none',
            }}
          >
            <StoreFilterForm
              onFilterSrore={function (record: any): void {
                setCurrenStore(record);
              }}
            ></StoreFilterForm>
          </div>
        </div>
      </Sider>
      <Content className="pl-4">
        <div className="h-[82vh] overflow-hidden flex flex-col justify-between">
          <div className="flex flex-col">
            <ProDescriptions className="bg-gray-200 align-middle ">
              <ProDescriptions.Item
                span={0.4}
                label={`${t('STATION')}`}
                valueType="text"
              >
                <Space>
                  <Tag>{currentStore?.station}</Tag>
                  <EditOutlined
                    onClick={() => {
                      currentStore && setOpenEditStore(true);
                    }}
                    className="cursor-pointer text-lg hover:scale-110 transition-transform"
                  />
                </Space>
              </ProDescriptions.Item>
              <ProDescriptions.Item
                span={0.2}
                label={`${t('STORE')}`}
                valueType="text"
              >
                <Tag>{currentStore?.shopShortName}</Tag>
              </ProDescriptions.Item>
              <ProDescriptions.Item
                span={1.2}
                label={`${t('DESCRIPTIONS')}`}
                valueType="text"
              >
                <Tag>{currentStore?.description}</Tag>
              </ProDescriptions.Item>
              <ProDescriptions.Item
                span={1}
                label={`${t('ADRESS')}`}
                valueType="text"
              >
                <Tag>{currentStore?.adress}</Tag>
              </ProDescriptions.Item>
            </ProDescriptions>

            <EditableTable
              data={sortedLocations}
              showSearchInput
              initialColumns={initialReleseColumns}
              isLoading={false}
              menuItems={undefined}
              recordCreatorProps={false}
              onSelectedRowKeysChange={handleSelectedRowKeysChange}
              onRowClick={function (record: any, rowIndex?: any): void {
                setSelectedLocationsItems(
                  (prevSelectedItems: (string | undefined)[]) =>
                    prevSelectedItems.includes(record.locationName)
                      ? []
                      : [record.locationName]
                );
              }}
              onMultiSelect={(record: any, rowIndex?: any) => {
                const locationNames = record.map(
                  (item: any) => item.locationName
                );
                // console.log(locationNames);
                setSelectedLocationsItems(locationNames);
              }}
              onDoubleRowClick={function (record: any, rowIndex?: any): void {
                setSelectedLocation(record);
                setOpenEditLocation(true);
                // console.log(record);
              }}
              onSave={function (rowKey: any, data: any, row: any): void {
                throw new Error('Function not implemented.');
              }}
              yScroll={52}
              externalReload={function () {
                throw new Error('Function not implemented.');
              }}
            ></EditableTable>
          </div>

          <Space className="mt-5" align="center">
            <Button
              size="small"
              disabled={!currentStore}
              onClick={() => setOpenCreateLocation(true)}
            >
              +{t('CREATE')}
            </Button>

            <Button
              size="small"
              onClick={() => {
                if (!currentStore) return;

                // Предупреждение перед удалением
                Modal.confirm({
                  title: t('CONFIRM_DELETE'),
                  onOk: async () => {
                    // Удаление выбранных элементов
                    const newLocations = (currentStore.locations?.filter(
                      (location: IStoreLocation) =>
                        location.id && !selectedRowKeys.includes(location.id)
                    ) || []) as IStoreLocation[];

                    // Обновление состояния
                    const result = await dispatch(
                      updateStoreByID({
                        ...currentStore,
                        locations: newLocations,
                      })
                    );

                    // Если обновление прошло успешно
                    if (result.meta.requestStatus === 'fulfilled') {
                      setLocations(result.payload.locations);
                      setCurrenStore({
                        ...currentStore,
                        locations: result.payload.locations,
                      });
                    }
                  },
                });
              }}
              disabled={!currentStore || !selectedRowKeys.length}
            >
              {t('DELETE')}
            </Button>
            <Button
              size="small"
              onClick={() => {
                setOpenShowParts(true);
              }}
              disabled={
                !currentStore || !selectedLocationsItems.length
                // ||
                // !selectedRowKeys.length
              }
            >
              {t('SHOW PARTS')}
            </Button>
          </Space>
        </div>
        <ModalForm
          submitter={false}
          onFinish={async () => {}}
          title={`${t('CREATE NEW LOCATION')}`}
          open={openCreateLocation}
          width={'40vw'}
          onOpenChange={setOpenCreateLocation}
        >
          {currentStore && (
            <CreateNewLocation
              oncreateNewLocation={(record) => {
                setLocations(record);
                setCurrenStore({ ...currentStore, locations: record });
                // console.log(record);
                // console.log(locations);
              }}
              store={currentStore}
            ></CreateNewLocation>
          )}
        </ModalForm>
        <ModalForm
          submitter={false}
          onFinish={async () => {}}
          title={`${t('EDIT LOCATION')}`}
          open={editCreateLocation}
          width={'40vw'}
          onOpenChange={setOpenEditLocation}
        >
          {currentStore && selectedLocation && (
            <EditLocation
              selectedLocation={selectedLocation}
              oncreateNewLocation={(record) => {
                setLocations(record);
                setCurrenStore({ ...currentStore, locations: record });
              }}
              store={currentStore}
            ></EditLocation>
          )}
        </ModalForm>
        <ModalForm
          submitter={false}
          onFinish={async () => {}}
          title={`${t('SHOW PARTS')}`}
          open={openShowParts}
          width={'90vw'}
          onOpenChange={setOpenShowParts}
        >
          {currentStore && selectedLocationsItems && (
            <ShowParts
              scroll={52}
              store={currentStore}
              selectedLocations={selectedLocationsItems}
            ></ShowParts>
          )}
        </ModalForm>
        <ModalForm
          submitter={false}
          onFinish={async () => {}}
          title={`${t('EDIT STORE')}`}
          open={openEditStore}
          width={'50vw'}
          onOpenChange={setOpenEditStore}
        >
          {currentStore && (
            <StoreEditForm
              onEditSrore={setCurrenStore}
              currentStore={currentStore}
            ></StoreEditForm>
          )}
        </ModalForm>
      </Content>
    </Layout>
  );
};

export default StoreManagment;
