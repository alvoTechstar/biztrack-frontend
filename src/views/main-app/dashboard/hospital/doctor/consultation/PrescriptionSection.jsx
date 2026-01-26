import React from 'react';
import { Box, IconButton, Typography } from '@mui/material'; // Removed TextField, Button
import { Add, Remove } from '@mui/icons-material';

import AppFormButton from '../../../../../../components/buttons/AppFormButton';
import TextInput from '../../../../../../components/input/TextInput';
import { useTheme } from '../../../../../../components/theme/ThemeContext';

const PrescriptionSection = ({ prescriptions, setPrescriptions, disabled }) => {
  const theme = useTheme(); // Access the theme
  const PrimaryColor = theme.primaryColor;

  const handleAddPrescription = () => {
    setPrescriptions([...prescriptions, { medication: '', dosage: '', frequency: '' }]);
  };

  const handleRemovePrescription = (index) => {
    const newPrescriptions = prescriptions.filter((_, i) => i !== index);
    setPrescriptions(newPrescriptions);
  };

  const handlePrescriptionChange = (index, field, value) => {
    const newPrescriptions = prescriptions.map((p, i) =>
      i === index ? { ...p, [field]: value } : p
    );
    setPrescriptions(newPrescriptions);
  };

  return (
    <Box>
      {prescriptions.length === 0 && (
        <Typography variant="body2" color="text.secondary" className="mb-4">
          No prescriptions added yet.
        </Typography>
      )}
      {prescriptions.map((prescription, index) => (
<Box
  key={index}
  className="flex flex-col md:flex-row gap-4 mb-4 p-4 border border-gray-300 rounded-lg bg-gray-50 items-center transition-all duration-300 hover:shadow-lg hover:-translate-y-px shadow-md"
>
          <TextInput
            label="Medication Name"
            placeholder="e.g., Amoxicillin"
            value={prescription.medication}
            onChange={(e) => handlePrescriptionChange(index, 'medication', e.target.value)}
            disabled={disabled}
           
          />
          <TextInput
            label="Dosage"
            placeholder="e.g., 250mg"
            value={prescription.dosage}
            onChange={(e) => handlePrescriptionChange(index, 'dosage', e.target.value)}
            disabled={disabled}
          />
          <TextInput
            label="Frequency"
            placeholder="e.g., Twice daily"
            value={prescription.frequency}
            onChange={(e) => handlePrescriptionChange(index, 'frequency', e.target.value)}
            disabled={disabled}
          />
          <IconButton onClick={() => handleRemovePrescription(index)} color="error" aria-label="remove prescription" disabled={disabled}>
            <Remove />
          </IconButton>
        </Box>
      ))}
      <AppFormButton
        text="Add Prescription"
        color={PrimaryColor} // Use the primary color from the theme
        action={handleAddPrescription}
        validation={!disabled} // Button is valid if not disabled
        icon={<Add />}
        className="mt-4" // Tailwind margin top for spacing
      />
    </Box>
  );
};

export default PrescriptionSection;