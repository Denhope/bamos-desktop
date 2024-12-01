import { ProCard, ProDescriptions } from '@ant-design/pro-components';
import { Layout, Menu, MenuProps, Tag, Tooltip } from 'antd';
import Sider from 'antd/es/layout/Sider';
import { Content } from 'antd/es/layout/layout';
import React, { FC, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { getItem } from '@/services/utilites';
import { SwapOutlined } from '@ant-design/icons';
import TabContent from '@/components/shared/Table/TabContent';
import PartTrackingFilterForm from '@/components/store/partTracking/PartTrackingFilterForm';
import ListOfBooking from '@/components/store/partTracking/ListOfBooking';
import StoreView from '@/components/store/partTracking/StoreView';
import TechnicalView from '@/components/store/partTracking/TechnicalView';

interface PartsTracking {
  onDoubleClick?: (record: any, rowIndex?: any) => void;
  onSingleRowClick?: (record: any, rowIndex?: any) => void;
}

function truncateText(text: string, maxLength: number = 30): string {
  if (!text) return '';
  return text.length > maxLength ? `${text.slice(0, maxLength)}...` : text;
}

const PartsTracking: FC<PartsTracking> = ({
  onDoubleClick,
  onSingleRowClick,
}) => {
  const { t } = useTranslation();
  const [bookings, setBookings] = useState<any[]>([]);
  const [data, setData] = useState<any[]>([]);

  useEffect(() => {
    // Очистка данных перед обновлением
    setData([]); // Очищаем данные
    const uniqueBookings = Array.from(
      new Map(bookings.map((item) => [item._id, item])).values()
    );
    setData(uniqueBookings);
  }, [bookings]);

  const items: MenuProps['items'] = [
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
          onSingleRowClick={(part) => setSelectedMaterial(part)}
          isLoading={false}
        />
      ),
      title: `${t('LIST OF BOOKING')}`,
    },
    {
      content: (
        <StoreView
          onSingleRowClick={(part) => setSelectedMaterial(part)}
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
          onSingleRowClick={(part) => setSelectedMaterial(part)}
          scroll={48}
          data={data}
          isLoading={false}
        />
      ),
      title: `${t('TECHNICAL VIEW')}`,
    },
  ];

  return (
    <Layout>
      <Sider
        collapsible
        collapsed={collapsed}
        onCollapse={setCollapsed}
        className="h-[85vh] overflow-hidden"
        theme="light"
        width={400}
      >
        <Menu theme="light" mode="inline" items={items} />
        <div className="mx-auto px-5">
          <div style={{ display: !collapsed ? 'block' : 'none' }}>
            <PartTrackingFilterForm
              onBookingSearch={(bookings) => setBookings(bookings)} // Устанавливаем bookings
              onPartSearch={(part) => setSelectedMaterial(part)}
            />
          </div>
        </div>
      </Sider>
      <Content className="pl-4">
        <div className="h-[82vh] overflow-hidden flex flex-col justify-between gap-1 bg-white">
          <div className="flex flex-col gap-5 bg-white px-4 py-3 rounded-md border-gray-400">
            <ProDescriptions
              loading={false}
              column={5}
              size="small"
              className="bg-white rounded-md shadow-sm"
            >
              <ProDescriptions.Item
                label={<span className="text-gray-600">{t('PART No')}</span>}
                valueType="text"
              >
                <Tag color="blue" className="max-w-[200px] truncate">
                  {selectedMaterial?.PART_NUMBER || '-'}
                </Tag>
              </ProDescriptions.Item>

              <ProDescriptions.Item
                label={
                  <span className="text-gray-600">{t('DESCRIPTIONS')}</span>
                }
                valueType="text"
              >
                <Tooltip title={selectedMaterial?.NAME_OF_MATERIAL}>
                  <Tag color="green" className="max-w-[200px] truncate">
                    {truncateText(selectedMaterial?.NAME_OF_MATERIAL)}
                  </Tag>
                </Tooltip>
              </ProDescriptions.Item>

              <ProDescriptions.Item valueType="text">
                <Tag color="orange" className="max-w-[150px] truncate">
                  {selectedMaterial?.GROUP || '-'}
                </Tag>
              </ProDescriptions.Item>

              <ProDescriptions.Item
                label={<span className="text-gray-600">{t('TYPE')}</span>}
                valueType="text"
              >
                <Tag color="purple" className="max-w-[150px] truncate">
                  {selectedMaterial?.TYPE || '-'}
                </Tag>
              </ProDescriptions.Item>

              <ProDescriptions.Item
                label={<span className="text-gray-600">{t('UNIT')}</span>}
                valueType="text"
              >
                <Tag color="cyan" className="max-w-[100px] truncate">
                  {selectedMaterial?.UNIT_OF_MEASURE || '-'}
                </Tag>
              </ProDescriptions.Item>
            </ProDescriptions>
            <TabContent tabs={tabs} />
          </div>
        </div>
      </Content>
    </Layout>
  );
};

export default PartsTracking;
