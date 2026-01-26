import React, { useState, useEffect, useCallback } from "react";
import Modal from "../../../components/modal/Modal";
import PasswordInput from "../../../components/input/PasswordInput";
import AppFormButton from "../../../components/buttons/AppFormButton";
import { validatePassword } from "../../../utilities/SharedFunctions"; 
import { useTheme } from "../../../components/theme/ThemeContext";

const ChangePassword = ({
  open,
  onClose,
  onPasswordChange,
  currentPassword: initialCurrentPassword = "",
}) => {
  const [currentPassword, setCurrentPassword] = useState(initialCurrentPassword);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [passwordValidations, setPasswordValidations] = useState({
    length: false,
    uppercase: false,
    number: false,
    characters: false,
  });

  const { primaryColor: PrimaryColor } = useTheme();

  // Memoize the validation function
  const validateForm = useCallback(() => {
    const validations = {
      length: validatePassword("length", newPassword),
      uppercase: validatePassword("uppercase", newPassword),
      number: validatePassword("number", newPassword),
      characters: validatePassword("characters", newPassword),
    };
    return validations;
  }, [newPassword]);

  // Update validations only when passwords change
  useEffect(() => {
    if (newPassword) {
      setPasswordValidations(validateForm());
    }
  }, [newPassword, validateForm]);

  const handleSubmit = async () => {
    setErrorMsg("");

    if (!currentPassword || !newPassword || !confirmPassword) {
      setErrorMsg("All fields are required.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrorMsg("Passwords do not match.");
      return;
    }

    const isValid = Object.values(validateForm()).every(Boolean);
    if (!isValid) {
      setErrorMsg("Password doesn't meet requirements.");
      return;
    }

    setIsSubmitting(true);
    try {
      await onPasswordChange(currentPassword, newPassword);
      onClose();
    } catch (error) {
      setErrorMsg(error.message || "Failed to change password");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal isOpen={open} onClose={onClose} title="Change Password">
      <div className="p-4 space-y-4">
        <div className="space-y-4">
          <PasswordInput
            label="Current Password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            disabled={isSubmitting || !!initialCurrentPassword}
          />
          
          <PasswordInput
            label="New Password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            disabled={isSubmitting}
          />
          
          <PasswordInput
            label="Confirm New Password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            disabled={isSubmitting}
          />
        </div>

        {/* Password requirements below confirm password */}
        <div className="mt-2 text-xs text-gray-600 space-y-1">
          <p className={passwordValidations.length ? "text-green-500" : "text-gray-500"}>
            • At least 7 characters long
          </p>
          <p className={passwordValidations.uppercase ? "text-green-500" : "text-gray-500"}>
            • Contains uppercase letter
          </p>
          <p className={passwordValidations.number ? "text-green-500" : "text-gray-500"}>
            • Contains number
          </p>
          <p className={passwordValidations.characters ? "text-green-500" : "text-gray-500"}>
            • Contains special character
          </p>
        </div>

        {errorMsg && <p className="text-sm text-red-500">{errorMsg}</p>}

        <div className="flex justify-between pt-4 gap-4">
          <div className="w-1/2">
            <AppFormButton
              text="Cancel"
              onClick={onClose}
              color="invert"
              disabled={isSubmitting}
              validation={true}
            />
          </div>
          <div className="w-1/2 ">
            <AppFormButton
              text="Update"
              isLoading={isSubmitting}
              validation={
                !isSubmitting &&
                Object.values(passwordValidations).every(Boolean) &&
                newPassword === confirmPassword &&
                currentPassword
              }
              onClick={handleSubmit}
              color={PrimaryColor} // Example color - use your preferred color
            />
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default ChangePassword;