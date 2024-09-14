import React from 'react';

const OutputSection = ({ progress, output, downloadCSV }) => {
  return (
    <div className="converter-section-content">
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
  );
};

export default OutputSection;