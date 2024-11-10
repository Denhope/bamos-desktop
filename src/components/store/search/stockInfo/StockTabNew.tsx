import TabContent from '@/components/shared/Table/TabContent';
import React, { FC, useId, useMemo, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { v4 as uuidv4 } from 'uuid';

import StockGridNew from './StockGridNew';
import StockDetailsNew from './StockDetailsNew';
import { IPartNumber } from '@/models/IUser';
import { useGetStorePartsQuery } from '@/features/storeAdministration/PartsApi';
import { transformToIStockPartNumber } from '@/services/utilites';
export interface IGroupTaskListPrors {
  partNumber: IPartNumber;
  searchValues: {
    isAllDate?: boolean;
    isAlternates?: boolean;
    stockID?: string;
  };
}
const StockTabNew: FC<IGroupTaskListPrors> = ({ partNumber, searchValues }) => {
  const { t } = useTranslation();

  // Создаем уникальные идентификаторы
  const componentId = useId();
  const sessionId = useMemo(() => uuidv4(), []);

  const {
    data: parts,
    isLoading: partsQueryLoading,
    isFetching: partsLoadingF,
    refetch,
  } = useGetStorePartsQuery(
    {
      partNumberID: partNumber?._id,
      storeID: searchValues?.stockID,
      includeAlternates: searchValues?.isAlternates,
      componentId,
      sessionId,
    },
    {
      skip: !partNumber?._id,
      refetchOnMountOrArgChange: true,
    }
  );

  // Добавляем эффект для отслеживания изменений данных
  useEffect(() => {
    console.log('StockTabNew Query:', {
      componentId,
      sessionId,
      partNumberID: partNumber?._id,
      storeID: searchValues?.stockID,
      partsCount: parts?.length,
    });
  }, [parts, partNumber, searchValues, componentId, sessionId]);

  const transformedPartNumbers = useMemo(() => {
    if (!parts) return [];
    console.log('Raw parts data:', parts);
    const transformed = transformToIStockPartNumber(parts);
    console.log('Transformed parts:', transformed);
    return transformed || [];
  }, [parts]);

  // Фильтрация данных для каждой вкладки
  const standardItems = useMemo(() => {
    const items = transformedPartNumbers.filter((item) => {
      if (!item) return false;
      const isStandard =
        !item.restrictionID || item.restrictionID === 'standart';
      const notReserved = !item.isReserved;
      return isStandard && notReserved;
    });
    console.log('Standard items:', items);
    return items;
  }, [transformedPartNumbers]);

  const transferItems = useMemo(() => {
    const items = transformedPartNumbers.filter((item) => {
      if (!item) return false;
      return item.locationType === 'transfer';
    });
    console.log('Transfer items:', items);
    return items;
  }, [transformedPartNumbers]);

  // Изменяем фильтрацию для unserviceItems
  const unserviceItems = useMemo(() => {
    const items = transformedPartNumbers.filter((item) => {
      if (!item) return false;
      return (
        item.restrictionID === 'inaccessible' ||
        item.locationType === 'unserviceable' ||
        item.LOCATION === 'SCRAP'
      );
    });
    console.log('Unservice items:', items);
    return items;
  }, [transformedPartNumbers]);

  // Для STOCK DETAIL используем все элементы, включая unserviceItems
  const allStockItems = useMemo(() => {
    return [...transformedPartNumbers];
  }, [transformedPartNumbers]);

  // Подсчет количества для каждой вкладки
  const getTotalQuantity = (items: any[]) => {
    if (!Array.isArray(items)) return 0;
    const total = items.reduce((sum, item) => {
      if (!item) return sum;
      const qty = Number(item.QUANTITY) || 0;
      console.log('Calculating quantity for item:', { item, qty });
      return sum + qty;
    }, 0);
    return total;
  };

  const stockInfoTotal = getTotalQuantity(standardItems);
  const transferTotal = getTotalQuantity(transferItems);
  const unserviceTotal = getTotalQuantity(unserviceItems);

  console.log('Totals:', {
    stockInfoTotal,
    transferTotal,
    unserviceTotal,
    standardItemsLength: standardItems.length,
    transferItemsLength: transferItems.length,
    unserviceItemsLength: unserviceItems.length,
  });

  return (
    <div className="flex flex-col h-full">
      <TabContent
        tabs={[
          {
            content: (
              <div className="flex relative overflow-hidden">
                <StockGridNew
                  isLoading={partsQueryLoading || partsLoadingF}
                  transformedStokPartNumbers={standardItems}
                  partNumber={partNumber}
                  total={stockInfoTotal}
                />
              </div>
            ),
            title: `${t('STOCK INFO')} (${stockInfoTotal || 0})`,
          },
          {
            content: (
              <StockDetailsNew
                isLoading={partsQueryLoading || partsLoadingF}
                transformedStokPartNumbers={allStockItems}
                isDescription={true}
                height="50vh"
                isAlternatives={searchValues.isAlternates}
                partNumberID={partNumber?._id}
                total={stockInfoTotal}
              />
            ),
            title: `${t('STOCK DETAIL')} (${stockInfoTotal || 0})`,
          },
          {
            content: (
              <StockDetailsNew
                isLoading={partsQueryLoading || partsLoadingF}
                transformedStokPartNumbers={transferItems}
                isDescription={false}
                height="61vh"
                isAlternatives={searchValues.isAlternates}
                partNumberID={partNumber?._id}
                total={transferTotal}
              />
            ),
            title: `${t('TRANSFER')} (${transferTotal || 0})`,
          },
          {
            content: (
              <div className="flex flex-col w-full">
                <StockDetailsNew
                  isLoading={partsQueryLoading || partsLoadingF}
                  transformedStokPartNumbers={unserviceItems}
                  isDescription={false}
                  height="64vh"
                  total={unserviceTotal}
                  showInaccessibleOnly={true}
                  partNumberID={partNumber?._id}
                />
              </div>
            ),
            title: `${t('UNSERVICE PARTS')} (${unserviceTotal || 0})`,
          },
        ]}
      />
    </div>
  );
};

export default StockTabNew;
