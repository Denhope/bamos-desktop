import TabContent from '@/components/shared/Table/TabContent';
import React, { FC, useMemo } from 'react';
import { useTranslation } from 'react-i18next';

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
    },

    {
      skip: !partNumber?._id,
    }
  );
  const transformedPartNumbers = useMemo(() => {
    return transformToIStockPartNumber(parts || []);
  }, [parts]);
  return (
    <div className="">
      <TabContent
        tabs={[
          {
            content: (
              <div className="flex relative overflow-hidden">
                <StockGridNew
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
                transformedStokPartNumbers={transformedPartNumbers || []}
                isDescription={true}
                height="54vh"
                isAlternatives={searchValues.isAlternates}
                partNumberID={partNumber?._id}
              ></StockDetailsNew>
            ),
            title: `${t('STOCK DETAIL')}`,
          },

          {
            content: (
              <StockDetailsNew
                transformedStokPartNumbers={
                  transformedPartNumbers.filter(
                    (item) => item.locationType === 'transfer'
                  ) || []
                }
                isDescription={false}
                height="64vh"
                isAlternatives={searchValues.isAlternates}
                partNumberID={partNumber?._id}
              ></StockDetailsNew>
            ),
            title: `${t('TRANSFER')}`,
          },
          {
            content: (
              <StockDetailsNew
                transformedStokPartNumbers={
                  transformedPartNumbers.filter(
                    (item) => item?.restrictionID === 'inaccessible'
                  ) || []
                }
                isDescription={false}
                height="57vh"
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
