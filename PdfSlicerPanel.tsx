const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50 МБ

function PdfSlicerPanel() {
  // ... существующий код ...

  const handleFileUpload = async (files: File[]) => {
    const oversizedFiles = files.filter(file => file.size > MAX_FILE_SIZE);
    if (oversizedFiles.length > 0) {
      console.error('Следующие файлы превышают максимальный размер:', oversizedFiles.map(f => f.name));
      // Показать пользователю сообщение об ошибке
      return;
    }

    try {
      const formData = new FormData();
      files.forEach((file) => {
        formData.append('files', file);
      });

      const response = await fetch('/files/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      // Обработка успешной загрузки
    } catch (error) {
      console.error('Ошибка при загрузке файлов:', error);
      // Показать пользователю сообщение об ошибке
    }
  };

  // ... остальной код ...
}