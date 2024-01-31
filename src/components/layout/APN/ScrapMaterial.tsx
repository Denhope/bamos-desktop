import TabContent from '@/components/shared/Table/TabContent';
import ScrapPartsFilteredForm from '@/components/store/scrap/scrapParts/ScrapPartsFilteredForm';
import React, { FC, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import ShowParts from '../store/storeManagment/ShowParts';
import { Button, Modal, Space, message } from 'antd';
import {
  TransactionOutlined,
  EditOutlined,
  ApartmentOutlined,
  PrinterOutlined,
  SaveOutlined,
  ArrowRightOutlined,
} from '@ant-design/icons';
import {
  createBookingItem,
  getFilteredShops,
  updateManyMaterialItems,
} from '@/utils/api/thunks';
import { useAppDispatch } from '@/hooks/useTypedSelector';
import GeneretedTransferPdf from '@/components/pdf/GeneretedTransferLabels';
import { ModalForm, ProCard } from '@ant-design/pro-components';
import SearchTable from '../SearchElemTable';
import form from 'antd/es/form';
import { USER_ID } from '@/utils/api/http';

const ScrapMaterial: FC = () => {
  const dispatch = useAppDispatch();
  const [LOCATION, setLOCATION] = useState([]); //
  const [selectedStore, setSecectedStore] = useState<any>(null);
  const [selectedComStore, setSelectedComStore] = useState<any>(null);
  const [selectedLocation, setSecectedLocation] = useState<any>(null);
  const [rowKeys, setselectedRowKeys] = useState<any[]>([]);
  const [selectedParts, setSecectedParts] = useState<any>(null);
  const [partsToPrint, setPartsToPrint] = useState<any>([]);
  const [onFilterBookingDEtails, setOnFilterBookingDEtails] =
    useState<any>(null);

  const [openLocationViewer, setOpenLocationViewer] = useState<boolean>(false);
  const [onFilterTransferDEtails, setOnFilterTransferDEtails] =
    useState<any>(null);
  const [labelsOpenPrint, setOpenLabelsPrint] = useState<any>();
  const [partsOpenModify, setOpenPartsModify] = useState<boolean>(false);
  const { t } = useTranslation();
  const [selectedSingleLocation, setSecectedSingleLocation] =
    useState<any>(null);
  useEffect(() => {
    if (onFilterTransferDEtails && onFilterTransferDEtails.store) {
      // Если модальное окно открыто
      const currentCompanyID = localStorage.getItem('companyID') || '';
      dispatch(
        getFilteredShops({
          companyID: currentCompanyID,
          shopShortName: onFilterTransferDEtails.store,
        })
      ).then((action) => {
        if (action.meta.requestStatus === 'fulfilled') {
          const transformedData = action.payload[0].locations.map(
            (item: any) => ({
              ...item,
              APNNBR: item.locationName, // Преобразуем shopShortName в APNNBR
            })
          );

          setLOCATION(transformedData);
          // Обновляем состояние с преобразованными данными
        }
      });
    }
  }, [onFilterTransferDEtails, dispatch]);
  const [isScrap, setIsOnlyScrap] = useState<any>(false);
  const tabs = [
    {
      content: (
        <div className="h-[73vh] overflow-hidden flex flex-col justify-between gap-1">
          <div className="flex flex-col gap-5">
            <ScrapPartsFilteredForm
              onSelectLocation={function (record: any): void {
                throw new Error('Function not implemented.');
              }}
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
            />
            {/* {onFilterTransferDEtails &&
              onFilterTransferDEtails?.isAllSCPAPPED && ( */}
            <ShowParts
              serialNumber={onFilterTransferDEtails?.serialNumber}
              isOnlyScrapped={onFilterTransferDEtails?.isAllSCPAPPED[0]}
              storeName={onFilterTransferDEtails?.store?.toUpperCase().trim()}
              store={selectedStore || selectedComStore}
              partGroup={onFilterTransferDEtails?.partGroup}
              selectedPN={onFilterTransferDEtails?.partNumber
                ?.toUpperCase()
                .trim()}
              selectedLabel={onFilterTransferDEtails?.label}
              selectedLocations={[
                onFilterTransferDEtails?.location?.toUpperCase().trim(),
              ]}
              onSelectedIds={(record: any): void => {
                setselectedRowKeys(record);
              }}
              onSelectedParts={(record: any): void => {
                setSecectedParts(record);
              }}
              scroll={35}
            />
            {/* )} */}
          </div>
          <div className="flex justify-between">
            <Space align="center">
              <Button
                icon={<SaveOutlined />}
                disabled={!rowKeys.length || !onFilterBookingDEtails}
                onClick={() => {
                  const currentCompanyID = localStorage.getItem('companyID');
                  Modal.confirm({
                    title: `${t(
                      'YOU WANT TRANSFER PARTS TO SCRAP LOCATION'
                    )}  ${onFilterBookingDEtails?.targetLocation}`,
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
                                    OWNER_LONG_NAME:
                                      onFilterBookingDEtails.owner,
                                    OWNER_SHORT_NAME:
                                      onFilterBookingDEtails.owner,
                                  })
                                );

                                setPartsToPrint(updatedSelectedParts);
                              }}
                            >
                              PRINT NEW LABELS
                            </Button>
                          </div>
                        ),
                        onOk: async () => {
                          const result = await dispatch(
                            updateManyMaterialItems({
                              companyID: currentCompanyID || '',
                              ids: rowKeys,
                              // STOCK: onFilterBookingDEtails.targetStore,
                              LOCATION:
                                onFilterBookingDEtails?.targetLocation || '',
                              OWNER: onFilterBookingDEtails?.owner || '',
                            })
                          );
                          if (result.meta.requestStatus === 'fulfilled') {
                            message.success(t('SCRAP PART SUCCESSFULY'));
                            setselectedRowKeys([]);
                          }
                        },
                      });
                    },
                  });
                }}
                size="small"
              >
                {t('SCRAP PART')}
              </Button>
            </Space>
            <Space>
              <Button
                icon={<ArrowRightOutlined />}
                disabled={
                  !rowKeys.length || selectedParts[0]?.SHELF_NUMBER === 'SCRAP'
                }
                onClick={() => {
                  const currentCompanyID = localStorage.getItem('companyID');
                  Modal.confirm({
                    title: `${t(
                      'YOU WANT TRANSFER PARTS TO SCRAP LOCATION'
                    )}  `,
                    onOk: async () => {
                      Modal.confirm({
                        title: t('CONFIRM TRANSFER'),
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
                              icon={<ArrowRightOutlined />}
                              onClick={() => {
                                setOpenLabelsPrint(true);

                                // Создаем новый массив с измененными значениями
                                const updatedSelectedParts = selectedParts.map(
                                  (part: any) => ({
                                    ...part,
                                    SHELF_NUMBER: 'SCRAP',
                                    STOCK: onFilterTransferDEtails.store,
                                  })
                                );

                                setPartsToPrint(updatedSelectedParts);
                              }}
                            >
                              PRINT NEW LABELS
                            </Button>
                          </div>
                        ),
                        onOk: async () => {
                          const result = await dispatch(
                            updateManyMaterialItems({
                              companyID: currentCompanyID || '',
                              ids: rowKeys,
                              STOCK: onFilterTransferDEtails.store,
                              LOCATION: 'SCRAP',
                            })
                          );
                          if (result.meta.requestStatus === 'fulfilled') {
                            message.success(t('SCRAP PART SUCCESSFULY'));
                            setselectedRowKeys([]);
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
                                    station:
                                      result?.WAREHOUSE_RECEIVED_AT || 'N/A',
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
                            result.payload.forEach(async (result: any) => {
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
                                    station:
                                      result?.WAREHOUSE_RECEIVED_AT || 'N/A',
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
                {t('MOOVE TO SCRAP LOCATION')}
              </Button>
              <Button
                icon={<ApartmentOutlined />}
                disabled={
                  !rowKeys.length ||
                  !selectedParts ||
                  !selectedParts.length ||
                  selectedParts.some(
                    (part: any) => part.SHELF_NUMBER !== 'SCRAP'
                  )
                }
                onClick={() => {
                  setOpenLocationViewer(true);
                }}
                size="small"
              >
                {t('REMOVE FROM SCRAP LOCATION')}
              </Button>
            </Space>
            <Space>
              <Button
                icon={<PrinterOutlined />}
                //
                disabled={
                  !rowKeys.length ||
                  !selectedParts ||
                  !selectedParts.length ||
                  selectedParts.some(
                    (part: any) => part.SHELF_NUMBER !== 'SCRAP'
                  )
                }
                onClick={() => {
                  setPartsToPrint(selectedParts);
                  setOpenLabelsPrint(true);
                }}
                size="small"
              >
                {' '}
                {t('PRINT LABELS')}
              </Button>
            </Space>
            <Modal
              title={t('PRINT LABEL')}
              open={labelsOpenPrint}
              width={'30%'}
              onCancel={() => {
                setOpenLabelsPrint(false);
                setSecectedLocation(null);
                setSecectedSingleLocation(null);
              }}
              footer={null}
            >
              <GeneretedTransferPdf
                key={Date.now()} // добавляем уникальный ключ
                type={selectedLocation?.locationType}
                parts={partsToPrint}
              />
            </Modal>
            <ModalForm
              onFinish={async () => {
                const currentCompanyID = localStorage.getItem('companyID');
                setSecectedLocation(selectedSingleLocation);
                if (selectedSingleLocation) {
                  const result = await dispatch(
                    updateManyMaterialItems({
                      companyID: currentCompanyID || '',
                      ids: rowKeys,
                      STOCK: onFilterTransferDEtails.store,
                      LOCATION: selectedLocation.locationName,
                      OWNER: selectedLocation?.ownerShotName || '',
                    })
                  );
                  if (result.meta.requestStatus === 'fulfilled') {
                    message.success(t('TRANSFER PART SUCCESSFULY'));
                    setselectedRowKeys([]);
                    setOpenLabelsPrint(true);
                    selectedParts.forEach(async (result: any) => {
                      await dispatch(
                        createBookingItem({
                          companyID: result.COMPANY_ID,
                          data: {
                            companyID: result.COMPANY_ID,
                            userSing: localStorage.getItem('singNumber') || '',
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
                    result.payload.forEach(async (result: any) => {
                      await dispatch(
                        createBookingItem({
                          companyID: result.COMPANY_ID,
                          data: {
                            companyID: result.COMPANY_ID,
                            userSing: localStorage.getItem('singNumber') || '',
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

                    //               // Создаем новый массив с измененными значениями
                    const updatedSelectedParts = selectedParts.map(
                      (part: any) => ({
                        ...part,
                        SHELF_NUMBER: selectedLocation.locationName,
                        // onFilterTransferDEtails.targetLocation,
                        STOCK: onFilterTransferDEtails.store,
                        OWNER_LONG_NAME: selectedLocation.ownerLongName,
                        OWNER_SHORT_NAME: selectedLocation.ownerShotName,
                      })
                    );

                    //               // Обновляем partsToPrint в зависимости от условия
                    setPartsToPrint(updatedSelectedParts);
                  }
                  setOpenLocationViewer(false);
                }
              }}
              title={`${t('LOCATION SEARCH')}`}
              open={openLocationViewer}
              width={'35vw'}
              onOpenChange={setOpenLocationViewer}
            >
              <ProCard
                className="flex mx-auto justify-center align-middle"
                style={{}}
              >
                {LOCATION && (
                  <SearchTable
                    data={LOCATION}
                    onRowClick={function (record: any, rowIndex?: any): void {
                      setSecectedLocation(record);

                      setOpenLocationViewer(false);
                    }}
                    onRowSingleClick={function (
                      record: any,
                      rowIndex?: any
                    ): void {
                      setSecectedSingleLocation(record);
                    }}
                  ></SearchTable>
                )}
              </ProCard>
            </ModalForm>
          </div>
        </div>
      ),
      title: `${t('SCRAP PARTS')}`,
    },
    // {
    //   content: <></>,
    //   title: `${t('SCRAP HISTORY')}`,
    // },
  ];
  return (
    <div className="h-[82vh] overflow-hidden flex flex-col justify-between gap-1">
      <div className="flex flex-col gap-5">
        <TabContent tabs={tabs}></TabContent>
      </div>
    </div>
  );
};

export default ScrapMaterial;
