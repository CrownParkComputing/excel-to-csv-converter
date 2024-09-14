import React, { useState, useCallback, useEffect } from 'react';
import * as XLSX from 'xlsx';
import './ExcelToCSVConverter.css';

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
  }, [input, quoteType, uploadedFile, selectedColumn]);

  const processLines = (lines) => {
    const totalLines = lines.length;
    let csv = '';

    const processChunk = (start) => {
      const end = Math.min(start + 1000, totalLines);
      const chunk = lines.slice(start, end);

      if (quoteType === 'none') {
        csv += chunk.join(',') + (end < totalLines ? ',' : '');
      } else {
        const quote = quoteType === 'single' ? "'" : '"';
        csv += chunk.map(line => `${quote}${line}${quote}`).join(',') + (end < totalLines ? ',' : '');
      }

      setProgress(Math.round((end / totalLines) * 100));

      if (end < totalLines) {
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
          <div className={`converter-section-content ${expandedSection === 'input' ? '' : 'hidden'}`}>
            {inputType === 'excel' ? (
              <>
                <div>
                  <label className="converter-label" htmlFor="file-upload">Import Excel File:</label>
                  <input
                    id="file-upload"
                    type="file"
                    accept=".xlsx, .xls"
                    onChange={handleFileUpload}
                    className="converter-input"
                  />
                  {fileName && <p className="converter-file-name">File: {fileName}</p>}
                </div>

                {columns.length > 0 && (
                  <div>
                    <label className="converter-label" htmlFor="column-select">Select Column:</label>
                    <select
                      id="column-select"
                      value={selectedColumn}
                      onChange={(e) => setSelectedColumn(e.target.value)}
                      className="converter-select"
                    >
                      {columns.map((col, index) => (
                        <option key={index} value={col}>{col}</option>
                      ))}
                    </select>
                  </div>
                )}

                {columnPreview.length > 0 && (
                  <div className="converter-preview">
                    <label className="converter-label">Column Preview (First 5 rows):</label>
                    <ul>
                      {columnPreview.map((value, index) => (
                        <li key={index} className="converter-preview-item">{value}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </>
            ) : (
              <div>
                <label className="converter-label" htmlFor="input">Paste Excel Column Values:</label>
                <textarea
                  id="input"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  className="converter-textarea"
                  placeholder="Paste your data here..."
                />
              </div>
            )}
          </div>
        </div>

        <div className={`converter-section ${expandedSection === 'options' ? 'expanded' : ''}`}>
          <button
            className="converter-section-header"
            onClick={() => setExpandedSection(expandedSection === 'options' ? '' : 'options')}
          >
            Options
            <span>{expandedSection === 'options' ? '▲' : '▼'}</span>
          </button>
          <div className={`converter-section-content ${expandedSection === 'options' ? '' : 'hidden'}`}>
            <div>
              <label className="converter-label">Quote Type:</label>
              <div className="converter-radio-group">
                {[
                  { value: 'none', label: 'Plain' },
                  { value: 'single', label: "Single quote (')" },
                  { value: 'double', label: 'Double quote (")' }
                ].map((type) => (
                  <div key={type.value} className="converter-radio-item">
                    <input
                      type="radio"
                      id={`r-${type.value}`}
                      checked={quoteType === type.value}
                      onChange={() => setQuoteType(type.value)}
                    />
                    <label htmlFor={`r-${type.value}`}>{type.label}</label>
                  </div>
                ))}
              </div>
            </div>

            <button onClick={convertToCSV} className="converter-button">
              Convert
            </button>
          </div>
        </div>

        <div className={`converter-section ${expandedSection === 'output' ? 'expanded' : ''}`}>
          <button
            className="converter-section-header"
            onClick={() => setExpandedSection(expandedSection === 'output' ? '' : 'output')}
          >
            Output
            <span>{expandedSection === 'output' ? '▲' : '▼'}</span>
          </button>
          <div className={`converter-section-content ${expandedSection === 'output' ? '' : 'hidden'}`}>
            {progress > 0 && progress < 100 && (
              <div className="converter-progress-container">
                <div className="converter-progress-bar">
                  <div className="converter-progress-fill" style={{ width: `${progress}%` }}></div>
                </div>
                <p className="converter-progress-text">{progress}% Complete</p>
              </div>
            )}

            {output && (
              <div>
                <label className="converter-label" htmlFor="output">Output:</label>
                <textarea
                  id="output"
                  value={output}
                  readOnly
                  className="converter-textarea"
                />
              </div>
            )}

            {output && (
              <button onClick={downloadCSV} className="converter-button download">
                Download CSV
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExcelToCSVConverter;