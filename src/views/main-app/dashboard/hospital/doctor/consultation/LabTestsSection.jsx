import React from "react";
import { Box, Chip, Typography } from "@mui/material";
import { Science } from "@mui/icons-material";

// Import your custom SelectInput component
import SelectInput from "../../../../../../components/input/SelectInput";

const mockLabTests = [
  { value: "Complete Blood Count (CBC)", label: "Complete Blood Count (CBC)" },
  { value: "Urinalysis", label: "Urinalysis" },
  { value: "Blood Glucose", label: "Blood Glucose" },
  { value: "Lipid Panel", label: "Lipid Panel" },
  { value: "Thyroid Function Test", label: "Thyroid Function Test" },
  { value: "Liver Function Test", label: "Liver Function Test" },
];

const LabTestsSection = ({
  requestedLabTests,
  setRequestedLabTests,
  submittedLabResults,
  handleOpenLabResultModal,
  requestDisabled,
  submitDisabled,
}) => {
  // Ensure requestedLabTests is always an array for safe use of .filter() and .some()
  // This is a defensive check to prevent the TypeError if state somehow gets corrupted.
  const currentRequestedLabTests = Array.isArray(requestedLabTests)
    ? requestedLabTests
    : [];

  const pendingLabTests = currentRequestedLabTests.filter(
    (test) => !submittedLabResults.some((result) => result.testName === test)
  );

  return (
    <Box>
      <SelectInput
        id="lab-tests-select"
        label="Request Lab Tests"
        options={mockLabTests}
        value={currentRequestedLabTests} // This will be an array of selected values
        onChange={(e) => setRequestedLabTests(e.target.value)} // e.target.value will now correctly be an array
        disabled={requestDisabled}
        multiple={true} 
      />

      <Typography variant="h6" className="mt-6 mb-3 font-semibold">
        Pending Lab Results:
      </Typography>
      <div className="flex flex-wrap gap-3">
        {pendingLabTests.length === 0 && (
          <Typography variant="body1" className="text-gray-500">
            No lab tests currently pending.
          </Typography>
        )}
        {pendingLabTests.map((test) => (
          <Chip
            key={test}
            label={test}
            icon={<Science />}
            onClick={() => handleOpenLabResultModal(test)}
            color="warning"
            variant="outlined"
            className="cursor-pointer hover:bg-yellow-50 transition-colors"
            disabled={submitDisabled}
          />
        ))}
      </div>

      <Typography variant="h6" className="mt-6 mb-3 font-semibold">
        Submitted Lab Results:
      </Typography>
      <div className="flex flex-wrap gap-3">
        {submittedLabResults.length === 0 && (
          <Typography variant="body1" className="text-gray-500">
            No lab results submitted yet.
          </Typography>
        )}
        {submittedLabResults.map((result, index) => (
          <Chip
            key={index}
            label={`${result.testName}: ${result.value} ${result.unit} (${result.status})`}
            color={result.status === "normal" ? "success" : "error"}
            variant="filled"
          />
        ))}
      </div>
    </Box>
  );
};

export default LabTestsSection;
