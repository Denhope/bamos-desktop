import { ProCard } from '@ant-design/pro-components';
import { Empty, Layout, Space, Tabs } from 'antd';
import Title from 'antd/es/typography/Title';
import React, { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { transformToIStockPartNumber } from '@/services/utilites';
import { useGetStorePartsQuery } from '@/features/storeAdministration/PartsApi';
import { IPartNumber } from '@/models/IUser';
import StockDetails from './StockDetails';
import StockDetailsNew from './StockDetailsNew';

interface Stock {
  restrictionID: string;
  item: string;
  STORE_ID: string;
  OWNER: string;
  STOCK: string;
  QUANTITY: number;
  OWNER_LONG_NAME?: string;
}

interface StockGridProps {
  partNumber: IPartNumber;
  storeID?: string;
  transformedStokPartNumbers: any[];
}

const StockGridNew: React.FC<StockGridProps> = ({
  partNumber,
  storeID,
  transformedStokPartNumbers,
}) => {
  const { t } = useTranslation();

  // Получение данных из API
  // const {
  //   data: parts,
  //   isLoading: partsQueryLoading,
  //   isFetching: partsLoadingF,
  //   refetch,
  // } = useGetStorePartsQuery(
  //   {
  //     partNumberID: partNumber?._id,
  //   },
  //   {
  //     skip: !partNumber?._id,
  //   }
  // );

  // Преобразование и группировка данных
  const groupedData = useMemo(() => {
    const transformed = transformedStokPartNumbers;
    return transformed
      .filter((item) => item?.restrictionID === 'standart')
      .reduce((acc: Record<string, Stock[]>, item) => {
        const stock = item.STOCK || 'UNKNOWN';
        if (!acc[stock]) {
          acc[stock] = [];
        }
        acc[stock].push(item);
        return acc;
      }, {});
  }, [transformedStokPartNumbers]);

  const [selectedKey, setSelectedKey] = useState<string | undefined>(undefined);
  const [selectedKeyName, setSelectedKeyName] = useState<string | undefined>(
    ''
  );
  // Список складов
  const stocks = Object.keys(groupedData);

  // Вычисление общего количества товаров на всех складах
  const totalQuantity = useMemo(() => {
    return stocks.reduce((sum, stock) => {
      return (
        sum +
        groupedData[stock].reduce((stockSum, item) => {
          return stockSum + (item.QUANTITY || 0);
        }, 0)
      );
    }, 0);
  }, [stocks, groupedData]);

  return (
    <div
      className="flex flex-col my-0 mx-auto relative overflow-hidden"
      style={{ width: '100%' }}
    >
      {partNumber ? (
        <div>
          <div
            className="p-5 grid gap-4"
            style={{
              gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
            }}
          >
            {stocks.length ? (
              stocks.map((stock, index) => {
                const stockItems = groupedData[stock];
                const stockQuantity = stockItems
                  .filter((item) => item?.restrictionID === 'standart')
                  .reduce((sum, item) => sum + (item.QUANTITY || 0), 0);
                const stockOwner = stockItems[0]?.OWNER || '';
                const STORE_ID = stockItems[0]?.STORE_ID || '';
                const STORE_Name = stockItems[0]?.STOCK || '';

                return (
                  <ProCard
                    key={index}
                    style={{
                      cursor: 'pointer',
                      backgroundColor:
                        selectedKey === stock ? '#228B22' : '#32CD32',
                      border:
                        selectedKey === stock
                          ? '1px solid black'
                          : '1px solid gray',
                      display: 'flex',
                      justifyContent: 'center',
                      alignItems: 'center',
                      transition: 'transform .2s',
                    }}
                    onClick={() => {
                      setSelectedKeyName(STORE_Name);
                      setSelectedKey(STORE_ID);
                    }}
                    onMouseOver={(e) =>
                      (e.currentTarget.style.transform = 'scale(1.02)')
                    }
                    onMouseOut={(e) => (e.currentTarget.style.transform = '')}
                  >
                    <div
                      style={{
                        alignItems: 'center',
                        fontSize: '16px',
                        fontWeight: 'bold',
                        display: 'flex',
                        flexDirection: 'column',
                      }}
                    >
                      <div>{String(stock)?.toUpperCase()}</div>
                      <div>{stockQuantity}</div>
                      <div className="text-xs font-normal">
                        {stockOwner && String(stockOwner)?.toUpperCase()}
                      </div>
                    </div>
                  </ProCard>
                );
              })
            ) : (
              <ProCard
                key={1}
                style={{
                  cursor: 'pointer',
                  backgroundColor: '#FF4500',
                  border: 'solid gray',
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  transition: 'transform .2s',
                }}
                onMouseOver={(e) =>
                  (e.currentTarget.style.transform = 'scale(1.02)')
                }
                onMouseOut={(e) => (e.currentTarget.style.transform = '')}
              >
                <div
                  style={{
                    alignItems: 'center',
                    fontSize: '16px',
                    fontWeight: 'bold',
                    display: 'flex',
                    flexDirection: 'column',
                  }}
                >
                  <div>{''}</div>
                  <div className="py-4">0</div>
                  <div>{''}</div>
                </div>
              </ProCard>
            )}
          </div>
          <div className={`flex flex-col text-sm ml-auto font-bold`}>
            <div className="ml-auto pr-24">
              {t('TOTAL STOCK QTY:  ')}
              <span
                className={`highlight ${
                  totalQuantity ? 'bg-green-500' : 'bg-red-500'
                }`}
              >
                {totalQuantity || 0}
              </span>
            </div>
          </div>
          <div className="py-5 flex flex-col w-[99%]">
            <Title level={5}>
              {t('DETAILS FOR STORE')} -
              <a className="font-bold text-lg">
                {String(selectedKeyName).toUpperCase() || ''}
              </a>
            </Title>
          </div>
        </div>
      ) : (
        <Empty></Empty>
      )}

      <Tabs
        defaultActiveKey="1"
        style={{ width: '100%' }}
        items={[
          {
            label: `${t('STOCK DETAIL')}`,
            key: '1',
            children: selectedKey ? (
              <StockDetailsNew
                transformedStokPartNumbers={
                  transformedStokPartNumbers.filter(
                    (item) =>
                      item?.STOCK === selectedKeyName &&
                      item?.restrictionID === 'standart'
                  ) || []
                }
                height="30vh"
                partNumberID={partNumber?._id}
                storeID={selectedKey}
              />
            ) : (
              <Empty description={t('No store selected')} />
            ),
          },
        ]}
      />
    </div>
  );
};

export default StockGridNew;
