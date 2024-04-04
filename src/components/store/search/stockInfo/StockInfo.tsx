import { ProDescriptions } from '@ant-design/pro-components';
import { useTypedSelector } from '@/hooks/useTypedSelector';
import React, { FC, useEffect, useState } from 'react';
import StockTab from './StockTab';
import { Spin } from 'antd';
import { useTranslation } from 'react-i18next';

type StockInfoProps = { selectedItem: any; data?: any };

const StockInfo: FC<StockInfoProps> = ({ selectedItem, data }) => {
  const { selectedMaterial, isLoading, filteredItemsStockQuantity } =
    useTypedSelector((state) => state.storesLogistic);
  // useEffect(() => {
  //   setDescription(selectedItem?.DESCRIPTION);
  // }, [selectedItem]);
  const { t } = useTranslation();
  return (
    <div className="flex my-0 mx-auto flex-col  h-[78vh] relative overflow-hidden">
      <Spin spinning={isLoading}>
        <ProDescriptions loading={false} column={4} size="small">
          <ProDescriptions.Item label={`${t(`DESCRIPTIONS`)}`} valueType="text">
            <div className="font-bold">
              {selectedMaterial && selectedMaterial?.DESCRIPTION.toUpperCase()}
            </div>
          </ProDescriptions.Item>

          <ProDescriptions.Item label={`${t(`GROUP`)}`} valueType="text">
            {' '}
            <div className="font-bold">
              {' '}
              {selectedMaterial && selectedMaterial?.GROUP}
            </div>
          </ProDescriptions.Item>

          <ProDescriptions.Item label={`${t(`TYPE`)}`} valueType="text">
            <div className="font-bold">
              {' '}
              {selectedMaterial && selectedMaterial?.TYPE}
            </div>
          </ProDescriptions.Item>
          <ProDescriptions.Item label={`${t(`MEASURE UNIT`)}`} valueType="text">
            {' '}
            <div className="font-bold">
              {' '}
              {(selectedMaterial && selectedMaterial?.UNIT) ||
                filteredItemsStockQuantity?.UNIT_OF_MEASURE}
            </div>
          </ProDescriptions.Item>
        </ProDescriptions>
        <ProDescriptions loading={false} column={1}>
          <ProDescriptions.Item label={`${t(`REMARKS`)}`} valueType="textarea">
            {selectedMaterial && selectedMaterial?.REMARKS}
          </ProDescriptions.Item>
        </ProDescriptions>

        <StockTab
          partNumber={selectedMaterial?.PART_NUMBER}
          totalQuantity={filteredItemsStockQuantity?.totalQuantity}
          stocks={filteredItemsStockQuantity?.items || []}
        ></StockTab>
      </Spin>
    </div>
  );
};

export default StockInfo;
