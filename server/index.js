const express = require('express');
const multer = require('multer');
const path = require('path');

const app = express();
const upload = multer({ dest: 'uploads/' });

// ... существующий код ...

app.post('/api/upload', upload.array('files'), (req, res) => {
  if (!req.files || req.files.length === 0) {
    return res.status(400).send('Файлы не были загружены.');
  }

  const uploadedFiles = req.files.map(file => ({
    filename: file.filename,
    originalname: file.originalname,
    size: file.size
  }));

  res.json({ message: 'Файлы успешно загружены', files: uploadedFiles });
});

// ... остальной код ...