// src/components/ResumeAnalyzer/ResumeUpload.js
import React, { useState, useRef } from 'react';
import './ResumeUpload.css';

function ResumeUpload({ value, onChange }) {
  const [isDragging, setIsDragging] = useState(false);
  const [fileName, setFileName] = useState('');
  const [uploadError, setUploadError] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const fileInputRef = useRef(null);

  // FIXED: Extract text from PDF with local worker
  const extractTextFromPDF = async (file) => {
    try {
      console.log('📄 Extracting PDF...');
      
      const pdfjsLib = await import('pdfjs-dist');
      
      // FIX: Use local worker instead of CDN
      const pdfjsWorker = await import('pdfjs-dist/build/pdf.worker.entry');
      pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsWorker;

      const arrayBuffer = await file.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      
      let fullText = '';
      
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        
        // Sort items by position
        const sortedItems = textContent.items.sort((a, b) => {
          const yDiff = Math.abs(b.transform[5] - a.transform[5]);
          if (yDiff > 5) return b.transform[5] - a.transform[5];
          return a.transform[4] - b.transform[4];
        });
        
        let lastY = null;
        let pageText = '';
        
        sortedItems.forEach((item) => {
          const y = item.transform[5];
          if (lastY !== null && Math.abs(lastY - y) > 5) {
            pageText += '\n';
          }
          if (pageText && !pageText.endsWith('\n') && !pageText.endsWith(' ')) {
            pageText += ' ';
          }
          pageText += item.str;
          lastY = y;
        });
        
        fullText += pageText + '\n\n';
      }
      
      // Clean text
      fullText = fullText
        .replace(/\s+/g, ' ')
        .replace(/\n\s*\n/g, '\n')
        .replace(/\n{3,}/g, '\n\n')
        .trim();
      
      console.log('✅ PDF extracted:', fullText.length, 'chars');
      console.log('Preview:', fullText.substring(0, 300));
      
      if (!fullText || fullText.length < 50) {
        throw new Error('Could not extract text. PDF might be image-based or scanned.');
      }
      
      return fullText;
      
    } catch (error) {
      console.error('PDF error:', error);
      throw new Error('Failed to read PDF. Please copy-paste your text instead.');
    }
  };

  // Extract text from DOCX
  const extractTextFromDOCX = async (file) => {
    try {
      console.log('📝 Extracting DOCX...');
      const mammoth = (await import('mammoth')).default;
      const arrayBuffer = await file.arrayBuffer();
      const result = await mammoth.extractRawText({ arrayBuffer });
      
      const text = result.value
        .replace(/\r\n/g, '\n')
        .replace(/\n{3,}/g, '\n\n')
        .trim();
      
      console.log('✅ DOCX extracted:', text.length, 'chars');
      
      if (!text || text.length < 50) {
        throw new Error('Could not extract text from Word document.');
      }
      
      return text;
    } catch (error) {
      console.error('DOCX error:', error);
      throw new Error('Failed to read Word document. Please copy-paste your text.');
    }
  };

  const handleFile = async (file) => {
    if (!file) return;

    setUploadError('');
    setIsProcessing(true);
    
    const fileNameLower = file.name.toLowerCase();
    
    // Check file size
    if (file.size > 10 * 1024 * 1024) {
      setUploadError('File too large (max 10MB)');
      setIsProcessing(false);
      return;
    }

    try {
      let text = '';

      // PDF
      if (fileNameLower.endsWith('.pdf')) {
        text = await extractTextFromPDF(file);
      }
      // DOCX
      else if (fileNameLower.endsWith('.docx')) {
        text = await extractTextFromDOCX(file);
      }
      // TXT
      else if (fileNameLower.endsWith('.txt')) {
        text = await new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = (e) => resolve(e.target.result);
          reader.onerror = () => reject(new Error('Failed to read text file'));
          reader.readAsText(file, 'UTF-8');
        });
      }
      // DOC (old Word format)
      else if (fileNameLower.endsWith('.doc')) {
        setUploadError('Old Word format (.doc) not supported. Please save as .docx or copy-paste your text.');
        setIsProcessing(false);
        return;
      }
      // Unsupported
      else {
        setUploadError('Unsupported file type. Please upload PDF, DOCX, or TXT');
        setIsProcessing(false);
        return;
      }

      if (text && text.trim().length >= 50) {
        setFileName(file.name);
        onChange(text.trim());
        setUploadError('');
        console.log('✅ File loaded successfully!');
      } else {
        setUploadError('File is empty or too short. Please verify your file.');
      }
      
    } catch (error) {
      console.error('File read error:', error);
      setUploadError(error.message);
      setFileName('');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    handleFile(file);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    handleFile(file);
  };

  const handleClick = () => {
    if (!isProcessing) {
      fileInputRef.current?.click();
    }
  };

  const clearFile = () => {
    setFileName('');
    onChange('');
    setUploadError('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="resume-upload">
      {isProcessing ? (
        <div className="upload-area processing">
          <div className="upload-icon">⏳</div>
          <p className="upload-main-text">Processing file...</p>
          <p className="upload-sub-text">Extracting text from your resume</p>
        </div>
      ) : fileName ? (
        <div className="file-uploaded">
          <div className="file-info">
            <span className="file-icon">📄</span>
            <div>
              <div className="file-name">{fileName}</div>
              <div className="file-status">✓ Successfully uploaded</div>
            </div>
          </div>
          <button className="clear-btn" onClick={clearFile}>✕</button>
        </div>
      ) : (
        <div
          className={`upload-area ${isDragging ? 'dragging' : ''}`}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onClick={handleClick}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".txt,.pdf,.docx"
            onChange={handleFileSelect}
            style={{ display: 'none' }}
          />
          
          <div className="upload-icon">📂</div>
          <p className="upload-main-text">Drag & drop your resume here</p>
          <p className="upload-sub-text">or click to browse</p>
          <p className="upload-file-types">PDF, DOCX, or TXT files</p>
          <p className="upload-note">
            💡 For best results, copy your resume text and paste it in the box on the right →
          </p>
        </div>
      )}

      {uploadError && (
        <div className="upload-error">{uploadError}</div>
      )}
    </div>
  );
}

export default ResumeUpload;
