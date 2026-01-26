import React from "react";
import {
  Box,
  Tabs,
  Tab,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Typography,
  useMediaQuery,
  useTheme as useMuiTheme, // Renamed to avoid conflict with your custom useTheme
} from "@mui/material";
import { ExpandMore } from "@mui/icons-material";

// Import your custom useTheme hook to get primaryColor
import { useTheme } from "../../../../../../components/theme/ThemeContext";

// Import the section components
import SymptomsNotesSection from "./SymptomsNotesSection";
import DiagnosisSection from "./DiagnosisSection";
import PrescriptionSection from "./PrescriptionSection";
import LabTestsSection from "./LabTestsSection";
import ReferralSection from "./ReferralSection";

const ConsultationTabs = ({
  activeTab,
  setActiveTab,
  symptomsNotes,
  setSymptomsNotes,
  diagnosis,
  setDiagnosis,
  prescriptions,
  setPrescriptions,
  requestedLabTests,
  setRequestedLabTests,
  submittedLabResults,
  handleOpenLabResultModal,
  referralDepartment,
  setReferralDepartment,
  isSectionEditable, // This function comes from ConsultationPage
}) => {
  const muiTheme = useMuiTheme(); // Use the Material-UI theme for breakpoints
  const { primaryColor } = useTheme(); // Use your custom theme for primaryColor

  const isMobile = useMediaQuery(muiTheme.breakpoints.down("md")); // Use MuiTheme for media queries

  return (
    <div className="flex-grow p-4 overflow-auto">
      <div className="max-w-7xl mx-auto">
        {isMobile ? (
          /* Mobile Accordions */
          <div className="space-y-4">
            <Accordion
              expanded={activeTab === 0}
              onChange={() => setActiveTab(0)}
              disabled={!isSectionEditable("assessment")}
              sx={{
                "&.Mui-expanded": {
                  // Use primaryColor with 20% opacity for a subtle expanded background
                  bgcolor: primaryColor + "20",
                },
              }}
            >
              <AccordionSummary expandIcon={<ExpandMore />}>
                <Typography
                  sx={{
                    // Set text color to primaryColor if active, else default text color
                    color:
                      activeTab === 0
                        ? primaryColor
                        : muiTheme.palette.text.primary,
                    fontWeight: activeTab === 0 ? "bold" : "normal",
                  }}
                >
                  Symptoms & Notes
                </Typography>
              </AccordionSummary>
              <AccordionDetails>
                <SymptomsNotesSection
                  isMobile={isMobile}
                  symptomsNotes={symptomsNotes}
                  setSymptomsNotes={setSymptomsNotes}
                  disabled={!isSectionEditable("assessment")}
                />
              </AccordionDetails>
            </Accordion>

            <Accordion
              expanded={activeTab === 1}
              onChange={() => setActiveTab(1)}
              disabled={!isSectionEditable("assessment")}
              sx={{
                "&.Mui-expanded": {
                  bgcolor: primaryColor + "20",
                },
              }}
            >
              <AccordionSummary expandIcon={<ExpandMore />}>
                <Typography
                  sx={{
                    color:
                      activeTab === 1
                        ? primaryColor
                        : muiTheme.palette.text.primary,
                    fontWeight: activeTab === 1 ? "bold" : "normal",
                  }}
                >
                  Diagnosis
                </Typography>
              </AccordionSummary>
              <AccordionDetails>
                <DiagnosisSection
                  isMobile={isMobile}
                  diagnosis={diagnosis}
                  setDiagnosis={setDiagnosis}
                  disabled={!isSectionEditable("assessment")}
                />
              </AccordionDetails>
            </Accordion>

            <Accordion
              expanded={activeTab === 2}
              onChange={() => setActiveTab(2)}
              disabled={!isSectionEditable("post_lab")}
              sx={{
                "&.Mui-expanded": {
                  bgcolor: primaryColor + "20",
                },
              }}
            >
              <AccordionSummary expandIcon={<ExpandMore />}>
                <Typography
                  sx={{
                    color:
                      activeTab === 2
                        ? primaryColor
                        : muiTheme.palette.text.primary,
                    fontWeight: activeTab === 2 ? "bold" : "normal",
                  }}
                >
                  Prescriptions
                </Typography>
              </AccordionSummary>
              <AccordionDetails>
                <PrescriptionSection
                  prescriptions={prescriptions}
                  setPrescriptions={setPrescriptions}
                  disabled={!isSectionEditable("post_lab")}
                />
              </AccordionDetails>
            </Accordion>

            <Accordion
              expanded={activeTab === 3}
              onChange={() => setActiveTab(3)}
              disabled={
                !isSectionEditable("lab_test_section") &&
                !isSectionEditable("lab_results_entry")
              }
              sx={{
                "&.Mui-expanded": {
                  bgcolor: primaryColor + "20",
                },
              }}
            >
              <AccordionSummary expandIcon={<ExpandMore />}>
                <Typography
                  sx={{
                    color:
                      activeTab === 3
                        ? primaryColor
                        : muiTheme.palette.text.primary,
                    fontWeight: activeTab === 3 ? "bold" : "normal",
                  }}
                >
                  Lab Tests
                </Typography>
              </AccordionSummary>
              <AccordionDetails>
                <LabTestsSection
                  requestedLabTests={requestedLabTests}
                  setRequestedLabTests={setRequestedLabTests}
                  submittedLabResults={submittedLabResults}
                  handleOpenLabResultModal={handleOpenLabResultModal}
                  requestDisabled={!isSectionEditable("assessment")}
                  submitDisabled={!isSectionEditable("lab_results_entry")}
                />
              </AccordionDetails>
            </Accordion>

            <Accordion
              expanded={activeTab === 4}
              onChange={() => setActiveTab(4)}
              disabled={!isSectionEditable("post_lab")}
              sx={{
                "&.Mui-expanded": {
                  bgcolor: primaryColor + "20",
                },
              }}
            >
              <AccordionSummary expandIcon={<ExpandMore />}>
                <Typography
                  sx={{
                    color:
                      activeTab === 4
                        ? primaryColor
                        : muiTheme.palette.text.primary,
                    fontWeight: activeTab === 4 ? "bold" : "normal",
                  }}
                >
                  Referrals
                </Typography>
              </AccordionSummary>
              <AccordionDetails>
                <ReferralSection
                  referralDepartment={referralDepartment}
                  setReferralDepartment={setReferralDepartment}
                  disabled={!isSectionEditable("post_lab")}
                />
              </AccordionDetails>
            </Accordion>
          </div>
        ) : (
          /* Desktop Tabs */
          <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
            <Tabs
              value={activeTab}
              onChange={(e, newValue) => setActiveTab(newValue)}
              aria-label="consultation tabs"
              TabIndicatorProps={{
                sx: {
                  bgcolor: primaryColor, // Active tab indicator color from your custom theme
                },
              }}
            >
              <Tab
                label="Symptoms & Notes"
                disabled={!isSectionEditable("assessment")}
                sx={{
                  "&.Mui-selected": {
                    color: primaryColor, // Selected tab label color from your custom theme
                  },
                }}
              />
              <Tab
                label="Diagnosis"
                disabled={!isSectionEditable("assessment")}
                sx={{
                  "&.Mui-selected": {
                    color: primaryColor,
                  },
                }}
              />
              <Tab
                label="Prescriptions"
                disabled={!isSectionEditable("post_lab")}
                sx={{
                  "&.Mui-selected": {
                    color: primaryColor,
                  },
                }}
              />
              <Tab
                label="Lab Tests"
                disabled={
                  !isSectionEditable("lab_test_section") &&
                  !isSectionEditable("lab_results_entry")
                }
                sx={{
                  "&.Mui-selected": {
                    color: primaryColor,
                  },
                }}
              />
              <Tab
                label="Referrals"
                disabled={!isSectionEditable("post_lab")}
                sx={{
                  "&.Mui-selected": {
                    color: primaryColor,
                  },
                }}
              />
            </Tabs>

            <div className="mt-4">
              {activeTab === 0 && (
                <SymptomsNotesSection
                  isMobile={isMobile}
                  symptomsNotes={symptomsNotes}
                  setSymptomsNotes={setSymptomsNotes}
                  disabled={!isSectionEditable("assessment")}
                />
              )}
              {activeTab === 1 && (
                <DiagnosisSection
                  isMobile={isMobile}
                  diagnosis={diagnosis}
                  setDiagnosis={setDiagnosis}
                  disabled={!isSectionEditable("assessment")}
                />
              )}
              {activeTab === 2 && (
                <PrescriptionSection
                  prescriptions={prescriptions}
                  setPrescriptions={setPrescriptions}
                  disabled={!isSectionEditable("post_lab")}
                />
              )}
              {activeTab === 3 && (
                <LabTestsSection
                  requestedLabTests={requestedLabTests}
                  setRequestedLabTests={setRequestedLabTests}
                  submittedLabResults={submittedLabResults}
                  handleOpenLabResultModal={handleOpenLabResultModal}
                  requestDisabled={!isSectionEditable("assessment")}
                  submitDisabled={!isSectionEditable("lab_results_entry")}
                />
              )}
              {activeTab === 4 && (
                <ReferralSection
                  referralDepartment={referralDepartment}
                  setReferralDepartment={setReferralDepartment}
                  disabled={!isSectionEditable("post_lab")}
                />
              )}
            </div>
          </Box>
        )}
      </div>
    </div>
  );
};

export default ConsultationTabs;
