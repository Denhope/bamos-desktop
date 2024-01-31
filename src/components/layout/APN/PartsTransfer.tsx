import {
  Button,
  Col,
  Layout,
  MenuProps,
  Modal,
  Row,
  Space,
  message,
} from 'antd';
import Sider from 'antd/es/layout/Sider';
import React, { FC, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { getItem } from '@/services/utilites';
import {
  TransactionOutlined,
  EditOutlined,
  PrinterOutlined,
  SaveOutlined,
} from '@ant-design/icons';
import TransferFilteredForm from '../store/transfer/TransferFilteredForm';
import BookingDetailsForm from '../store/transfer/BookingDetailsForm';
import ShowParts from '../store/storeManagment/ShowParts';
import { IStore } from '@/models/IStore';
import GeneretedCompleteLabels from '@/components/pdf/GeneretedCompleteLabels';
import GeneretedTransferPdf from '@/components/pdf/GeneretedTransferLabels';
import { createBookingItem, updateManyMaterialItems } from '@/utils/api/thunks';
import { useAppDispatch } from '@/hooks/useTypedSelector';
import OriginalStoreEntry from '../store/transfer/modifyParts/OriginalStoreEntry';
import { IMaterialStoreRequestItem } from '@/models/IMaterialStoreItem';
import { USER_ID } from '@/utils/api/http';

const PartsTransfer: FC = () => {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const [rowKeys, setselectedRowKeys] = useState<any[]>([]);
  const [openRelese, setOpenRelese] = useState(false);
  const [selectedParts, setSecectedParts] = useState<any>(null);
  const [partsToPrint, setPartsToPrint] = useState<any>([]);
  const [onFilterBookingDEtails, setOnFilterBookingDEtails] =
    useState<any>(null);
  const [onFilterTransferDEtails, setOnFilterTransferDEtails] =
    useState<any>(null);
  const [selectedStore, setSecectedStore] = useState<any>(null);
  const [selectedComStore, setSelectedComStore] = useState<any>(null);
  const [selectedLocation, setSecectedLocation] = useState<any>(null);
  type MenuItem = Required<MenuProps>['items'][number];
  const items: MenuItem[] = [
    getItem(
      <>{t('PARTS TRANSFER (BAN:222)')}</>,
      'sub1',
      <TransactionOutlined />
    ),
    // ]
    // ),
  ];
  const [labelsOpenPrint, setOpenLabelsPrint] = useState<any>();
  const [partsOpenModify, setOpenPartsModify] = useState<boolean>(false);

  return (
    <div className="h-[82vh]  bg-white px-4 py-3  overflow-hidden flex flex-col justify-between gap-1">
      <div className="flex flex-col">
        <div className="py-4">
          <Row gutter={{ xs: 8, sm: 11, md: 24, lg: 32 }}>
            <Col xs={2} sm={6}>
              <TransferFilteredForm
                onReset={() => {
                  // Сброс состояний
                  setSecectedParts(null);
                  setOnFilterBookingDEtails(null);
                  setOnFilterTransferDEtails(null);
                  setSecectedStore(null);
                  setSelectedComStore(null);
                  setSecectedLocation(null);
                }}
                onSelectedValues={setOnFilterTransferDEtails}
                onSelectLocation={function (record: any): void {
                  // setselectedRowKeys([]);
                  setSecectedLocation(record);
                }}
                onSelectSelectedStore={setSelectedComStore}
                onFilterTransferParts={function (record: any): void {
                  setSecectedStore(record);

                  // setselectedRowKeys([]);
                }}
              ></TransferFilteredForm>
            </Col>{' '}
            <Col xs={32} sm={18}>
              <BookingDetailsForm
                initialStoreName={onFilterTransferDEtails?.store}
                onFilterBookingDEtails={setOnFilterBookingDEtails}
              />
            </Col>
          </Row>
        </div>{' '}
        {/* <Row className="" gutter={{ xs: 8, sm: 11, md: 24, lg: 32 }}>
          <Col xs={17}>
            <ShowParts
              store={selectedStore}
              selectedLocations={[selectedLocation?.locationName]}
              scroll={32}
            ></ShowParts>
          </Col>
          <Col xs={32} sm={18}></Col>
        </Row> */}
        <ShowParts
          storeName={onFilterTransferDEtails?.store?.toUpperCase().trim()}
          store={selectedStore || selectedComStore}
          selectedPN={onFilterTransferDEtails?.partNumber?.toUpperCase().trim()}
          selectedLabel={onFilterTransferDEtails?.label}
          selectedLocations={[
            onFilterTransferDEtails?.location?.toUpperCase().trim(),
          ]}
          onSelectedIds={function (record: any): void {
            setselectedRowKeys(record);
          }}
          onSelectedParts={function (record: any): void {
            setSecectedParts(record);
          }}
          scroll={32}
        ></ShowParts>
      </div>

      <div className="flex justify-between">
        <Space align="center">
          <Button
            icon={<SaveOutlined />}
            disabled={!rowKeys.length || !onFilterBookingDEtails}
            onClick={() => {
              const currentCompanyID = localStorage.getItem('companyID');
              Modal.confirm({
                title: `${t('YOU WANT TRANSFER PARTS TO LOCATION')}  ${
                  onFilterBookingDEtails?.targetLocation
                }`,
                onOk: async () => {
                  Modal.confirm({
                    title: t('CONFIRM CHANGE'),
                    okText: 'CONFIRM',
                    cancelText: 'CANCEL',
                    okButtonProps: {
                      style: { display: 'inline-block', margin: '1 auto' },
                    },
                    cancelButtonProps: {
                      style: { display: 'inline-block', margin: '1 auto' },
                    },
                    content: (
                      <div
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                        }}
                      >
                        <Button
                          icon={<PrinterOutlined />}
                          onClick={() => {
                            setOpenLabelsPrint(true);

                            // Создаем новый массив с измененными значениями
                            const updatedSelectedParts = selectedParts.map(
                              (part: any) => ({
                                ...part,
                                SHELF_NUMBER:
                                  onFilterBookingDEtails.targetLocation,
                                STOCK: onFilterBookingDEtails.targetStore,
                                OWNER_LONG_NAME: onFilterBookingDEtails.owner,
                                OWNER_SHORT_NAME: onFilterBookingDEtails.owner,
                              })
                            );

                            // Обновляем partsToPrint в зависимости от условия
                            setPartsToPrint(updatedSelectedParts);

                            // Рендеринг GeneretedTransferPdf прямо в этом окне
                            // return (
                            // <GeneretedTransferPdf parts={partsToPrint} />
                            // );
                          }}
                        >
                          PRINT NEW LABELS
                        </Button>
                      </div>
                    ),
                    onOk: async () => {
                      const resultUpdate = await dispatch(
                        updateManyMaterialItems({
                          companyID: currentCompanyID || '',
                          ids: rowKeys,
                          STOCK: onFilterBookingDEtails.targetStore,
                          LOCATION:
                            onFilterBookingDEtails?.targetLocation || '',
                          OWNER: onFilterBookingDEtails?.owner || '',
                        })
                      );

                      if (resultUpdate.meta.requestStatus === 'fulfilled') {
                        message.success(t('LOCATION CHANGE SUCCESSFULY'));
                        setselectedRowKeys([]);

                        // Apply the dispatch to each item in the result array
                        selectedParts.forEach(async (result: any) => {
                          await dispatch(
                            createBookingItem({
                              companyID: result.COMPANY_ID,
                              data: {
                                companyID: result.COMPANY_ID,
                                userSing:
                                  localStorage.getItem('singNumber') || '',
                                userID: USER_ID || '',
                                createDate: new Date(),
                                partNumber: result.PART_NUMBER,
                                station: result?.WAREHOUSE_RECEIVED_AT || 'N/A',
                                voucherModel: 'CHANGE_LOCATION',
                                location: result?.SHELF_NUMBER,
                                orderNumber: result?.ORDER_NUMBER,
                                price: result?.PRICE,
                                currency: result?.CURRENCY,
                                quantity: -result?.QUANTITY,
                                owner: result?.OWNER_SHORT_NAME,
                                batchNumber: result?.SUPPLIER_BATCH_NUMBER,
                                serialNumber: result?.SERIAL_NUMBER,
                                partGroup: result?.GROUP,
                                partType: result?.TYPE,
                                condition: result?.CONDITION,
                                description: result?.NAME_OF_MATERIAL,
                              },
                            })
                          );
                        });
                        resultUpdate.payload.forEach(async (result: any) => {
                          await dispatch(
                            createBookingItem({
                              companyID: result.COMPANY_ID,
                              data: {
                                companyID: result.COMPANY_ID,
                                userSing:
                                  localStorage.getItem('singNumber') || '',
                                userID: USER_ID || '',
                                createDate: new Date(),
                                partNumber: result.PART_NUMBER,
                                station: result?.WAREHOUSE_RECEIVED_AT || 'N/A',
                                voucherModel: 'CHANGE_LOCATION',
                                location: result?.SHELF_NUMBER,
                                orderNumber: result?.ORDER_NUMBER,
                                price: result?.PRICE,
                                currency: result?.CURRENCY,
                                quantity: result?.QUANTITY,
                                owner: result?.OWNER_SHORT_NAME,
                                batchNumber: result?.SUPPLIER_BATCH_NUMBER,
                                serialNumber: result?.SERIAL_NUMBER,
                                partGroup: result?.GROUP,
                                partType: result?.TYPE,
                                condition: result?.CONDITION,
                                description: result?.NAME_OF_MATERIAL,
                              },
                            })
                          );
                        });
                      }
                    },
                  });
                },
              });
            }}
            size="small"
          >
            {t('BOOK')}
          </Button>
        </Space>
        <Space>
          {' '}
          <Button
            icon={<EditOutlined />}
            disabled={!rowKeys.length || rowKeys.length > 1}
            onClick={() => {
              // setPartsToPrint(selectedParts);
              setOpenPartsModify(true);
            }}
            size="small"
          >
            {' '}
            {t('MODIFY')}
          </Button>
        </Space>
        <Space>
          <Button
            icon={<PrinterOutlined />}
            disabled={!rowKeys.length}
            onClick={() => {
              setPartsToPrint(selectedParts);
              setOpenLabelsPrint(true);
            }}
            size="small"
          >
            {' '}
            {t('PRINT LABEL')}
          </Button>
        </Space>
        <Modal
          title={t('PRINT LABEL')}
          open={labelsOpenPrint}
          width={'30%'}
          onCancel={() => setOpenLabelsPrint(false)}
          footer={null}
        >
          <GeneretedTransferPdf key={Date.now()} parts={partsToPrint} />
        </Modal>
        <Modal
          title={t('ORIGINALS STORE ENTRY')}
          open={partsOpenModify}
          width={'90%'}
          onCancel={() => setOpenPartsModify(false)}
          footer={null}
        >
          <OriginalStoreEntry
            onUpdatePart={(data: any) => {
              setSecectedParts([data]);
            }}
            currentPart={
              selectedParts && selectedParts.length && selectedParts[0]
            }
          />
        </Modal>
        <Modal
          title={t('CHANGE LOCATION')}
          open={openRelese}
          width={'0%'}
          onCancel={() => setOpenRelese(false)}
          footer={null}
        ></Modal>
      </div>
    </div>
  );
};

export default PartsTransfer;
