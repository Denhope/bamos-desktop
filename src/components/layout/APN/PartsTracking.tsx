import { ProCard, ProDescriptions } from '@ant-design/pro-components';
import { Layout, Menu, MenuProps } from 'antd';
import Sider from 'antd/es/layout/Sider';
import { Content } from 'antd/es/layout/layout';
import React, { FC, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { getItem } from '@/services/utilites';
import { SwapOutlined } from '@ant-design/icons';
import tabs from 'antd/es/tabs';
import TabContent from '@/components/shared/Table/TabContent';
import PartTrackingFilterForm from '@/components/store/partTracking/PartTrackingFilterForm';
import ListOfBooking from '@/components/store/partTracking/ListOfBooking';
import StoreView from '@/components/store/partTracking/StoreView';
import TechnicalView from '@/components/store/partTracking/TechnicalView';

interface PartsTracking {
  onDoubleClick?: (record: any, rowIndex?: any) => void;
  onSingleRowClick?: (record: any, rowIndex?: any) => void;
}

const PartsTracking: FC<PartsTracking> = ({
  onDoubleClick,
  onSingleRowClick,
}) => {
  const { t } = useTranslation();
  const [bookings, setBookings] = useState<any[] | []>([]);
  const [data, setdata] = useState<any[] | []>(bookings);
  useEffect(() => {
    if (bookings) {
      setdata(bookings);
    }
  }, [bookings]);
  type MenuItem = Required<MenuProps>['items'][number];
  const items: MenuItem[] = [
    getItem(<>{t('PARTS TRACKING')}</>, 'sub1', <SwapOutlined />),
  ];
  const [collapsed, setCollapsed] = useState<boolean>(false);
  const [selectedMaterial, setSelectedMaterial] = useState<any | null>(null);
  const tabs = [
    {
      content: (
        <ListOfBooking
          scroll={48}
          data={data}
          onSingleRowClick={function (part?: any): void {
            setSelectedMaterial(part);
          }}
          isLoading={false}
        />
      ),
      title: `${t('LIST OF BOOKING')}`,
    },
    {
      content: (
        <StoreView
          onSingleRowClick={function (part?: any): void {
            setSelectedMaterial(part);
          }}
          scroll={48}
          data={data}
          isLoading={false}
        />
      ),
      title: `${t('STORE VIEW')}`,
    },
    {
      content: (
        <TechnicalView
          onSingleRowClick={function (part?: any): void {
            setSelectedMaterial(part);
          }}
          scroll={48}
          data={data}
          isLoading={false}
        />
      ),
      title: `${t('TECHNICAL VIEW')}`,
    },
    // {
    //   content: <></>,
    //   title: `${t('FINANCIAL VIEW')}`,
    // },
  ];
  return (
    <Layout>
      <Sider
        collapsible
        // color="rgba(255, 255, 255, 0.2)"
        collapsed={collapsed}
        onCollapse={(value: boolean | ((prevState: boolean) => boolean)) =>
          setCollapsed(value)
        }
        className="h-[85vh] overflow-hidden"
        theme="light"
        width={350}
      >
        <Menu theme="light" mode="inline" items={items} />
        <div className="mx-auto px-5">
          <div
            style={{
              display: !collapsed ? 'block' : 'none',
            }}
          >
            <PartTrackingFilterForm
              onBookingSearch={function (bookings: any[] | []): void {
                setBookings(bookings);
              }}
              onPartSearch={function (part?: any): void {
                setSelectedMaterial(part);
              }}
            />
          </div>
        </div>
      </Sider>
      <Content className="pl-4">
        <div className="h-[82vh] overflow-hidden flex flex-col justify-between gap-1 bg-white">
          <div className="flex flex-col gap-5 bg-white px-4 py-3 rounded-md border-gray-400">
            <ProDescriptions loading={false} column={5} size="small">
              <ProDescriptions.Item label={t('PART No')} valueType="text">
                <div className="font-bold">
                  {selectedMaterial && selectedMaterial?.PART_NUMBER}
                </div>
              </ProDescriptions.Item>
              <ProDescriptions.Item label={t('DESCRIPTIONS')} valueType="text">
                <div className="font-bold">
                  {selectedMaterial && selectedMaterial?.NAME_OF_MATERIAL}
                </div>
              </ProDescriptions.Item>

              <ProDescriptions.Item valueType="text">
                {' '}
                <div className="font-bold">
                  {' '}
                  {selectedMaterial && selectedMaterial?.GROUP}
                </div>
              </ProDescriptions.Item>

              <ProDescriptions.Item label={t('TYPE')} valueType="text">
                <div className="font-bold">
                  {' '}
                  {selectedMaterial && selectedMaterial?.TYPE}
                </div>
              </ProDescriptions.Item>
              <ProDescriptions.Item label={t('UNIT')} valueType="text">
                {' '}
                <div className="font-bold">
                  {' '}
                  {selectedMaterial && selectedMaterial?.UNIT_OF_MEASURE}
                </div>
              </ProDescriptions.Item>
            </ProDescriptions>
            <TabContent tabs={tabs}></TabContent>
          </div>
        </div>
      </Content>
    </Layout>
  );
};

export default PartsTracking;
