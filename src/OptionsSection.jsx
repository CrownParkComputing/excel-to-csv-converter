import React from 'react';

const OptionsSection = ({ 
  quoteType, 
  setQuoteType, 
  delimiter, 
  setDelimiter, 
  removeDuplicates, 
  setRemoveDuplicates, 
  convertToCSV,
  previewText,
  setSubstringSelection
}) => {
  const handleSubstringSelection = (e) => {
    const text = e.target.textContent;
    const selection = window.getSelection().toString();
    if (selection) {
      const start = text.indexOf(selection);
      const end = start + selection.length;
      setSubstringSelection({ start, end });
    }
  };

  return (
    <div className="converter-section-content">
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

      <div>
        <label className="converter-label">Substring Selection:</label>
        <div 
          className="converter-substring-preview"
          onMouseUp={handleSubstringSelection}
        >
          {previewText}
        </div>
      </div>

      <div>
        <label className="converter-label" htmlFor="delimiter">CSV Delimiter:</label>
        <input
          id="delimiter"
          type="text"
          value={delimiter}
          onChange={(e) => setDelimiter(e.target.value)}
          className="converter-input"
          placeholder="Enter delimiter (default is comma)"
        />
      </div>

      <div className="converter-checkbox-group">
        <input
          type="checkbox"
          id="remove-duplicates"
          checked={removeDuplicates}
          onChange={(e) => setRemoveDuplicates(e.target.checked)}
        />
        <label htmlFor="remove-duplicates">Remove Duplicates</label>
      </div>

      <button onClick={convertToCSV} className="converter-button">
        Convert
      </button>
    </div>
  );
};

export default OptionsSection;