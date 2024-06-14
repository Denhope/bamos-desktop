//@ts-nocheck
import React, { useState, useEffect } from 'react';
import pdfMake from 'pdfmake/build/pdfmake';
import pdfFonts from 'pdfmake/build/vfs_fonts';
import { useTranslation } from 'react-i18next';
import { Button, Modal } from 'antd';
import { PrinterOutlined } from '@ant-design/icons';
import QRCode from 'qrcode';

import { useGetStorePartsQuery } from '@/features/storeAdministration/PartsApi';
import { ProFormCheckbox, ProFormDigit, ProForm } from '@ant-design/pro-form';
pdfMake.vfs = pdfFonts.pdfMake.vfs;

interface ReportGeneratorProps {
  data: any[];
  isDisabled?: boolean;
  ids?: any;
  qrCodeSize?: number;
  fontSize?: number;
  pageSize?: { width: number; height: number; unit: string };
  pageBreakAfter?: boolean;
  openSettingsModal?: boolean;
}

const ReportGenerator: React.FC<ReportGeneratorProps> = ({
  data,
  isDisabled,
  ids,
  qrCodeSize: defaultQrCodeSize = 50,
  fontSize: defaultFontSize = 12,
  pageSize: defaultPageSize = { width: 174, height: 280, unit: 'mm' },
  pageBreakAfter: defaultPageBreakAfter = true,
  openSettingsModal = false,
}) => {
  const [pdfBlob, setPdfBlob] = useState<Blob | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [settingsVisible, setSettingsVisible] = useState<boolean>(false);
  const [qrCodeSize, setQrCodeSize] = useState<number>(defaultQrCodeSize);
  const [fontSize, setFontSize] = useState<number>(defaultFontSize);
  const [pageSize, setPageSize] = useState<{
    width: number;
    height: number;
    unit: string;
  }>(defaultPageSize);
  const [pageBreakAfter, setPageBreakAfter] = useState<boolean>(
    defaultPageBreakAfter
  );
  const { t } = useTranslation();

  useEffect(() => {
    console.log('QR Code Size Changed:', qrCodeSize);
  }, [qrCodeSize]);

  useEffect(() => {
    console.log('Font Size Changed:', fontSize);
  }, [fontSize]);

  useEffect(() => {
    console.log('Page Size Changed:', pageSize);
  }, [pageSize]);

  useEffect(() => {
    console.log('Page Break After Changed:', pageBreakAfter);
  }, [pageBreakAfter]);

  const {
    data: parts,
    isLoading: partsLoading,
    refetch,
  } = useGetStorePartsQuery(ids ? { ids: ids } : {}, {
    skip: !ids,
  });

  const generateQRCodeDataURL = async (data: string) => {
    try {
      const qrDataURL = await QRCode.toDataURL(data, { width: qrCodeSize });
      return qrDataURL;
    } catch (error) {
      console.error('Ошибка при генерации QR-кода:', error);
      return null;
    }
  };

  const generatePdfFile = async () => {
    setLoading(true);

    try {
      const qrCodes = await Promise.all(
        parts.map(async (product: any) => {
          const qrDataURL = await generateQRCodeDataURL(
            String(product.LOCAL_ID)
          );
          return qrDataURL
            ? {
                qrCode: qrDataURL,
                data: product,
              }
            : null;
        })
      );

      const qrCodesFiltered = qrCodes.filter((qrCode) => qrCode !== null);

      const docDefinition: any = {
        pageMargins: [2, 2, 1, 1],
        defaultStyle: {
          fontSize: fontSize,
        },
        pageSize: pageSize,
        content: qrCodesFiltered.map((qrCode) => ({
          columns: [
            {
              stack: [
                {
                  image: qrCode?.qrCode,
                  width: qrCodeSize,
                  height: qrCodeSize,
                  alignment: 'left',
                  margin: [-3, -3, -5, -5],
                },
                {
                  text: JSON.stringify(qrCode?.data.LOCAL_ID),
                  fontSize: fontSize,
                  alignment: 'left',
                  margin: [3, 0, 0, 0],
                },
              ],
              alignment: 'left',
            },
          ],
          pageBreak: pageBreakAfter ? 'after' : undefined,
        })),
        styles: {
          header: {
            fontSize: 8,
            bold: true,
            margin: [0, 0, 0, 5],
          },
        },
      };

      const pdfDoc = pdfMake.createPdf(docDefinition);
      pdfDoc.getBlob((blob: Blob) => {
        const fileURL = window.URL.createObjectURL(blob);
        const newWindow = window.open(fileURL, '_blank');

        if (
          !newWindow ||
          newWindow.closed ||
          typeof newWindow.closed === 'undefined'
        ) {
          alert('Заблокировано открытие файла. Пожалуйста, сохраните файл.');
        } else {
          newWindow.focus();
        }

        window.URL.revokeObjectURL(fileURL);
        setPdfBlob(blob);
      });
    } catch (error) {
      console.error('Ошибка при генерации PDF:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSettingsOk = () => {
    setSettingsVisible(false);
    generatePdfFile();
  };

  const handleSettingsCancel = () => {
    setSettingsVisible(false);
  };

  const handlePrintButtonClick = () => {
    if (openSettingsModal) {
      setSettingsVisible(true);
    } else {
      generatePdfFile();
    }
  };

  return (
    <div>
      <Button
        icon={<PrinterOutlined />}
        size="small"
        onClick={handlePrintButtonClick}
        disabled={loading || isDisabled}
      >
        {loading ? 'Processing' : ` ${t('PRINT QRCODE')}`}
      </Button>
      <Modal
        title={`${t('PRINT SETTINGS')}`}
        visible={settingsVisible}
        onOk={handleSettingsOk}
        onCancel={handleSettingsCancel}
      >
        <ProForm
          size="small"
          layout="horizontal"
          submitter={false}
          initialValues={{
            qrCodeSize: defaultQrCodeSize,
            fontSize: defaultFontSize,
            pageSize: defaultPageSize.width,
            pageHeight: defaultPageSize.height,
            pageUnit: defaultPageSize.unit,
            pageBreakAfter: defaultPageBreakAfter,
          }}
          onFinish={handleSettingsOk}
        >
          <ProFormDigit
            width={'xl'}
            name="qrCodeSize"
            label={` ${t('QRCODE SIZE')}`}
            initialValue={defaultQrCodeSize}
            fieldProps={{
              onChange: (value: any) => setQrCodeSize(value),
            }}
          />
          <ProFormDigit
            width={'xl'}
            name="fontSize"
            label={` ${t('FONT SIZE')}`}
            initialValue={defaultFontSize}
            fieldProps={{
              onChange: (value) => setFontSize(value as number),
            }}
          />
          <ProFormDigit
            width={'xl'}
            name="pageSize"
            label={`${t('PAGE WIDTH')}`}
            initialValue={defaultPageSize.width}
            fieldProps={{
              onChange: (value) =>
                setPageSize({ ...pageSize, width: value as number }),
            }}
          />
          <ProFormDigit
            width={'xl'}
            name="pageHeight"
            label={`${t('PAGE HEIGHT')}`}
            initialValue={defaultPageSize.height}
            fieldProps={{
              onChange: (value) =>
                setPageSize({ ...pageSize, height: value as number }),
            }}
          />
          <ProFormCheckbox
            name="pageBreakAfter"
            label={`${t('PAGE BREAK AFTER')}`}
            initialValue={defaultPageBreakAfter}
            fieldProps={{
              onChange: (e) => setPageBreakAfter(e.target.checked),
            }}
          />
        </ProForm>
      </Modal>
    </div>
  );
};

export default ReportGenerator;
