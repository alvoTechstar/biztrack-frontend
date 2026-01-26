import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./forgotPassword.css";
import OTPRequest from "./OTPRequest";
import OTPInput from "./OTPInput";
import PassReset from "./PassReset";
import Toaster from "../../../components/Toaster";
import axios from "axios";
import URLS from "../../../utilities/Endpoints";
import loginBg from "../../../assets/Backgrounds/background.png";
import ModalFooter from "../../../components/footer/ModalFooter";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [otp, setOTP] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [resetToken, setResetToken] = useState("");
  const [showToaster, setShowToaster] = useState(false);
  const [toasterState, setToasterState] = useState("");
  const [toasterTitle, setToasterTitle] = useState("");
  const [toasterMessage, setToasterMessage] = useState("");
  const [view, setView] = useState(0); 
  const [loading, setLoading] = useState(false);
  const [loadingOTP, setLoadingOTP] = useState(false);

  const navigate = useNavigate();

  const handleInput = (e) => {
    const { id, value } = e.target;
    
    switch (id) {
      case "email":
        setEmail(value);
        break;
      case "code":
        setOTP(value);
        break;
      case "password":
        setPassword(value);
        break;
      case "passwordConfirm":
        setPasswordConfirm(value);
        break;
      default:
        break;
    }
  };

  const handleToaster = (state, title, message) => {
    setShowToaster(true);
    setToasterState(state);
    setToasterTitle(title);
    setToasterMessage(message);
  };

  const handleSendOTP = async () => {
    if (!email) {
      handleToaster("false", "Error", "Please enter your email");
      return;
    }

    setLoading(true);

    try {
      const response = await axios.post(`${URLS.TAG_BASE_URL}${URLS.AUTH.FORGOT_PASSWORD}`, {
        email: email
      });
      if (response.data.success) {
        handleToaster("true", "Success", "OTP sent to your email");
        setTimeout(() => {
          setView(1);
          setLoading(false);
        }, 2000);
      }
    } catch (error) {
      console.error("❌ Forgot password error:", error.response?.data);
      const errorMsg = error.response?.data?.message || "Failed to send OTP";
      handleToaster("false", "Error", errorMsg);
      setLoading(false);
    }
  };

  const handleValidateOTP = async () => {
    if (otp.length !== 6) {
      handleToaster("false", "Invalid OTP", "Please enter a 6-digit OTP");
      return;
    }
  
    setLoading(true);
  
    try {
      const response = await axios.post(`${URLS.TAG_BASE_URL}${URLS.AUTH.VERIFY_RESET_OTP}`, {
        email: email,
        otp: otp
      });  
      if (response.data.success) {
        handleToaster("true", "Success", "OTP verified successfully");
        setResetToken(response.data.resetToken);
        setTimeout(() => {
          setView(2);
          setLoading(false);
        }, 2000);
      }
    } catch (error) {
      console.error("❌ OTP verification error:", error.response?.data);
      const errorMsg = error.response?.data?.message || "OTP verification failed";
      handleToaster("false", "Verification Failed", errorMsg);
      setLoading(false);
    }
  };

  const handleResetPassword = async () => {
    if (password !== passwordConfirm) {
      handleToaster("false", "Error", "Passwords do not match");
      return;
    }

    if (password.length < 7) {
      handleToaster("false", "Error", "Password must be at least 7 characters");
      return;
    }

    // Check password requirements (same as login)
    const hasUppercase = /[A-Z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

    if (!hasUppercase || !hasNumber || !hasSpecialChar) {
      handleToaster("false", "Error", "Password must contain uppercase, number, and special character");
      return;
    }

    setLoading(true);

    try {
      const response = await axios.post(`${URLS.TAG_BASE_URL}${URLS.AUTH.RESET_PASSWORD}`, {
        resetToken: resetToken,
        newPassword: password,
        confirmPassword: passwordConfirm
      });
      if (response.data.success) {
        handleToaster("true", "Success", "Password reset successfully! You can now login with your new password.");
        setTimeout(() => {
          navigate("/login");
        }, 3000);
      }
    } catch (error) {
      console.error("❌ Password reset error:", {
        status: error.response?.status,
        data: error.response?.data,
        message: error.message
      });
      const errorMsg = error.response?.data?.message || "Password reset failed";
      handleToaster("false", "Error", errorMsg);
      setLoading(false);
    }
  };

  const handleNavigation = () => {
    navigate("/login");
  };

  const handleResendOTP = async () => {
    setLoadingOTP(true);
    
    try {
      const response = await axios.post(`${URLS.TAG_BASE_URL}${URLS.AUTH.RESEND_RESET_OTP}`, {
        email: email
      });

      if (response.data.success) {
        handleToaster("true", "Success", "A new OTP has been sent to your email");
      }
    } catch (error) {
      const errorMsg = error.response?.data?.message || "Failed to resend OTP";
      handleToaster("false", "Error", errorMsg);
    } finally {
      setLoadingOTP(false);
    }
  };

  const handleBackFromOTP = () => {
    setView(0);
    setOTP("");
  };

  const handleView = (active) => {
    switch (active) {
      case 1:
        return (
          <OTPInput
            input={otp}
            value={otp}
            isLoading={loading}
            isLoadingResend={loadingOTP}
            action={handleInput}
            buttonAction={handleValidateOTP}
            buttonAction2={handleResendOTP}
            back={handleBackFromOTP}
          />
        );
      case 2:
        return (
          <PassReset
            input={password}
            input2={passwordConfirm}
            isLoading={loading}
            action={handleInput}
            buttonAction={handleResetPassword}
            back={handleNavigation}
          />
        );
      default:
        return (
          <OTPRequest
            input={email}
            isLoading={loading}
            action={handleInput}
            buttonAction={handleSendOTP}
            back={handleNavigation}
          />
        );
    }
  };

  return (
    <div className="min-h-screen w-full bg-gray-100 relative">
      <Toaster
        open={showToaster}
        state={toasterState}
        title={toasterTitle}
        message={toasterMessage}
        action={setShowToaster}
        position="right"
      />
      
      <div className="lg:hidden min-h-screen w-full relative">
        <div
          className="fixed inset-0 w-full h-full bg-cover bg-center z-0"
          style={{
            backgroundImage: `url(${loginBg})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            backgroundRepeat: "no-repeat"
          }}
        ></div>
        
        <div className="fixed inset-0 w-full h-full bg-black/20 z-5"></div>
        
        <div className="relative z-10 min-h-screen flex flex-col justify-center items-center p-4">
          <div className="w-full max-w-md bg-white/95 backdrop-blur-sm p-6 rounded-2xl shadow-xl border border-white/30 mt-4">
            <h2 className="text-xl sm:text-xl font-semibold mb-1 text-left">
              BizTrack Application
            </h2>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-4 mt-2 text-left">
              {view === 0 ? "Reset Password" : view === 1 ? "Verify OTP" : "Set New Password"}
            </h1>
            
            {handleView(view)}
            
            <div className="mt-8 mb-2 text-center">
              <ModalFooter />
            </div>
          </div>
        </div>
      </div>

      <div className="hidden lg:grid lg:grid-cols-2 min-h-screen">
        <div className="flex items-center justify-center p-8 relative z-10">
          <div className="bg-white p-8 rounded-xl shadow-md border border-gray-300 w-full max-w-md">
            <h2 className="text-xl font-semibold mb-1 text-left">
              BizTrack Application
            </h2>
            <h1 className="text-3xl font-bold text-gray-700 mb-6 mt-3 text-left">
              {view === 0 ? "Reset Password" : view === 1 ? "Verify OTP" : "Set New Password"}
            </h1>
            
            {handleView(view)}
            
            <div className="mt-8 mb-2 text-center">
              <ModalFooter />
            </div>
          </div>
        </div>

        <div
          className="bg-cover bg-center h-full flex flex-col justify-end"
          style={{
            backgroundImage: `url(${loginBg})`,
            borderTopLeftRadius: "40px",
            borderBottomLeftRadius: "40px",
          }}
        >
          <div className="bg-white p-6 rounded-xl shadow-md max-w-md mx-auto mb-10">
            <span className="text-[#111827] font-bold text-xl p-3">
              Empower Your Business: Track Profits, Minimize Losses, Maximize Growth
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}