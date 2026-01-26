import React from 'react';
import TextBoxInput from '../../../../../../components/input/TextBoxInput';
// import { useTheme } from "../../../../../../components/theme/ThemeContext";

const SymptomsNotesSection = ({ 
  symptomsNotes, 
  setSymptomsNotes, 
  disabled, 
  isMobile,
  error = false,
  errorMessage = ""
}) => {

  return (
    <TextBoxInput
      placeholder="Enter detailed symptoms, patient history, and observations..."
      input={symptomsNotes}
      handleInput={(e) => setSymptomsNotes(e.target.value)}
      disabled={disabled}
      error={error}
      errorMessage={errorMessage}
      rows={isMobile ? 6 : 10}
    />
  );
};

export default SymptomsNotesSection;