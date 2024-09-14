import React, { useState, useCallback, useEffect } from 'react';
import * as XLSX from 'xlsx';
import './ExcelToCSVConverter.css';
import './DarkMode.css';
import InputSection from './InputSection';
import OptionsSection from './OptionsSection';
import OutputSection from './OutputSection';

const ExcelToCSVConverter = () => {
  const [input, setInput] = useState('');
  const [quoteType, setQuoteType] = useState('none');
  const [output, setOutput] = useState('');
  const [progress, setProgress] = useState(0);
  const [fileName, setFileName] = useState('');
  const [columns, setColumns] = useState([]);
  const [selectedColumn, setSelectedColumn] = useState('');
  const [uploadedFile, setUploadedFile] = useState(null);
  const [columnPreview, setColumnPreview] = useState([]);
  const [expandedSection, setExpandedSection] = useState('input');
  const [inputType, setInputType] = useState('excel');
  const [delimiter, setDelimiter] = useState(',');
  const [removeDuplicates, setRemoveDuplicates] = useState(false);
  const [substringSelection, setSubstringSelection] = useState({ start: 0, end: undefined });

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFileName(file.name);
      setUploadedFile(file);
      const reader = new FileReader();
      reader.onload = (evt) => {
        const bstr = evt.target.result;
        const wb = XLSX.read(bstr, { type: 'binary' });
        const wsname = wb.SheetNames[0];
        const ws = wb.Sheets[wsname];
        const data = XLSX.utils.sheet_to_json(ws, { header: 1 });
        const headers = data[0];
        setColumns(headers);
        setSelectedColumn(headers[0]);
        updateColumnPreview(data, headers[0]);
      };
      reader.readAsBinaryString(file);
    }
  };

  const updateColumnPreview = (data, column) => {
    const columnIndex = data[0].indexOf(column);
    const preview = data.slice(1, 6).map(row => row[columnIndex]);
    setColumnPreview(preview);
  };

  useEffect(() => {
    if (uploadedFile && selectedColumn) {
      const reader = new FileReader();
      reader.onload = (evt) => {
        const bstr = evt.target.result;
        const wb = XLSX.read(bstr, { type: 'binary' });
        const wsname = wb.SheetNames[0];
        const ws = wb.Sheets[wsname];
        const data = XLSX.utils.sheet_to_json(ws, { header: 1 });
        updateColumnPreview(data, selectedColumn);
      };
      reader.readAsBinaryString(uploadedFile);
    }
  }, [uploadedFile, selectedColumn]);

  const convertToCSV = useCallback(() => {
    setProgress(0);
    setExpandedSection('output');
    let lines = input.split('\n').map(line => line.trim()).filter(line => line !== '');
    
    if (uploadedFile) {
      const reader = new FileReader();
      reader.onload = (evt) => {
        const bstr = evt.target.result;
        const wb = XLSX.read(bstr, { type: 'binary' });
        const wsname = wb.SheetNames[0];
        const ws = wb.Sheets[wsname];
        const data = XLSX.utils.sheet_to_json(ws);
        lines = data.map(row => row[selectedColumn]);
        processLines(lines);
      };
      reader.readAsBinaryString(uploadedFile);
    } else {
      processLines(lines);
    }
  }, [input, quoteType, uploadedFile, selectedColumn, substringSelection, delimiter, removeDuplicates]);

  const processLines = (lines) => {
    const totalLines = lines.length;
    let csv = '';

    // Apply substring if specified
    lines = lines.map(line => line.substring(substringSelection.start, substringSelection.end));

    // Remove duplicates if option is selected
    if (removeDuplicates) {
      lines = [...new Set(lines)];
    }

    const processChunk = (start) => {
      const end = Math.min(start + 1000, lines.length);
      const chunk = lines.slice(start, end);

      if (quoteType === 'none') {
        csv += chunk.join(delimiter) + (end < lines.length ? delimiter : '');
      } else {
        const quote = quoteType === 'single' ? "'" : '"';
        csv += chunk.map(line => `${quote}${line}${quote}`).join(delimiter) + (end < lines.length ? delimiter : '');
      }

      setProgress(Math.round((end / totalLines) * 100));

      if (end < lines.length) {
        setTimeout(() => processChunk(end), 0);
      } else {
        setOutput(csv);
      }
    };

    processChunk(0);
  };

  const downloadCSV = () => {
    const blob = new Blob([output], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'exported.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="converter-container">
      <h1 className="converter-header">Excel to CSV Converter</h1>
      
      <div className="converter-input-type">
        <button
          className={inputType === 'excel' ? 'active' : ''}
          onClick={() => {
            setInputType('excel');
            setExpandedSection('input');
          }}
        >
          Excel Import
        </button>
        <button
          className={inputType === 'paste' ? 'active' : ''}
          onClick={() => {
            setInputType('paste');
            setExpandedSection('input');
          }}
        >
          Paste Values
        </button>
      </div>

      <div>
        <div className={`converter-section ${expandedSection === 'input' ? 'expanded' : ''}`}>
          <button
            className="converter-section-header"
            onClick={() => setExpandedSection(expandedSection === 'input' ? '' : 'input')}
          >
            Input
            <span>{expandedSection === 'input' ? '▲' : '▼'}</span>
          </button>
          <InputSection
            inputType={inputType}
            handleFileUpload={handleFileUpload}
            fileName={fileName}
            columns={columns}
            selectedColumn={selectedColumn}
            setSelectedColumn={setSelectedColumn}
            columnPreview={columnPreview}
            input={input}
            setInput={setInput}
          />
        </div>

        <div className={`converter-section ${expandedSection === 'options' ? 'expanded' : ''}`}>
          <button
            className="converter-section-header"
            onClick={() => setExpandedSection(expandedSection === 'options' ? '' : 'options')}
          >
            Options
            <span>{expandedSection === 'options' ? '▲' : '▼'}</span>
          </button>
          <OptionsSection
            quoteType={quoteType}
            setQuoteType={setQuoteType}
            delimiter={delimiter}
            setDelimiter={setDelimiter}
            removeDuplicates={removeDuplicates}
            setRemoveDuplicates={setRemoveDuplicates}
            convertToCSV={convertToCSV}
            previewText={columnPreview[0] || input.split('\n')[0] || ''}
            setSubstringSelection={setSubstringSelection}
          />
        </div>

        <div className={`converter-section ${expandedSection === 'output' ? 'expanded' : ''}`}>
          <button
            className="converter-section-header"
            onClick={() => setExpandedSection(expandedSection === 'output' ? '' : 'output')}
          >
            Output
            <span>{expandedSection === 'output' ? '▲' : '▼'}</span>
          </button>
          <OutputSection
            progress={progress}
            output={output}
            downloadCSV={downloadCSV}
          />
        </div>
      </div>
    </div>
  );
};

export default ExcelToCSVConverter;