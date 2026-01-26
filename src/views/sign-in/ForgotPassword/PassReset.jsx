import React from "react";
import "./forgotPassword.css";
import TitleHeader from "../../../components/Header/TitleHeader";
import FormButton from "../../../components/buttons/FormButton";
import LockRoundedIcon from "@mui/icons-material/LockRounded";
import TextButton from "../../../components/buttons/TextButton";
import PasswordResetInput from "../../../components/Input/PasswordResetInput";
import { validatePassword } from "../../../utilities/SharedFunctions";

export default function PassReset({
  input,
  input2,
  action,
  isLoading,
  buttonAction,
  back,
}) {
  const isPasswordValid = 
    input &&
    validatePassword("length", input) &&
    validatePassword("characters", input) &&
    validatePassword("uppercase", input) &&
    validatePassword("number", input);
  
  const isValid = isPasswordValid && input2 && input === input2;

  return (
    <div className="reset-form-container">
      <TitleHeader
        icon={<LockRoundedIcon />}
        title={"Set new password"}
        subtitle={"Your new password must be different from previous passwords"}
      />
      <div className="reset-form">
        <PasswordResetInput
          id={"password"}
          label={"New Password"}
          placeholder={"Enter password"}
          input={input}
          id2={"passwordConfirm"}
          label2={"Confirm Password"}
          placeholder2={"Confirm password"}
          input2={input2}
          handleInput={action}
          loading={isLoading}
        />
        <FormButton
          text={"Reset Password"}
          isLoading={isLoading}
          validation={isValid}
          action={buttonAction}
        />
      </div>
      <TextButton
        actionText={"Back to Login"}
        alignment={"center"}
        disabled={false}
        action={back}
      />
    </div>
  );
}