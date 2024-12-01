//@ts-nocheck

import React, { useState } from 'react';
import {
  Upload,
  Button,
  Modal,
  Steps,
  Alert,
  Progress,
  Space,
  Table,
  Tabs,
  Typography,
  Card,
  Select,
  Tag,
} from 'antd';
import {
  UploadOutlined,
  FileExcelOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  DownloadOutlined,
  PrinterOutlined,
} from '@ant-design/icons';
import type { UploadFile } from 'antd/es/upload/interface';
import * as XLSX from 'xlsx';
import { useTranslation } from 'react-i18next';

const { Dragger } = Upload;
const { Title, Text } = Typography;

interface ValidationResult {
  row: number;
  status: 'success' | 'error';
  messages: string[];
  fieldName?: string;
  value?: string;
}

interface FieldConfig {
  name: string;
  required: boolean;
  description: string;
  example?: string;
  width?: number;
  defaultValue?: any;
  hidden?: boolean;
  validation?: (value: any) => boolean;
  displayName?: string;
}

interface TemplateConfig {
  fields: FieldConfig[];
  templateFileName: string;
  exampleData?: any[];
  additionalInstructions?: {
    tabs: {
      label: string;
      content: {
        type: 'table' | 'text';
        headers?: string[];
        content?: string[][];
      }[];
    }[];
  }[];
  dependencyRules?: {
    validate: (row: any) => {
      isValid: boolean;
      messageKey: string;
      messageParams?: (row: any) => string[];
    };
  }[];
}

interface SelectOption {
  value: string;
  label: string;
}

interface AdditionalSelect {
  key: string;
  label: string;
  options: SelectOption[];
  mode?: 'multiple' | undefined;
  required?: boolean;
  disabled?: boolean;
  width?: number;
  defaultValue?: string | string[];
  dependsOn?: string;
}

interface ValidationReportColumn {
  key: string;
  title: string;
  width?: number;
}

interface ValidationReportConfig {
  columns: ValidationReportColumn[];
  filename: string;
}

interface FileUploaderV2Props {
  onFileProcessed: (data: any[]) => void;
  isDisabled?: boolean;
  templateConfig: TemplateConfig;
  buttonText?: string;
  modalTitle?: string;
  tooltipText?: string;
  additionalSelects?: AdditionalSelect[];
  onSelectChange?: (key: string, value: any) => void;
  validationReportConfig?: ValidationReportConfig;
}

interface InstructionItem {
  label: string;
  description?: string;
}

interface AdditionalInstruction {
  title: string;
  content: (string | InstructionItem)[];
}

const FileUploaderV2: React.FC<FileUploaderV2Props> = ({
  onFileProcessed,
  isDisabled = false,
  templateConfig,
  buttonText = 'IMPORT_EXCEL',
  modalTitle = 'IMPORT_DATA',
  tooltipText,
  additionalSelects = [],
  onSelectChange,
  validationReportConfig = {
    columns: [
      { key: 'row', title: 'ROW' },
      { key: 'status', title: 'STATUS' },
      { key: 'messages', title: 'MESSAGES' },
    ],
    filename: 'validation_report',
  },
}) => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const [previewData, setPreviewData] = useState<any[]>([]);
  const [validationResults, setValidationResults] = useState<
    ValidationResult[]
  >([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [selectValues, setSelectValues] = useState<Record<string, any>>({});
  const { t } = useTranslation();

  const showModal = () => {
    setIsModalVisible(true);
    setCurrentStep(0);
    setFileList([]);
    setPreviewData([]);
    setValidationResults([]);
  };

  const handleCancel = () => {
    setIsModalVisible(false);
    setCurrentStep(0);
    setFileList([]);
    setPreviewData([]);
    setValidationResults([]);
  };

  const handleSelectChange = (key: string, value: any) => {
    const newValues = { ...selectValues, [key]: value };

    additionalSelects.forEach((select) => {
      if (select.dependsOn === key) {
        newValues[select.key] = undefined;
      }
    });

    setSelectValues(newValues);
    onSelectChange?.(key, value);
  };

  const areRequiredSelectsFilled = () => {
    return additionalSelects
      .filter((select) => select.required)
      .every((select) => {
        const value = selectValues[select.key];
        return (
          value !== undefined &&
          value !== '' &&
          (!Array.isArray(value) || value.length > 0)
        );
      });
  };

  const handleFileSelect = async (file: File) => {
    if (!file) {
      Modal.error({
        title: t('ERROR'),
        content: t('NO_FILE_SELECTED'),
      });
      return false;
    }

    if (file.size > 5 * 1024 * 1024) {
      Modal.error({
        title: t('ERROR'),
        content: t('FILE_TOO_LARGE'),
      });
      return false;
    }

    if (!areRequiredSelectsFilled()) {
      Modal.error({
        title: t('ERROR'),
        content: t('REQUIRED_SELECTS_NOT_FILLED'),
      });
      return false;
    }

    setIsProcessing(true);
    try {
      const reader = new FileReader();
      reader.onload = async (e: any) => {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

        if (!jsonData || jsonData.length <= 1) {
          Modal.error({
            title: t('ERROR'),
            content: t('EMPTY_FILE_ERROR'),
          });
          setFileList([]);
          setIsProcessing(false);
          return;
        }

        const headers = jsonData[0] as string[];
        const rows = jsonData.slice(1);

        const formattedData = rows.map((row: any) => {
          const rowData: any = {};

          headers.forEach((header, index) => {
            rowData[header] = row[index];
          });

          additionalSelects.forEach((select) => {
            rowData[select.key] = selectValues[select.key];
          });

          return rowData;
        });

        setPreviewData(formattedData);
        setValidationResults(validateData(formattedData));
        setFileList([
          { uid: '1', name: file.name, status: 'done' } as UploadFile,
        ]);
        setIsProcessing(false);
      };
      reader.readAsArrayBuffer(file);
    } catch (error) {
      setIsProcessing(false);
      Modal.error({ content: t('FILE_READ_ERROR') });
    }
    return false;
  };

  const validateData = (data: any[]): ValidationResult[] => {
    return data.map((row, index) => {
      const messages: string[] = [];
      let isValid = true;
      let failedField = null;
      let failedValue = null;

      templateConfig.fields.forEach((field) => {
        const isFieldRequired =
          typeof field.required === 'function'
            ? field.required(row)
            : field.required;

        if (isFieldRequired && !row[field.name]) {
          messages.push(
            t('VALIDATION.FIELD_REQUIRED', {
              field: field.displayName || field.name,
            })
          );
          isValid = false;
          failedField = field.name;
          failedValue = row[field.name];
        }

        if (row[field.name] && field.validation) {
          try {
            const isFieldValid = field.validation(row[field.name], row);
            if (!isFieldValid) {
              messages.push(
                t('VALIDATION.FIELD_INVALID_WITH_DETAILS', {
                  field: field.displayName || field.name,
                  value: row[field.name],
                  example: field.example,
                })
              );
              isValid = false;
              failedField = field.name;
              failedValue = row[field.name];
            }
          } catch (error) {
            messages.push(
              t('VALIDATION.VALIDATION_ERROR_WITH_DETAILS', {
                field: field.displayName || field.name,
                value: row[field.name],
                error: error instanceof Error ? error.message : 'Unknown error',
              })
            );
            isValid = false;
            failedField = field.name;
            failedValue = row[field.name];
          }
        }
      });

      return {
        row: index + 2,
        status: isValid ? 'success' : 'error',
        messages: messages.length > 0 ? messages : [t('VALIDATION.ROW_VALID')],
        fieldName: failedField,
        value: failedValue,
      };
    });
  };

  const downloadTemplate = () => {
    const headers = templateConfig.fields
      .filter((field) => !field.hidden)
      .map((field) => field.name);

    const exampleRow = templateConfig.fields
      .filter((field) => !field.hidden)
      .map((field) => field.example || '');

    const template = [headers, exampleRow];

    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.aoa_to_sheet(template);

    ws['!cols'] = templateConfig.fields
      .filter((field) => !field.hidden)
      .map((field) => ({ wch: field.width || 15 }));

    const instructionsData = [
      ['FIELD', 'REQUIRED', 'DESCRIPTION', 'EXAMPLE'],
      ...templateConfig.fields
        .filter((field) => !field.hidden)
        .map((field) => [
          field.name,
          field.required ? 'YES' : 'NO',
          field.description,
          field.example || '',
        ]),
    ];

    const wsInstructions = XLSX.utils.aoa_to_sheet(instructionsData);
    let currentRow = instructionsData.length + 2;

    if (templateConfig.additionalInstructions?.tabs) {
      templateConfig.additionalInstructions.tabs.forEach((tab) => {
        if (!tab || !tab.content) return;

        XLSX.utils.sheet_add_aoa(
          wsInstructions,
          [[`=== ${tab.label.toUpperCase()} ===`]],
          { origin: `A${currentRow}` }
        );
        currentRow++;

        if (tab.content.type === 'table' && tab.content.headers) {
          XLSX.utils.sheet_add_aoa(wsInstructions, [tab.content.headers], {
            origin: `A${currentRow}`,
          });
          currentRow++;

          if (Array.isArray(tab.content.content)) {
            XLSX.utils.sheet_add_aoa(wsInstructions, tab.content.content, {
              origin: `A${currentRow}`,
            });
            currentRow += tab.content.content.length;
          } else if (typeof tab.content.content === 'object') {
            Object.entries(tab.content.content).forEach(([type, rows]) => {
              XLSX.utils.sheet_add_aoa(wsInstructions, [[type]], {
                origin: `A${currentRow}`,
              });
              currentRow++;

              if (Array.isArray(rows)) {
                XLSX.utils.sheet_add_aoa(wsInstructions, rows, {
                  origin: `A${currentRow}`,
                });
                currentRow += rows.length;
              }
            });
          }
        } else if (tab.content.type === 'text' && tab.content.content) {
          const textContent = Array.isArray(tab.content.content)
            ? tab.content.content.map((line) => [line])
            : [[tab.content.content]];

          XLSX.utils.sheet_add_aoa(wsInstructions, textContent, {
            origin: `A${currentRow}`,
          });
          currentRow += textContent.length;
        }

        currentRow++;
      });
    }

    wsInstructions['!cols'] = [
      { wch: 20 }, // FIELD
      { wch: 10 }, // REQUIRED
      { wch: 40 }, // DESCRIPTION
      { wch: 20 }, // EXAMPLE
    ];

    XLSX.utils.book_append_sheet(wb, ws, 'Template');
    XLSX.utils.book_append_sheet(wb, wsInstructions, 'Instructions');

    XLSX.writeFile(wb, templateConfig.templateFileName);
  };

  const renderInstructionContent = (content: (string | InstructionItem)[]) => {
    return content.map((item, index) => {
      if (typeof item === 'string') {
        return <div key={index}>{item}</div>;
      }
      return (
        <div key={index}>
          <div>{item.label}</div>
          {item.description && (
            <div className="text-gray-500 text-sm ml-4">{item.description}</div>
          )}
        </div>
      );
    });
  };

  const exportToExcel = (data: any[], filename: string) => {
    // Создаем рабочую книгу и лист
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(data);

    // Добавляем стили для ячеек
    ws['!cols'] = validationReportConfig.columns.map((col) => ({
      wch: col.width || 20,
    }));

    // Создаем стили для ошибок
    const errorStyle = {
      fill: { fgColor: { rgb: 'FFFF0000' } }, // Красный цвет
      font: { color: { rgb: 'FFFFFFFF' } }, // Белый текст
    };

    // Проходим по всем ячейкам и применяем стили для невалидных значений
    const range = XLSX.utils.decode_range(ws['!ref'] || 'A1');

    for (let R = range.s.r + 1; R <= range.e.r; R++) {
      const rowData = validationResults[R - 1];
      if (rowData?.status === 'error') {
        // Если строка содержит ошибку, находим соответствующую ячейку с невалидным значением
        for (let C = range.s.c; C <= range.e.c; C++) {
          const cellRef = XLSX.utils.encode_cell({ r: R, c: C });
          const cellAddress = XLSX.utils.decode_cell(cellRef);

          // Получаем заголовок колонки
          const headerRef = XLSX.utils.encode_cell({ r: 0, c: C });
          const headerValue = ws[headerRef]?.v;

          // Проверяем, является ли это поле невалидным
          if (rowData.fieldName && headerValue === rowData.fieldName) {
            if (!ws[cellRef]) ws[cellRef] = { v: '' };

            // Применяем стили
            ws[cellRef].s = errorStyle;
          }
        }
      }
    }

    // Добавляем лист в книгу и сохраняем файл
    XLSX.utils.book_append_sheet(wb, ws, 'Report');

    // Сохраняем с поддержкой стилей
    const wopts = {
      bookType: 'xlsx' as const,
      bookSST: false,
      type: 'binary',
      cellStyles: true,
    };

    XLSX.writeFile(wb, `${filename}.xlsx`, wopts);
  };

  const prepareValidationReport = () => {
    return validationResults.map((result, index) => {
      const reportRow: any = {};
      const dataRow = previewData[index] || {};

      // Добавляем все поля из конфигурации шаблона
      templateConfig.fields
        .filter((field) => !field.hidden)
        .forEach((field) => {
          const value = dataRow[field.name] || '';
          reportRow[t(field.displayName || field.name)] = value;

          // Сохраняем информацию о невалидном поле
          if (result.fieldName === field.name) {
            reportRow._invalidField = field.name;
            reportRow._invalidValue = value;
          }
        });

      // Добавляем стандартные поля отчета
      validationReportConfig.columns.forEach((column) => {
        switch (column.key) {
          case 'row':
            reportRow[t(column.title)] = result.row;
            break;
          case 'status':
            reportRow[t(column.title)] =
              result.status === 'success' ? t('SUCCESS') : t('ERROR');
            reportRow._status = result.status; // Сохраняем статус для стилизации
            break;
          case 'messages':
            reportRow[t(column.title)] = result.messages.join(', ');
            break;
          case 'fieldName':
            reportRow[t(column.title)] = result.fieldName || '';
            break;
          case 'value':
            reportRow[t(column.title)] = result.value || '';
            break;
        }
      });

      return reportRow;
    });
  };

  const handlePrint = (content: string) => {
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>тчет по импорту</title>
            <style>
              body { font-family: Arial, sans-serif; }
              table { width: 100%; border-collapse: collapse; margin: 20px 0; }
              th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
              th { background-color: #f5f5f5; }
              .error { color: #ff4d4f; }
              .success { color: #52c41a; }
              @media print {
                button { display: none; }
              }
            </style>
          </head>
          <body>
            ${content}
            <script>
              setTimeout(() => { window.print(); window.close(); }, 500);
            </script>
          </body>
        </html>
      `);
    }
  };

  const generateValidationReportHtml = () => {
    const errorCount = validationResults.filter(
      (r) => r.status === 'error'
    ).length;
    const successCount = validationResults.filter(
      (r) => r.status === 'success'
    ).length;

    // Получаем все поля для отображения
    const allColumns = [
      ...templateConfig.fields
        .filter((field) => !field.hidden)
        .map((field) => ({
          key: field.name,
          title: t(field.displayName || field.name),
        })),
      ...validationReportConfig.columns,
    ];

    return `
      <h2>${t('VALIDATION_REPORT')}</h2>
      <p>${t('DATE')}: ${new Date().toLocaleString()}</p>
      <p>${t('TOTAL_RECORDS')}: ${validationResults.length}</p>
      <p>${t('SUCCESSFUL')}: ${successCount}</p>
      <p>${t('WITH_ERRORS')}: ${errorCount}</p>
      <table>
        <thead>
          <tr>
            ${allColumns
              .map((column) => `<th>${t(column.title)}</th>`)
              .join('')}
          </tr>
        </thead>
        <tbody>
          ${validationResults
            .map(
              (result, index) => `
            <tr>
              ${allColumns
                .map((column) => {
                  const dataRow = previewData[index] || {};
                  let cellContent = '';

                  // Проверяем, является ли это поле из конфигурации шаблона
                  if (
                    templateConfig.fields.some((f) => f.name === column.key)
                  ) {
                    cellContent = dataRow[column.key] || '';
                  } else {
                    // Обрабатываем стандартные поля отчета
                    switch (column.key) {
                      case 'row':
                        cellContent = result.row;
                        break;
                      case 'status':
                        cellContent = `<span class="${result.status}">${
                          result.status === 'success'
                            ? t('SUCCESS')
                            : t('ERROR')
                        }</span>`;
                        break;
                      case 'messages':
                        cellContent = result.messages.join(', ');
                        break;
                      case 'fieldName':
                        cellContent = result.fieldName || '';
                        break;
                      case 'value':
                        cellContent = result.value || '';
                        break;
                    }
                  }
                  return `<td>${cellContent}</td>`;
                })
                .join('')}
            </tr>
          `
            )
            .join('')}
        </tbody>
      </table>
    `;
  };

  const ValidationResultsTable = ({
    results,
  }: {
    results: ValidationResult[];
  }) => {
    const columns = [
      {
        title: t('ROW'),
        dataIndex: 'row',
        width: 80,
      },
      {
        title: t('STATUS'),
        dataIndex: 'status',
        width: 100,
        render: (status: string) => (
          <Tag color={status === 'success' ? 'green' : 'red'}>
            {status === 'success' ? (
              <CheckCircleOutlined />
            ) : (
              <CloseCircleOutlined />
            )}
            {t(status.toUpperCase())}
          </Tag>
        ),
      },
      {
        title: t('FIELD'),
        dataIndex: 'fieldName',
        width: 150,
      },
      {
        title: t('VALUE'),
        dataIndex: 'value',
        width: 150,
      },
      {
        title: t('MESSAGES'),
        dataIndex: 'messages',
        render: (messages: string[]) => (
          <ul style={{ margin: 0, paddingLeft: 20 }}>
            {messages.map((message, index) => (
              <li key={index}>{message}</li>
            ))}
          </ul>
        ),
      },
    ];

    return (
      <Table
        dataSource={results.map((result, index) => ({
          ...result,
          key: index,
        }))}
        columns={columns}
        size="small"
        pagination={false}
        scroll={{ y: 400 }}
      />
    );
  };

  const validationTable = (
    <div style={{ height: '400px' }}>
      <Space style={{ marginBottom: 16 }}>
        <Button
          key="print"
          icon={<PrinterOutlined />}
          onClick={() => handlePrint(generateValidationReportHtml())}
        >
          {t('PRINT_REPORT')}
        </Button>
        <Button
          key="excel"
          icon={<FileExcelOutlined />}
          onClick={() =>
            exportToExcel(
              prepareValidationReport(),
              validationReportConfig.filename
            )
          }
        >
          {t('EXPORT_TO_EXCEL')}
        </Button>
      </Space>
      <ValidationResultsTable results={validationResults} />
    </div>
  );

  const previewColumns = templateConfig.fields
    .filter((field) => !field.hidden)
    .map((field) => ({
      title: t(field.name),
      dataIndex: field.name,
      width: field.width || 120,
      ellipsis: true,
    }));

  const renderInstructions = (instructions: any) => {
    if (!instructions?.tabs) return null;

    return (
      <Tabs>
        {instructions.tabs.map((tab: any) => (
          <Tabs.TabPane tab={t(tab.label)} key={tab.key}>
            {tab.content.type === 'table' ? (
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    {tab.content.headers?.map((header: string, idx: number) => (
                      <th
                        key={idx}
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        {t(header)}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {tab.content.content &&
                    (Array.isArray(tab.content.content)
                      ? tab.content.content.map(
                          (row: string[], rowIdx: number) => (
                            <tr
                              key={rowIdx}
                              className={
                                rowIdx % 2 === 0 ? 'bg-white' : 'bg-gray-50'
                              }
                            >
                              {row.map((cell, cellIdx) => (
                                <td
                                  key={cellIdx}
                                  className="px-6 py-2 whitespace-nowrap text-sm text-gray-500"
                                >
                                  {cell}
                                </td>
                              ))}
                            </tr>
                          )
                        )
                      : Object.entries(tab.content.content).map(
                          ([type, rows]: [string, any[]], typeIdx) => (
                            <React.Fragment key={type}>
                              <tr className="bg-gray-100">
                                <td
                                  colSpan={tab.content.headers?.length || 1}
                                  className="px-6 py-2 font-medium"
                                >
                                  {t(type)}
                                </td>
                              </tr>
                              {Array.isArray(rows) &&
                                rows.map((row: string[], rowIdx: number) => (
                                  <tr
                                    key={`${type}-${rowIdx}`}
                                    className={
                                      rowIdx % 2 === 0
                                        ? 'bg-white'
                                        : 'bg-gray-50'
                                    }
                                  >
                                    {row.map((cell, cellIdx) => (
                                      <td
                                        key={cellIdx}
                                        className="px-6 py-2 whitespace-nowrap text-sm text-gray-500"
                                      >
                                        {cell}
                                      </td>
                                    ))}
                                  </tr>
                                ))}
                            </React.Fragment>
                          )
                        ))}
                </tbody>
              </table>
            ) : tab.content.type === 'text' ? (
              // Выносим ��екстовый контент за пределы таблицы
              <div className="text-instructions p-4">
                {tab.content.content?.map((line: string, idx: number) => (
                  <div
                    key={idx}
                    className={`text-sm ${
                      line.startsWith('   ')
                        ? 'pl-8 text-gray-600'
                        : line.startsWith('Примечание:')
                        ? 'text-blue-600 mt-2 font-medium'
                        : line.trim() === ''
                        ? 'h-4'
                        : line.startsWith('1.') ||
                          line.startsWith('2.') ||
                          line.startsWith('3.')
                        ? 'font-medium mt-4 text-base'
                        : 'text-gray-800'
                    }`}
                  >
                    {line || <br />}
                  </div>
                ))}
              </div>
            ) : (
              <ul className="list-disc pl-5">
                {Array.isArray(tab.content) &&
                  tab.content.map((item: string, itemIdx: number) => (
                    <li key={itemIdx} className="text-sm text-gray-600">
                      {t(item)}
                    </li>
                  ))}
              </ul>
            )}
          </Tabs.TabPane>
        ))}
      </Tabs>
    );
  };

  const items = [
    {
      title: t('SELECT_FILE'),
      content: (
        <div className="upload-section">
          <Tabs
            items={[
              {
                label: t('UPLOAD'),
                key: 'upload',
                children: (
                  <Space
                    direction="vertical"
                    size="large"
                    style={{ width: '100%' }}
                  >
                    <Alert
                      message={t('DOWNLOAD_TEMPLATE_FIRST')}
                      description={
                        <Button
                          type="link"
                          icon={<DownloadOutlined />}
                          onClick={downloadTemplate}
                        >
                          {t('DOWNLOAD_TEMPLATE')}
                        </Button>
                      }
                      type="info"
                      showIcon
                    />
                    <div className="selects-container">
                      <Space
                        direction="vertical"
                        style={{ width: '100%', marginBottom: 16 }}
                      >
                        {additionalSelects.map((select) => (
                          <Select
                            key={select.key}
                            size="small"
                            style={{ width: select.width || 200 }}
                            placeholder={t(select.label)}
                            mode={select.mode}
                            value={selectValues[select.key]}
                            onChange={(value) =>
                              handleSelectChange(select.key, value)
                            }
                            options={select.options}
                            disabled={
                              select.disabled ||
                              (select.dependsOn &&
                                !selectValues[select.dependsOn])
                            }
                            required={select.required}
                          />
                        ))}
                      </Space>

                      <Dragger
                        accept=".xlsx,.xls"
                        beforeUpload={handleFileSelect}
                        fileList={fileList}
                        multiple={false}
                        disabled={!areRequiredSelectsFilled()}
                      >
                        <p className="ant-upload-drag-icon">
                          <FileExcelOutlined />
                        </p>
                        <p className="ant-upload-text">
                          {t('DRAG_FILES_HERE')}
                        </p>
                        <p className="ant-upload-hint">
                          {t('CLICK_OR_DRAG_HINT')}
                        </p>
                      </Dragger>
                    </div>
                  </Space>
                ),
              },
              {
                label: t('INSTRUCTIONS'),
                key: 'instructions',
                children: (
                  <Space direction="vertical" style={{ width: '100%' }}>
                    {renderInstructions(templateConfig.additionalInstructions)}
                  </Space>
                ),
              },
            ]}
          />
        </div>
      ),
    },
    {
      title: t('PREVIEW'),
      content: (
        <div style={{ height: '400px' }}>
          <Table
            dataSource={previewData}
            columns={previewColumns}
            size="small"
            pagination={{
              pageSize: 10,
              showSizeChanger: true,
              showQuickJumper: true,
              showTotal: (total) => `Всего ${total} записей`,
            }}
            scroll={{
              x: 1620, // Сумма всех width
              y: 300,
            }}
            sticky={true}
          />
        </div>
      ),
    },
    {
      title: t('VALIDATION'),
      content: validationTable,
    },
  ];

  return (
    <>
      <Button
        size={'small'}
        onClick={showModal}
        icon={<UploadOutlined />}
        disabled={isDisabled}
      >
        {t(buttonText)}
      </Button>

      <Modal
        title={t(modalTitle)}
        open={isModalVisible}
        onCancel={handleCancel}
        width={'90%'}
        footer={null}
      >
        <div className="import-modal">
          <Steps
            current={currentStep}
            items={items.map((item) => ({ title: item.title }))}
          />

          <div className="steps-content">
            {isProcessing ? (
              <div style={{ textAlign: 'center', padding: '20px' }}>
                <Progress type="circle" status="active" />
                <p>{t('PROCESSING_FILE')}</p>
              </div>
            ) : (
              items[currentStep].content
            )}
          </div>

          <div className="steps-action">
            <Space>
              {currentStep > 0 && (
                <Button onClick={() => setCurrentStep(currentStep - 1)}>
                  {t('PREVIOUS')}
                </Button>
              )}
              {currentStep < items.length - 1 && (
                <Button
                  type="primary"
                  onClick={() => setCurrentStep(currentStep + 1)}
                >
                  {t('NEXT')}
                </Button>
              )}
              {currentStep === items.length - 1 && (
                <Button
                  type="primary"
                  onClick={() => {
                    onFileProcessed(previewData);
                    handleCancel();
                  }}
                  disabled={validationResults.some((r) => r.status === 'error')}
                >
                  {t('IMPORT')}
                </Button>
              )}
              <Button onClick={handleCancel}>{t('CANCEL')}</Button>
            </Space>
          </div>
        </div>

        <style jsx>{`
          .import-modal {
            padding: 20px 0;
          }
          .steps-content {
            margin-top: 24px;
            padding: 24px;
            background: #fafafa;
            min-height: 200px;
            border-radius: 4px;
          }
          .steps-action {
            margin-top: 24px;
            text-align: right;
          }
          .instructions-content {
            max-height: 400px;
            overflow-y: auto;
          }
          .instructions-table {
            width: 100%;
            border-collapse: collapse;
            margin: 8px 0;
          }
          .instructions-table th,
          .instructions-table td {
            padding: 8px;
            border: 1px solid #f0f0f0;
            text-align: left;
          }
          .instructions-table th {
            background: #fafafa;
            font-weight: 500;
          }
          .upload-section {
            min-height: 300px;
          }
          @media print {
            .steps-action,
            .ant-steps {
              display: none;
            }
          }
        `}</style>
      </Modal>
    </>
  );
};

export default FileUploaderV2;
