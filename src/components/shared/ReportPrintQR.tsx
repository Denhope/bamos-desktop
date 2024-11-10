//ts-nocheck
import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, Modal } from 'antd';
import { PrinterOutlined } from '@ant-design/icons';
import QRCode from 'qrcode';
import { useLazyGetStorePartsQuery } from '@/features/storeAdministration/PartsApi';
import { ProFormCheckbox, ProFormDigit, ProForm } from '@ant-design/pro-form';
import { PDFDocument, rgb } from 'pdf-lib';
import fontkit from '@pdf-lib/fontkit';

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

  const [trigger, { data: parts, isLoading: partsLoading }] =
    useLazyGetStorePartsQuery();

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
      const result = await trigger({ ids });
      const parts = result.data;

      if (!parts) {
        throw new Error('Parts data is undefined');
      }

      const pdfDoc = await PDFDocument.create();
      pdfDoc.registerFontkit(fontkit);

      const qrCodes = await Promise.all(
        parts.map(async (product: any) => {
          const localIdWithZeros = String(product.LOCAL_ID).padStart(6, '0');
          const qrDataURL = await generateQRCodeDataURL(localIdWithZeros);
          return qrDataURL
            ? { qrCode: qrDataURL, data: localIdWithZeros }
            : null;
        })
      );

      const qrCodesFiltered = qrCodes.filter((qrCode) => qrCode !== null);

      let currentPage = pdfDoc.addPage([pageSize.width, pageSize.height]);
      let currentX = 5;
      let currentY = pageSize.height - qrCodeSize - 5;
      const maxX = pageSize.width - qrCodeSize - 5;

      for (const qrCode of qrCodesFiltered) {
        if (!qrCode) continue;

        if (currentX > maxX) {
          currentX = 5;
          currentY -= qrCodeSize + fontSize + 2;
        }

        if (currentY < qrCodeSize + fontSize + 2) {
          currentPage = pdfDoc.addPage([pageSize.width, pageSize.height]);
          currentX = 5;
          currentY = pageSize.height - qrCodeSize - 5;
        }

        const qrImage = await pdfDoc.embedPng(qrCode.qrCode);
        currentPage.drawImage(qrImage, {
          x: currentX,
          y: currentY,
          width: qrCodeSize,
          height: qrCodeSize,
        });

        currentPage.drawText(qrCode.data, {
          x: currentX + (qrCodeSize - fontSize * 3) / 2,
          y: currentY - fontSize + 1,
          size: fontSize,
          color: rgb(0, 0, 0),
        });

        currentPage.drawRectangle({
          x: currentX - 2,
          y: currentY - fontSize - 2,
          width: qrCodeSize + 4,
          height: qrCodeSize + fontSize + 2,
          borderColor: rgb(0.5, 0.5, 0.5),
          borderWidth: 0.5,
        });

        currentX += qrCodeSize + 5;
      }

      const pdfBytes = await pdfDoc.save();
      const blob = new Blob([pdfBytes], { type: 'application/pdf' });
      const fileURL = URL.createObjectURL(blob);
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
          {/* <ProFormCheckbox
            name="pageBreakAfter"
            label={`${t('PAGE BREAK AFTER')}`}
            initialValue={defaultPageBreakAfter}
            fieldProps={{
              onChange: (e) => setPageBreakAfter(e.target.checked),
            }}
          /> */}
        </ProForm>
      </Modal>
    </div>
  );
};

export default ReportGenerator;
