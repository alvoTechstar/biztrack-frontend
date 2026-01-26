import React, { useState, useEffect } from "react";
import { Box, useTheme as useMuiTheme } from "@mui/material";

import PatientInfoHeader from "./consultation/PatientInfoHeader";
import ConsultationTabs from "./consultation/ConsultationTabs";
import ActionButtons from "./consultation/ActionButtons";
import LabResultModal from "./consultation/LabResultsModal";
import FinishConsultationModal from "./consultation/FinishConsultationModal";
import Toaster from "../../../../../components/Toaster";

import { useTheme } from "../../../../../components/theme/ThemeContext";

const ConsultationPage = ({
  onCancelConsultation,
  patientDetails,
  onConsultationComplete,
}) => {
  // Added onConsultationComplete
  const { PrimaryColor } = useTheme();
  const muiTheme = useMuiTheme();

  const [patientInfo, setPatientInfo] = useState({
    name: patientDetails?.name || "Jane Doe",
    age: patientDetails?.age || 34,
    gender: patientDetails?.gender || "Female",
    queueNumber: patientDetails?.queueNumber || "P-12345",
    consultationStatus: "Active Consultation",
  });

  const [activeTab, setActiveTab] = useState(0);
  const [symptomsNotes, setSymptomsNotes] = useState("");
  const [diagnosis, setDiagnosis] = useState("");
  const [prescriptions, setPrescriptions] = useState([
    { medication: "", dosage: "", frequency: "" },
  ]);
  const [requestedLabTests, setRequestedLabTests] = useState([]);
  const [submittedLabResults, setSubmittedLabResults] = useState([]);
  const [referralDepartment, setReferralDepartment] = useState("");
  const [saveProgressStatus, setSaveProgressStatus] = useState(false);
  const [consultationStage, setConsultationStage] = useState("assessment");

  const [openLabResultModal, setOpenLabResultModal] = useState(false);
  const [currentLabTestName, setCurrentLabTestName] = useState("");
  const [labResultValue, setLabResultValue] = useState("");
  const [labResultUnit, setLabResultUnit] = useState("");
  const [labResultStatus, setLabResultStatus] = useState("");
  const [labResultNotes, setLabResultNotes] = useState("");

  const [openFinishModal, setOpenFinishModal] = useState(false);
  const [finishModalMessage, setFinishModalMessage] = useState("");

  const [showToaster, setShowToaster] = useState(false);
  const [toasterMessage, setToasterMessage] = useState("");
  const [toasterState, setToasterState] = useState("info");
  const [toasterTitle, setToasterTitle] = useState("");

  useEffect(() => {
    if (saveProgressStatus) {
      const timer = setTimeout(() => {
        setSaveProgressStatus(false);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [saveProgressStatus]);

  useEffect(() => {
    const hasPendingTests = requestedLabTests.some(
      (test) => !submittedLabResults.some((res) => res.testName === test)
    );

    if (hasPendingTests) {
      setPatientInfo((prev) => ({
        ...prev,
        consultationStatus: "Awaiting Lab Results",
      }));
      setConsultationStage("awaiting_lab");
    } else if (requestedLabTests.length > 0 && !hasPendingTests) {
      setPatientInfo((prev) => ({
        ...prev,
        consultationStatus: "Active Consultation",
      }));
      setConsultationStage("post_lab");
    } else {
      if (
        consultationStage !== "completed" &&
        consultationStage !== "awaiting_nurse"
      ) {
        setPatientInfo((prev) => ({
          ...prev,
          consultationStatus: "Active Consultation",
        }));
        setConsultationStage("assessment");
      }
    }
  }, [requestedLabTests, submittedLabResults, consultationStage]);

  const handleOpenLabResultModal = (testName) => {
    setCurrentLabTestName(testName);
    setOpenLabResultModal(true);
  };

  const handleCloseLabResultModal = () => {
    setOpenLabResultModal(false);
    setCurrentLabTestName("");
    setLabResultValue("");
    setLabResultUnit("");
    setLabResultStatus("");
    setLabResultNotes("");
  };

  const handleSubmitLabResult = () => {
    const newResult = {
      testName: currentLabTestName,
      value: labResultValue,
      unit: labResultUnit,
      status: labResultStatus,
      notes: labResultNotes,
    };
    setSubmittedLabResults([...submittedLabResults, newResult]);
    handleCloseLabResultModal();
    setToasterTitle("Lab Result Submitted");
    setToasterMessage(
      `Lab result for ${currentLabTestName} has been recorded.`
    );
    setToasterState("true");
    setShowToaster(true);
  };

  const handleSaveProgress = () => {
    setSaveProgressStatus(true);
    console.log("Saving progress:", {
      symptomsNotes,
      diagnosis,
      prescriptions,
      requestedLabTests,
      submittedLabResults,
      referralDepartment,
      consultationStage,
    });
    setToasterTitle("Progress Saved");
    setToasterMessage(
      "Your consultation progress has been successfully saved!"
    );
    setToasterState("true");
    setShowToaster(true);
    // No navigation on save, stay on the current patient
  };

  const handleFinishConsultation = () => {
    const hasTrulyPendingLabs = requestedLabTests.some(
      (test) => !submittedLabResults.some((res) => res.testName === test)
    );

    if (hasTrulyPendingLabs) {
      setFinishModalMessage(
        `You have ${
          requestedLabTests.filter(
            (test) => !submittedLabResults.some((res) => res.testName === test)
          ).length
        } pending lab test(s). If you finish now, the patient will be sent to the lab and then return to you later for final prescription. Confirm?`
      );
    } else if (referralDepartment === "Nurse Station") {
      setFinishModalMessage(
        "You have referred the patient to the Nurse Station for an injection. Confirm finishing the consultation?"
      );
    } else if (prescriptions.length > 0 && referralDepartment !== "Pharmacy") {
      setFinishModalMessage(
        "You have prescribed medication. The patient will be directed to the Pharmacy. Confirm finishing?"
      );
    } else if (
      prescriptions.length === 0 &&
      requestedLabTests.length === submittedLabResults.length &&
      referralDepartment === ""
    ) {
      setFinishModalMessage(
        "Are you sure you want to finish this consultation? No prescriptions, lab tests, or referrals specified."
      );
    } else {
      setFinishModalMessage(
        "Are you sure you want to finish this consultation?"
      );
    }
    setOpenFinishModal(true);
  };

  const handleConfirmFinishConsultation = () => {
    setOpenFinishModal(false);
    const hasTrulyPendingLabs = requestedLabTests.some(
      (test) => !submittedLabResults.some((res) => res.testName === test)
    );

    let title, message, state;

    if (hasTrulyPendingLabs) {
      setConsultationStage("awaiting_lab");
      setPatientInfo((prev) => ({
        ...prev,
        consultationStatus: "Awaiting Lab Results",
      }));
      title = "Consultation Status Update";
      message = "Patient sent to Lab. Consultation awaiting results.";
      state = "false";
    } else if (referralDepartment === "Pharmacy" || prescriptions.length > 0) {
      setConsultationStage("completed");
      setPatientInfo((prev) => ({
        ...prev,
        consultationStatus: "Consultation Completed",
      }));
      title = "Consultation Completed";
      message = "Patient sent to Pharmacy. Consultation completed.";
      state = "true";
    } else if (referralDepartment === "Nurse Station") {
      setConsultationStage("awaiting_nurse");
      setPatientInfo((prev) => ({
        ...prev,
        consultationStatus: "Referred to Nurse",
      }));
      title = "Referral Made";
      message =
        "Patient referred to Nurse Station. Consultation awaiting nurse action.";
      state = "false";
    } else {
      setConsultationStage("completed");
      setPatientInfo((prev) => ({
        ...prev,
        consultationStatus: "Consultation Completed",
      }));
      title = "Consultation Completed";
      message = "Consultation completed successfully!";
      state = "true";
    }
    setToasterTitle(title);
    setToasterMessage(message);
    setToasterState(state);
    setShowToaster(true);

    // After a short delay for the toaster to show, call the parent callback
    // if the consultation is truly finished (i.e., not just awaiting lab/nurse)
    if (consultationStage === "completed") {
      // Check if the stage *will be* completed
      setTimeout(() => {
        onConsultationComplete &&
          onConsultationComplete(patientDetails.queueNumber);
      }, 1500); // Give 1.5 seconds for the toaster to be seen
    }
  };

  const handleCancel = () => {
    // This action means the patient was not fully attended or the consultation is aborted.
    // Call the parent's onCancelConsultation function.
    setToasterTitle("Consultation Canceled");
    setToasterMessage("The consultation for this patient has been canceled.");
    setToasterState("false"); // Use "false" for error/warning/info
    setShowToaster(true);

    setTimeout(() => {
      onCancelConsultation && onCancelConsultation(patientDetails.queueNumber);
    }, 1500); // Give 1.5 seconds for the toaster to be seen
  };

  const isSectionEditable = (stageToCheck) => {
    switch (consultationStage) {
      case "assessment":
        return (
          stageToCheck === "assessment" ||
          stageToCheck === "lab_test_section" ||
          stageToCheck === "post_lab"
        );
      case "awaiting_lab":
        return stageToCheck === "lab_results_entry";
      case "post_lab":
        return (
          stageToCheck === "post_lab" || stageToCheck === "lab_results_entry"
        );
      case "awaiting_nurse":
      case "completed":
        return false;
      default:
        return false;
    }
  };

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        height: "100vh",
        bgcolor: muiTheme.palette.background.default,
      }}
    >
      <PatientInfoHeader patientInfo={patientInfo} />

      <Toaster
        open={showToaster}
        state={toasterState}
        title={toasterTitle}
        message={toasterMessage}
        action={setShowToaster}
        position="right"
      />

      <Box sx={{ flexGrow: 1, overflowY: "auto" }}>
        <ConsultationTabs
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          symptomsNotes={symptomsNotes}
          setSymptomsNotes={setSymptomsNotes}
          diagnosis={diagnosis}
          setDiagnosis={setDiagnosis}
          prescriptions={prescriptions}
          setPrescriptions={setPrescriptions}
          requestedLabTests={requestedLabTests}
          setRequestedLabTests={setRequestedLabTests}
          submittedLabResults={submittedLabResults}
          handleOpenLabResultModal={handleOpenLabResultModal}
          referralDepartment={referralDepartment}
          setReferralDepartment={setReferralDepartment}
          isSectionEditable={isSectionEditable}
        />

        <ActionButtons
          saveProgressStatus={saveProgressStatus}
          handleSaveProgress={handleSaveProgress}
          handleFinishConsultation={handleFinishConsultation}
          onCancelConsultation={handleCancel}
          disabledSave={
            !isSectionEditable("assessment") &&
            consultationStage !== "post_lab" &&
            consultationStage !== "lab_results_entry"
          }
          disabledFinish={
            consultationStage === "completed" ||
            consultationStage === "awaiting_nurse"
          }
          disabledCancel={consultationStage === "completed"}
        />
      </Box>

      <LabResultModal
        open={openLabResultModal}
        onClose={handleCloseLabResultModal}
        currentLabTestName={currentLabTestName}
        labResultValue={labResultValue}
        setLabResultValue={setLabResultValue}
        labResultUnit={labResultUnit}
        setLabResultUnit={setLabResultUnit}
        labResultStatus={labResultStatus}
        setLabResultStatus={setLabResultStatus}
        labResultNotes={labResultNotes}
        setLabResultNotes={setLabResultNotes}
        onSubmit={handleSubmitLabResult}
      />

      <FinishConsultationModal
        open={openFinishModal}
        onClose={() => setOpenFinishModal(false)}
        message={finishModalMessage}
        onConfirm={handleConfirmFinishConsultation}
        hasPendingLabs={requestedLabTests.some(
          (test) => !submittedLabResults.some((res) => res.testName === test)
        )}
      />
    </Box>
  );
};

export default ConsultationPage;
