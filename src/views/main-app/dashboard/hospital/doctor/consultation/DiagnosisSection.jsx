import React from 'react';
import TextBoxInput from '../../../../../../components/Input/TextBoxInput';

const DiagnosisSection = ({ 
  diagnosis, 
  setDiagnosis, 
  disabled, 
  isMobile,
  error = false,
  errorMessage = ""
}) => {
  

  return (
    <TextBoxInput
      placeholder="Enter your diagnosis here..."
      input={diagnosis}
      handleInput={(e) => setDiagnosis(e.target.value)}
      disabled={disabled}
      error={error}
      errorMessage={errorMessage}
      rows={isMobile ? 6 : 10}
    />
  );
};

export default DiagnosisSection;