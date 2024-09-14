import React from 'react';

const InputSection = ({ 
  inputType, 
  handleFileUpload, 
  fileName, 
  columns, 
  selectedColumn, 
  setSelectedColumn, 
  columnPreview, 
  input, 
  setInput 
}) => {
  return (
    <div className="converter-section-content">
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
  );
};

export default InputSection;