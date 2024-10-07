import React, { useState, useCallback, useRef, useEffect } from 'react';
import { Upload, Button, Input, message, Spin, Space, Row, Col, Divider, List, Tabs, Modal, Tooltip, Statistic, Card } from 'antd';
import { UploadOutlined,InfoCircleOutlined, ReloadOutlined, FolderOpenOutlined, ClearOutlined, FolderViewOutlined, SendOutlined, DeleteOutlined } from '@ant-design/icons';
import { Document, Page } from 'react-pdf';
import { PDFDocument } from 'pdf-lib';
import * as pdfjs from 'pdfjs-dist';
import { saveAs } from 'file-saver';

import 'pdfjs-dist/build/pdf.worker.entry';
import { useDeleteUploadedFileMutation, useGetUploadHistoryQuery, useUploadFilesMutation } from '@/features/restrictionAdministration/fileUploadApi';

const { TabPane } = Tabs;

pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

interface PdfSlicerPanelProps {
  onSavePages: (pages: Blob[]) => void;
}

const PdfSlicerPanel: React.FC<PdfSlicerPanelProps> = ({ onSavePages }) => {
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [pdfDocument, setPdfDocument] = useState<pdfjs.PDFDocumentProxy | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [numPages, setNumPages] = useState(0);
  const [prefix, setPrefix] = useState<string>('');
  const [searchArea, setSearchArea] = useState({ x: 0, y: 0, width: 0, height: 0 });
  const [isProcessing, setIsProcessing] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [startPos, setStartPos] = useState({ x: 0, y: 0 });
  const [saveDirectory, setSaveDirectory] = useState<string>('');
  const [documentFormat, setDocumentFormat] = useState<string>('21-XXX-XX-XX');
  const [filePath, setFilePath] = useState<string>('');
  const [processingResults, setProcessingResults] = useState<{
    totalProcessed: number;
    successCount: number;
    errorCount: number;
    savedFiles: string[];
  }>({
    totalProcessed: 0,
    successCount: 0,
    errorCount: 0,
    savedFiles: [],
  });
  const [filesToUpload, setFilesToUpload] = useState<File[]>([]);
  const [activeTab, setActiveTab] = useState('1');
  const [isUploadModalVisible, setIsUploadModalVisible] = useState(false);
  const [uploadResults, setUploadResults] = useState<{ success: string[], error: string[] }>({ success: [], error: [] });

  const [uploadFiles, { isLoading: isUploading }] = useUploadFilesMutation();
  const { data: uploadHistory, isLoading: isLoadingHistory } = useGetUploadHistoryQuery();
  const [deleteFile] = useDeleteUploadedFileMutation();

  const onFileChange = async (info: any) => {
    const file = info.file.originFileObj;
    if (file) {
      console.log('File selected:', file.name);
      setPdfFile(file);
      setFilePath(file.path || 'Unknown path');
      try {
        const arrayBuffer = await file.arrayBuffer();
        console.log('ArrayBuffer obtained:', arrayBuffer.byteLength);
        const pdf = await pdfjs.getDocument({ data: arrayBuffer }).promise;
        console.log('PDF document loaded:', pdf.numPages, 'pages');
        setPdfDocument(pdf);
        setNumPages(pdf.numPages);
        renderPage(1, pdf);
      } catch (error) {
        console.error('Error loading PDF:', error);
        message.error('Failed to load PDF file');
      }
    }
  };

  const renderPage = async (pageNumber: number, pdf: pdfjs.PDFDocumentProxy) => {
    try {
      const page = await pdf.getPage(pageNumber);
      const scale = 1.5;
      const viewport = page.getViewport({ scale });
      const canvas = canvasRef.current;
      if (canvas) {
        const context = canvas.getContext('2d');
        canvas.height = viewport.height;
        canvas.width = viewport.width;
        if (context) {
          const renderContext = {
            canvasContext: context,
            viewport: viewport
          };
          await page.render(renderContext).promise;
          console.log('Page rendered:', pageNumber);
        }
      }
    } catch (error) {
      console.error('Error rendering page:', error);
      message.error('Failed to display PDF page');
    }
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (canvas) {
      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      setIsDrawing(true);
      setStartPos({ x, y });
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (canvas) {
      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      setSearchArea({
        x: Math.min(startPos.x, x),
        y: Math.min(startPos.y, y),
        width: Math.abs(x - startPos.x),
        height: Math.abs(y - startPos.y),
      });
    }
  };

  const handleMouseUp = () => {
    setIsDrawing(false);
    drawSearchArea();
    console.log('Search area set:', searchArea);
    if (canvasRef.current) {
      console.log('Canvas dimensions:', {
        width: canvasRef.current.width,
        height: canvasRef.current.height
      });
    }
  };

  const drawSearchArea = () => {
    const canvas = canvasRef.current;
    if (canvas) {
      const context = canvas.getContext('2d');
      if (context) {
        context.strokeStyle = 'red';
        context.lineWidth = 2;
        context.strokeRect(searchArea.x, searchArea.y, searchArea.width, searchArea.height);
      }
    }
  };

  const processDocument = useCallback(async () => {
    if (!pdfFile || !pdfDocument || !searchArea.width || !searchArea.height) {
      message.error('Please upload a PDF file and select a search area');
      return;
    }
  
    if (!saveDirectory) {
      message.error('Please select a directory for saving');
      return;
    }
  
    setIsProcessing(true);
  
    try {
      const arrayBuffer = await pdfFile.arrayBuffer();
      const pdfDoc = await PDFDocument.load(arrayBuffer);
      const pages = pdfDoc.getPages();
      const slicedPages: { pages: number[], name: string }[] = [];
  
      // Get the size of the first page to calculate the ratio
      const firstPage = await pdfDocument.getPage(1);
      const viewport = firstPage.getViewport({ scale: 1 });
      const scaleX = viewport.width / canvasRef.current!.width;
      const scaleY = viewport.height / canvasRef.current!.height;
  
      // Calculate the search area once with a larger extension
      const pdfSearchArea = {
        x: Math.max(0, searchArea.x * scaleX - 50),
        y: Math.max(0, (canvasRef.current!.height - searchArea.y - searchArea.height) * scaleY - 50),
        width: searchArea.width * scaleX + 100,
        height: searchArea.height * scaleY + 100,
      };
  
      console.log('Constant search area:', pdfSearchArea);
      console.log(`Searching for document number in format: ${documentFormat}`);
  
      const regex = new RegExp(getDocumentFormatRegex(documentFormat));
  
      for (let i = 0; i < pages.length; i++) {
        const page = await pdfDocument.getPage(i + 1);
        const textContent = await page.getTextContent();
        console.log(`Page ${i + 1}, number of text elements:`, textContent.items.length);
  
        console.log(`Page ${i + 1}, search area:`, pdfSearchArea);
  
        const text = textContent.items
          .filter((item: any) => {
            if ('str' in item) {
              const [x, y, w, h] = item.transform as number[];
              const itemBottom = viewport.height - y;
              const itemRight = x + w;
              const isInArea = (
                (x >= pdfSearchArea.x && x <= pdfSearchArea.x + pdfSearchArea.width) ||
                (itemRight >= pdfSearchArea.x && itemRight <= pdfSearchArea.x + pdfSearchArea.width) ||
                (itemBottom >= pdfSearchArea.y && itemBottom <= pdfSearchArea.y + pdfSearchArea.height) ||
                (y >= pdfSearchArea.y && y <= pdfSearchArea.y + pdfSearchArea.height)
              );
              if (isInArea) {
                console.log(`Page ${i + 1}, found text in area:`, item.str, 'coordinates:', { x, y, w, h });
              }
              return isInArea;
            }
            return false;
          })
          .map((item: any) => 'str' in item ? item.str : '')
          .join(' ');
  
        console.log(`Page ${i + 1}, all found text in area:`, text);
  
        if (text.trim()) {
          console.log(`Page ${i + 1}, searching for document number match in text:`, text);
          const match = text.match(regex);
          if (match) {
            console.log(`Page ${i + 1}, found document number:`, match[0]);
            const documentNumber = match[0];
            
            const existingIndex = slicedPages.findIndex(item => item.name === `${prefix}_${documentNumber}`);
            if (existingIndex !== -1) {
              slicedPages[existingIndex].pages.push(i);
            } else {
              slicedPages.push({ pages: [i], name: `${prefix}_${documentNumber}` });
            }
          } else {
            console.log(`Page ${i + 1}, document number not found in text:`, text);
          }
        } else {
          console.log(`Page ${i + 1}, text not found in selected area`);
        }
      }
  
      console.log(`Total documents found: ${slicedPages.length}`);
  
      const savedFiles: string[] = [];
      let successCount = 0;
      let errorCount = 0;
  
      // Save pages
      for (const item of slicedPages) {
        try {
          const newPdfDoc = await PDFDocument.create();
          for (const pageIndex of item.pages) {
            const [copiedPage] = await newPdfDoc.copyPages(pdfDoc, [pageIndex]);
            newPdfDoc.addPage(copiedPage);
          }
          const pdfBytes = await newPdfDoc.save();
          
          // Save file without confirmation
          const filePath = `${saveDirectory}/${item.name}.pdf`;
          await window.electronAPI.saveFile(filePath, pdfBytes);
          console.log(`Saved file: ${filePath}`);
          savedFiles.push(filePath);
          successCount++;
        } catch (error) {
          console.error(`Error saving file ${item.name}.pdf:`, error);
          errorCount++;
        }
      }
  
      setProcessingResults({
        totalProcessed: slicedPages.length,
        successCount,
        errorCount,
        savedFiles,
      });
  
      message.success(`Successfully processed ${successCount} out of ${slicedPages.length} documents`);
    } catch (error) {
      console.error('Error processing PDF:', error);
      message.error('Failed to process PDF');
    } finally {
      setIsProcessing(false);
    }
  }, [pdfFile, pdfDocument, searchArea, prefix, saveDirectory, documentFormat]);

  const changePage = (delta: number) => {
    if (pdfDocument) {
      const newPage = Math.max(1, Math.min(currentPage + delta, pdfDocument.numPages));
      setCurrentPage(newPage);
      renderPage(newPage, pdfDocument);
    }
  };

  const resetPdf = () => {
    setPdfFile(null);
    setPdfDocument(null);
    setCurrentPage(1);
    setNumPages(0);
    setPrefix('');
    setSearchArea({ x: 0, y: 0, width: 0, height: 0 });
    setIsProcessing(false);
    setIsDrawing(false);
    setStartPos({ x: 0, y: 0 });
    if (canvasRef.current) {
      const context = canvasRef.current.getContext('2d');
      if (context) {
        context.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
      }
    }
    message.success('PDF reset');
  };

  const handleDirectorySelect = async () => {
    if (!window.electronAPI) {
      console.error('electronAPI is not available');
      message.error('Failed to access Electron API');
      return;
    }

    try {
      const result = await window.electronAPI.openDirectoryDialog();
      if (result && !result.canceled && result.filePaths.length > 0) {
        setSaveDirectory(result.filePaths[0]);
      }
    } catch (error) {
      console.error('Error selecting directory:', error);
      message.error('Failed to select directory');
    }
  };

  const resetSelection = () => {
    setSearchArea({ x: 0, y: 0, width: 0, height: 0 });
    if (canvasRef.current) {
      const context = canvasRef.current.getContext('2d');
      if (context) {
        renderPage(currentPage, pdfDocument!);
      }
    }
    message.success('Selection reset');
  };

  const getDocumentFormatRegex = (format: string) => {
    return format.replace(/X+/g, (match) => `\\d{${match.length}}`).replace(/-/g, '[\\s-]?');
  };

  const openSaveDirectory = useCallback(() => {
    if (saveDirectory && window.electronAPI) {
      window.electronAPI.openPath(saveDirectory);
    } else {
      message.error('Save directory is not set or Electron API is not available');
    }
  }, [saveDirectory]);

  const isValidFile = (file: File): boolean => {
    const isPdf = file.name.toLowerCase().endsWith('.pdf');
    const prefixRegex = /^[A-Z]{3,4}_task_/;
    const numberRegex = /\d{2}-\d{3}-\d{2}-\d{2}/;
    
    console.log('File name:', file.name);
    console.log('Is PDF:', isPdf);
    console.log('Prefix match:', prefixRegex.test(file.name));
    console.log('Number match:', numberRegex.test(file.name));
    
    return isPdf && prefixRegex.test(file.name) && numberRegex.test(file.name);
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      const validFiles = Array.from(files).filter(isValidFile);
      
      if (validFiles.length !== files.length) {
        message.warning('Некоторые файлы были отфильтрованы, так как не соответствуют требованиям.');
      }

      setFilesToUpload(prevFiles => [...prevFiles, ...validFiles]);
    }
  };

  const handleUpload = async () => {
    if (filesToUpload.length === 0) {
      message.error('Please select files to upload');
      return;
    }

    const formData = new FormData();
    filesToUpload.forEach((file) => {
      formData.append('files', file);
    });

    try {
      const result = await uploadFiles(formData).unwrap();
      setUploadResults(result);
      message.success(`Successfully uploaded ${result.success.length} out of ${filesToUpload.length} files`);
      setFilesToUpload([]);
    } catch (error) {
      console.error('Error uploading files:', error);
      message.error('An error occurred while uploading files');
      
      // Add errors to the report
      setUploadResults(prevResults => ({
        success: prevResults.success,
        error: [...prevResults.error, ...filesToUpload.map(file => file.name)]
      }));
    }
  };

  const removeFileFromUpload = (fileToRemove: File) => {
    setFilesToUpload(prevFiles => prevFiles.filter(file => file !== fileToRemove));
  };

  const renderSlicingTab = () => (
    <Space direction="vertical" style={{ width: '100%' }}>
      <Space>
        <Upload
          accept=".pdf"
          beforeUpload={() => false}
                    onChange={onFileChange}
        >
          <Button icon={<UploadOutlined />}>Select PDF file</Button>
        </Upload>
        <Button 
          icon={<ReloadOutlined />} 
          onClick={resetPdf}
          disabled={!pdfFile}
        >
          Reset PDF
        </Button>
        <Button
          icon={<ClearOutlined />}
          onClick={resetSelection}
          disabled={!searchArea.width || !searchArea.height}
        >
          Reset selection
        </Button>
      </Space>

      <Input
        placeholder="Enter prefix (e.g., LCV)"
        value={prefix}
        onChange={(e) => setPrefix(e.target.value)}
      />

      <Input
        placeholder="Document number format (e.g., 21-XXX-XX-XX)"
        value={documentFormat}
        onChange={(e) => setDocumentFormat(e.target.value)}
      />

      <Space>
        <Input
          placeholder="Save directory"
          value={saveDirectory}
          readOnly
          style={{ width: '300px' }}
        />
        <Button
          icon={<FolderOpenOutlined />}
          onClick={handleDirectorySelect}
        >
          Select
        </Button>
      </Space>

      <Button
        type="primary"
        onClick={processDocument}
        disabled={!pdfFile || !searchArea.width || !searchArea.height || isProcessing || !saveDirectory}
      >
        {isProcessing ? <Spin /> : 'Process and save PDF'}
      </Button>

      {processingResults.totalProcessed > 0 && (
        <div style={{ marginTop: '16px' }}>
          <Space>
            <h3>Processing Results:</h3>
            <Button
              icon={<FolderViewOutlined />}
              onClick={openSaveDirectory}
              disabled={!saveDirectory}
            >
              Open Save Directory
            </Button>
          </Space>
          <p>Total processed: {processingResults.totalProcessed}</p>
          <p>Successfully saved: {processingResults.successCount}</p>
          <p>Errors: {processingResults.errorCount}</p>
          <h4>Saved Files:</h4>
          <List
            size="small"
            bordered
            dataSource={processingResults.savedFiles}
            renderItem={item => <List.Item>{item}</List.Item>}
            style={{ maxHeight: '200px', overflowY: 'auto' }}
          />
        </div>
      )}
    </Space>
  );

  const renderUploadTab = () => {
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleButtonClick = () => {
      fileInputRef.current?.click();
    };

    return (
      <Space direction="vertical" style={{ width: '100%', height: '100%' }}>
        <Button icon={<InfoCircleOutlined />} onClick={() => message.info('Files must be in PDF format and named as XXX_task_*.pdf, where XXX is a prefix of 3 or 4 letters')}>
          Information about file format
        </Button>
        
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept=".pdf"
          onChange={handleFileSelect}
          style={{ display: 'none' }}
        />
        <Button icon={<UploadOutlined />} onClick={handleButtonClick}>
          Select PDF files
        </Button>
        
        {filesToUpload.length > 0 && (
          <div style={{ height: '50vh', overflowY: 'auto', marginTop: '10px', marginBottom: '10px' }}>
            <List
              size="small"
              header={<div>Selected files:</div>}
              bordered
              dataSource={filesToUpload}
              rowKey={(file: File) => `${file.name}-${file.lastModified}`}
              renderItem={(file: File, index: number) => (
                <List.Item
                  actions={[
                    <Button
                      key="delete"
                      type="text"
                      icon={<DeleteOutlined />}
                      onClick={() => removeFileFromUpload(file)}
                      danger
                    >
                      Delete
                    </Button>
                  ]}
                >
                  <span style={{ marginRight: '10px', minWidth: '30px', display: 'inline-block' }}>
                    {index + 1}.
                  </span>
                  {file.name}
                </List.Item>
              )}
            />
          </div>
        )}
        
        <Button 
          type="primary"
          icon={<SendOutlined />}
          onClick={handleUpload}
          disabled={filesToUpload.length === 0}
        >
          Upload files to server
        </Button>
      </Space>
    );
  };

  return (
    <Row gutter={[16, 16]} style={{ height: '100vh', padding: '20px' }}>
      <Col xs={24} lg={12} style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
        <Tabs activeKey={activeTab} onChange={setActiveTab}>
          <TabPane tab="PDF Slicing" key="1">
            {renderSlicingTab()}
          </TabPane>
          <TabPane tab="File Upload" key="2">
            {renderUploadTab()}
          </TabPane>
        </Tabs>
      </Col>
      
      <Col xs={24} lg={12} style={{ height: '75%', display: 'flex', flexDirection: 'column' }}>
        {activeTab === '1' && pdfFile && (
          <>
            <div style={{ marginBottom: 16 }}>
              <p><strong>Имя файла:</strong> {pdfFile.name}</p>
              <p><strong>Путь к файлу:</strong> {filePath}</p>
            </div>
            <div style={{ 
              flex: 1,
              minHeight: '40vh',
              overflow: 'auto', 
              border: '1px solid #ccc', 
              marginBottom: 16 
            }}>
              <canvas
                ref={canvasRef}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                style={{ maxWidth: '100%', height: 'auto' }}
              />
            </div>
            <Space>
              <Button onClick={() => changePage(-1)}>Предыдущая страница</Button>
              <Button onClick={() => changePage(1)}>Следующая страница</Button>
              <span>Страница {currentPage} из {numPages}</span>
            </Space>
          </>
        )}
        {activeTab === '2' && (
          <div style={{ height: '100%', display: 'flex', flexDirection: 'column', overflowY: 'auto' }}>
            <h3 style={{ marginBottom: '24px' }}>Отчет о загрузке файлов</h3>
            {(uploadResults.success.length > 0 || uploadResults.error.length > 0) ? (
              <>
                <Card style={{ marginBottom: '24px' }}>
                  <Row gutter={[16, 16]}>
                    <Col xs={24} sm={8}>
                      <Statistic 
                        title="Всего файлов" 
                        value={uploadResults.success.length + uploadResults.error.length} 
                      />
                    </Col>
                    <Col xs={24} sm={8}>
                      <Statistic 
                        title="Успешно загружено" 
                        value={uploadResults.success.length} 
                        valueStyle={{ color: '#3f8600' }}
                      />
                    </Col>
                    <Col xs={24} sm={8}>
                      <Statistic 
                        title="Ошибки при загрузке" 
                        value={uploadResults.error.length} 
                        valueStyle={{ color: '#cf1322' }}
                      />
                    </Col>
                  </Row>
                </Card>
                
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '24px' }}>
                  {uploadResults.success.length > 0 && (
                    <Card 
                      title="Успешно загруженные файлы"
                      bodyStyle={{ maxHeight: '45vh', overflowY: 'auto' }}
                    >
                      <List
                        size="small"
                        dataSource={uploadResults.success}
                        renderItem={item => <List.Item>{item}</List.Item>}
                      />
                    </Card>
                  )}
                  
                  {uploadResults.error.length > 0 && (
                    <Card 
                      title="Файлы, которые не удалось загрузить"
                      bodyStyle={{ maxHeight: '45vh', overflowY: 'auto' }}
                    >
                      <List
                        size="small"
                        dataSource={uploadResults.error}
                        renderItem={item => (
                          <List.Item>
                            <div>
                              <div>{item}</div>
                              <div style={{ color: '#cf1322', fontSize: '0.9em' }}>
                                Причина: Ошибка при загрузке файла
                              </div>
                            </div>
                          </List.Item>
                        )}
                      />
                    </Card>
                  )}
                </div>
              </>
            ) : (
              <Card>
                <p>Загрузка файлов еще не выполнялась или нет результатов для отображения.</p>
              </Card>
            )}
          </div>
        )}
      </Col>
    </Row>
  );
};

export default PdfSlicerPanel;