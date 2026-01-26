import React from "react";
import KeyRoundedIcon from "@mui/icons-material/KeyRounded";
import "./forgotPassword.css";
import TitleHeader from "../../../components/header/TitleHeader";
import TextInput from "../../../components/Input/TextInput";
import { validateEmail } from "../../../utilities/Sharedfunctions";
import FormButton from "../../../components/buttons/FormButton";
import TextButton from "../../../components/buttons/TextButton";

export default function OTPRequest({
  input,
  action,
  isLoading,
  buttonAction,
  back,
}) {
  return (
    <div className="reset-form-container">
      <TitleHeader
        icon={<KeyRoundedIcon />}
        title={"Forgot Password?"}
        subtitle={"Enter your email for reset instructions"}
      />
      <div className="reset-form">
        <TextInput
          id={"email"}
          label={"Email"}
          placeholder={"Enter email"}
          input={input}
          handleInput={action}
          disabled={isLoading}
          error={input !== "" && !validateEmail(input)}
          errorMessage={"Invalid email"}
        />
        <FormButton
          text={"Reset Password"}
          isLoading={isLoading}
          validation={input && validateEmail(input)}
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