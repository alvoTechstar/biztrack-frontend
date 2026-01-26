import React from "react";
// Import your custom SelectInput component
import SelectInput from "../../../../../../components/Input/SelectInput";

// Original mock data
const mockReferralDepartments = [
  "Cardiology",
  "Dermatology",
  "Neurology",
  "Orthopedics",
  "Pediatrics",
  "Oncology",
  "General Surgery",
  "Pharmacy",
  "Nurse Station",
];

// Transform mock data into { value, label } format for SelectInput
const referralDepartmentOptions = mockReferralDepartments.map((dept) => ({
  value: dept,
  label: dept,
}));

const ReferralSection = ({
  referralDepartment,
  setReferralDepartment,
  disabled,
}) => {
  return (
    <SelectInput
      id="referral-department-select"
      label="Referral Department"
      options={referralDepartmentOptions} // Use the transformed options
      value={referralDepartment}
      onChange={(e) => setReferralDepartment(e.target.value)}
      disabled={disabled}
      // Since this is a single select, 'multiple' prop is not needed or should be false (default)
      // No need for displayEmpty or explicit MenuItem for "None" as SelectInput handles it
    />
  );
};

export default ReferralSection;
