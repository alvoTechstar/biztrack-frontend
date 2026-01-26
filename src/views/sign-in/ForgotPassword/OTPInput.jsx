import React from "react";
import EmailRoundedIcon from "@mui/icons-material/EmailRounded";
import "./forgotPassword.css";
import TextInput from "../../../components/Input/TextInput";
import FormButton from "../../../components/buttons/FormButton";
import TextButton from "../../../components/buttons/TextButton";
import TitleHeader from "../../../components/Header/TitleHeader";

export default function OTPInput({
  input,
  action,
  isLoading,
  isLoadingResend,
  buttonAction,
  buttonAction2,
  back,
}) {
  return (
    <div className="reset-form-container">
      <div className="otp-content">
        <TitleHeader
          icon={<EmailRoundedIcon />}
          title={"Check your Email"}
          subtitle={
            "An OTP for verification has been sent to your email, it will expire in 15 minutes"
          }
        />
        <div className="otp-form">
          <div className="input-wrapper">
            <TextInput
              id={"code"}
              label={"Verification Code"}
              placeholder={"Enter 6-digit code"}
              input={input}
              handleInput={action}
              disabled={isLoading}
            />
          </div>
          
          <div className="resend-section">
            <TextButton
              text={"Didn't receive the code? "}
              actionText={"Resend"}
              alignment={"center"}
              isLoading={isLoadingResend}
              action={buttonAction2}
            />
          </div>

          <div className="button-section">
            <FormButton
              text={"Verify Code"}
              isLoading={isLoading}
              validation={input}
              action={buttonAction}
              fullWidth
            />
          </div>
        </div>
        
        <div className="back-section">
          <TextButton
            actionText={"Back to Login"}
            alignment={"center"}
            action={back}
          />
        </div>
      </div>
    </div>
  );
}