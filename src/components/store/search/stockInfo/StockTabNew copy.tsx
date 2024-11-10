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
    return transformToIStockPartNumber(parts || []);
  }, [parts]);
  console.log('transformedPartNumbers', transformedPartNumbers);

  return (
    <div className="">
      <TabContent
        tabs={[
          {
            content: (
              <div className="flex relative overflow-hidden">
                <StockGridNew
                  isLoading={partsQueryLoading || partsLoadingF}
                  transformedStokPartNumbers={transformedPartNumbers || []}
                  partNumber={partNumber}
                ></StockGridNew>
              </div>
            ),
            title: `${t('STOCK INFO')}`,
          },
          {
            content: (
              <StockDetailsNew
                isLoading={partsQueryLoading || partsLoadingF}
                transformedStokPartNumbers={transformedPartNumbers || []}
                isDescription={true}
                height="50vh"
                isAlternatives={searchValues.isAlternates}
                partNumberID={partNumber?._id}
              ></StockDetailsNew>
            ),
            title: `${t('STOCK DETAIL')}`,
          },

          {
            content: (
              <StockDetailsNew
                isLoading={partsQueryLoading || partsLoadingF}
                transformedStokPartNumbers={
                  transformedPartNumbers.filter(
                    (item: any) => item.locationType === 'transfer'
                  ) || []
                }
                isDescription={false}
                height="61vh"
                isAlternatives={searchValues.isAlternates}
                partNumberID={partNumber?._id}
              ></StockDetailsNew>
            ),
            title: `${t('TRANSFER')}`,
          },
          {
            content: (
              <StockDetailsNew
                isLoading={partsQueryLoading || partsLoadingF}
                transformedStokPartNumbers={
                  transformedPartNumbers.filter(
                    (item: any) => item?.restrictionID === 'inaccessible'
                  ) || []
                }
                isDescription={false}
                height="55vh"
              ></StockDetailsNew>
            ),
            title: `${t('UNSERVICE PARTS')}`,
          },
        ]}
      />
    </div>
  );
};

export default StockTabNew;
