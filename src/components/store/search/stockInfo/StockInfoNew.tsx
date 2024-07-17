import { ProDescriptions } from '@ant-design/pro-components';
import { useTypedSelector } from '@/hooks/useTypedSelector';
import React, { FC, useEffect, useState } from 'react';

import { Col, Space, Spin, Tag } from 'antd';
import { useTranslation } from 'react-i18next';
import StockTabNew from './StockTabNew';
import { IPartNumber } from '@/models/IUser';

type StockInfoProps = {
  selectedItem: IPartNumber;
  searchValues: { isAllDate?: boolean; isAlternates?: boolean };
};

const StockInfoNew: FC<StockInfoProps> = ({ selectedItem, searchValues }) => {
  const { t } = useTranslation();
  return (
    <div className="flex my-0 mx-auto flex-col gap-5  rounded-md brequierement-gray-400">
      <Space>
        <Col
          className=" bg-white px-4 py-3  rounded-md brequierement-gray-400 "
          sm={24}
        >
          <ProDescriptions
            className="bg-white px-4 py-3 rounded-md  align-middle "
            loading={false}
            column={4}
            size="small"
          >
            <ProDescriptions.Item
              label={`${t(`DESCRIPTIONS`)}`}
              valueType="text"
            >
              <div className="font-bold">
                {(selectedItem && selectedItem?.DESCRIPTION?.toUpperCase()) ||
                  (selectedItem &&
                    selectedItem?.NAME_OF_MATERIAL?.toUpperCase())}
              </div>
            </ProDescriptions.Item>

            <ProDescriptions.Item label={`${t(`GROUP`)}`} valueType="text">
              {selectedItem && selectedItem?.GROUP && (
                <Tag>{selectedItem?.GROUP}</Tag>
              )}
            </ProDescriptions.Item>

            <ProDescriptions.Item label={`${t(`TYPE`)}`} valueType="text">
              {selectedItem && selectedItem?.TYPE && (
                <Tag>{selectedItem?.TYPE}</Tag>
              )}
            </ProDescriptions.Item>
            <ProDescriptions.Item
              label={`${t(`MEASURE UNIT`)}`}
              valueType="text"
            >
              {selectedItem && (
                <Tag>{selectedItem && selectedItem?.UNIT_OF_MEASURE}</Tag>
              )}
            </ProDescriptions.Item>
          </ProDescriptions>
        </Col>
      </Space>

      <div className=" bg-white  h-[77vh] px-4 rounded-md brequierement-gray-400 p-3 overflow-y-auto">
        <StockTabNew
          partNumber={selectedItem}
          searchValues={searchValues}
        ></StockTabNew>
      </div>
    </div>
  );
};

export default StockInfoNew;
