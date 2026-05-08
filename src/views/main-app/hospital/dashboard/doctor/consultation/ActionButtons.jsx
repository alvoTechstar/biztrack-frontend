import React from "react";
import AppFormButton from "../../../../../../components/buttons/AppFormButton";
import SaveIcon from "@mui/icons-material/Save";
import CancelIcon from "@mui/icons-material/Cancel";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";

const ActionButtons = ({
  saveProgressStatus,
  handleSaveProgress,
  handleFinishConsultation,
  onCancelConsultation,
  disabledSave,
  disabledFinish,
  disabledCancel,
}) => {
  return (
    // Removed sticky bottom-0 z-10
    <div className="flex justify-between items-center p-4 bg-white border-t border-gray-200 m-20">
      {/* Left button: Save Progress */}
      <div className="flex-1 mr-2">
        <AppFormButton
          text={saveProgressStatus ? "Saving..." : "Save Progress"}
          color="#1976d2"
          isLoading={saveProgressStatus}
          validation={!disabledSave}
          action={handleSaveProgress}
          icon={<SaveIcon />}
        />
      </div>

      {/* Center button: Cancel */}
      <div className="flex-1 mx-2">
        <AppFormButton
          text="Cancel Consultation"
          color="invert"
          validation={!disabledCancel}
          action={onCancelConsultation}
          icon={<CancelIcon />}
        />
      </div>

      {/* Right button: Finish Consultation */}
      <div className="flex-1 ml-2">
        <AppFormButton
          text="Finish Consultation"
          color="#28a745"
          validation={!disabledFinish}
          action={handleFinishConsultation}
          icon={<CheckCircleOutlineIcon />}
        />
      </div>
    </div>
  );
};

export default ActionButtons;
