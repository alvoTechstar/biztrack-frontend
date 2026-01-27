import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import PasswordInput from "../../components/Input/PasswordInput"
import FormButton from "../../components/buttons/FormButton";
import NaviButton from "../../components/buttons/Navibutton";
import loginBg from "../../assets/Backgrounds/background.png";
import { validateEmail, validatePassword } from "../../utilities/Sharedfunctions.jsx"; 
import { useDispatch } from "react-redux";
import { authActions } from "../../store";
import ModalFooter from "../../components/footer/ModalFooter";
import { useTheme } from "../../components/theme/ThemeContext";
import Toaster from "../../components/Toaster";
import axios from "axios";
import OTPInput from "./ForgotPassword/OTPInput";
import URLS from "../../utilities/Endpoints";
import TextInput from "../../components/Input/TextInput";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [otp, setOTP] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingResend, setLoadingResend] = useState(false);
  const [isValid, setIsValid] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [view, setView] = useState(0);

  const [toastOpen, setToastOpen] = useState(false);
  const [toastState, setToastState] = useState("true");
  const [toastTitle, setToastTitle] = useState("");
  const [toastMessage, setToastMessage] = useState("");

  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { primaryColor: PrimaryColor } = useTheme();

  useEffect(() => {
    const valid =
      validateEmail(email) &&
      validatePassword("length", password) &&
      validatePassword("uppercase", password) &&
      validatePassword("number", password) &&
      validatePassword("characters", password);
    setIsValid(valid);
  }, [email, password]);

  const showToaster = (state, title, message) => {
    setToastState(state);
    setToastTitle(title);
    setToastMessage(message);
    setToastOpen(true);
  };

  const handleInput = (e) => {
    const { id, value } = e.target;
    if (id === "email") setEmail(value);
    else if (id === "password") setPassword(value);
    else if (id === "code") setOTP(value);
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage("");

    try {
      const response = await axios.post(`${URLS.TAG_BASE_URL}${URLS.AUTH.LOGIN}`, {
        email: email,
        password: password
      });
      if (response.data.success) {
        showToaster("true", "Login Successful", "OTP sent to your email");
        setView(1);
      }
    } catch (error) {
      console.error("❌ Login error:", {
        status: error.response?.status,
        data: error.response?.data,
        message: error.message
      });

      const errorMsg = error.response?.data?.message || "Login failed";
      setErrorMessage(errorMsg);
      showToaster("false", "Login Failed", errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const getDashboardRoute = (role) => {
    const roleMap = {
      "Kiosk_Admin": "/dashboard/kiosk",
      "Hotel_Admin": "/dashboard/hotel-admin",
      "Hospital_Admin": "/dashboard/hospital-admin",
      "Super_Admin": "/dashboard/super-admin",
      "Kiosk_Shopkeeper": "/shopkeeper/sales",
      "Hotel_Cashier": "/dashboard/cashier",
      "Hotel_Waiter": "/dashboard/waiter",
      "Hospital_Receptionist": "/patient/queue",
      "Hospital_Doctor": "/dashboard/doctor",
      "Hospital_Nurse": "/dashboard/nurse",
      "Hospital_Pharmacist": "/pharmacy/stock"
    };
    return roleMap[role] || "/unauthorized";
  };

  const handleValidateOTP = async () => {
    if (otp.length !== 6) {
      showToaster("false", "Invalid OTP", "Please enter a 6-digit OTP");
      return;
    }

    setLoading(true);

    try {
      const response = await axios.post(`${URLS.TAG_BASE_URL}${URLS.AUTH.VERIFY_OTP}`, {
        email: email,
        otp: otp
      });
      if (response.data.success) {
        showToaster("true", "Success", "Login successful!");
        let userData = response.data.user;
        const token = response.data.token;
        if (userData && (userData.$__ || userData._doc)) {
          userData = userData._doc || userData;
        }

        if (!userData || !userData.role) {
          showToaster("false", "Login Error", "Invalid user data received");
          return;
        }
        localStorage.setItem("token", token);
        
        // Set cookie using document.cookie
        const expires = new Date();
        expires.setDate(expires.getDate() + 7); // 7 days from now
        document.cookie = `token=${token}; expires=${expires.toUTCString()}; path=/`;
        
        localStorage.setItem("user", JSON.stringify(userData));
        dispatch(authActions.setAuth(userData));
        const dashboardRoute = getDashboardRoute(userData.role);

        setTimeout(() => {
          navigate(dashboardRoute);
        }, 1500);
      }
    } catch (error) {
      console.error("❌ OTP verification error:", error);
      const errorMsg = error.response?.data?.message || "OTP verification failed";
      showToaster("false", "Verification Failed", errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = async () => {
    setLoadingResend(true);
    try {
      await axios.post(`${URLS.TAG_BASE_URL}${URLS.AUTH.RESEND_OTP}`, { email });
      showToaster("true", "Success", "A new OTP has been sent to your email.");
    } catch (error) {
      const errorMsg = error.response?.data?.message || "Failed to resend OTP";
      showToaster("false", "Error", errorMsg);
    } finally {
      setLoadingResend(false);
    }
  };

  const handleBackToLogin = () => {
    setView(0);
    setOTP("");
    setErrorMessage("");
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-2 bg-gray-100 relative">
      <Toaster
        open={toastOpen}
        state={toastState}
        title={toastTitle}
        message={toastMessage}
        action={setToastOpen}
        position="right"
      />
      <div className="flex items-center justify-center p-6 relative z-10">
        <div className="bg-white p-8 rounded-xl shadow-md border border-gray-300 w-full max-w-md mt-3">
          {view === 0 && (
            <>
              <h2 className="text-xl font-semibold mb-1 text-left">
                BizTrack Application
              </h2>
              <h1 className="text-3xl font-bold text-gray-700 mb-3 mt-3 text-left">
                Hello, Welcome
              </h1>
              <p className="text-sm text-gray-600 mb-6 text-left">
                Enter credentials to login
              </p>

              <form onSubmit={handleLogin}>
                <TextInput
                  id="email"
                  label="Email"
                  placeholder="Enter your email"
                  autoComplete="username"
                  input={email}
                  handleInput={handleInput}
                  error={email !== "" && !validateEmail(email)}
                  errorMessage="Please enter a valid email address."
                />

                <PasswordInput
                  id="password"
                  label="Password"
                  placeholder="Enter your password"
                  autoComplete="current-password"
                  value={password}
                  onChange={handleInput}
                  error={password !== "" && !isValid}
                  errorMessage="Password must be at least 7 characters, contain uppercase, number, and symbol."
                />

                {errorMessage && (
                  <div className="text-red-600 text-sm mb-3">{errorMessage}</div>
                )}

                <div className="mt-10 mb-2">
                  <FormButton
                    text="Login"
                    color={PrimaryColor}
                    isLoading={loading}
                    validation={isValid}
                    type="submit"
                  />
                </div>

                <div className="mt-3 mb-4 text-right">
                  <NaviButton
                    text="Forgot Password?"
                    alignment="right"
                    action={() => navigate("/reset-password")}
                  />
                </div>
              </form>
            </>
          )}

          {view === 1 && (
            <OTPInput
              input={otp}
              value={otp}
              isLoading={loading}
              isLoadingResend={loadingResend}
              action={handleInput}
              buttonAction={handleValidateOTP}
              buttonAction2={handleResendOTP}
              back={handleBackToLogin}
            />
          )}

          <div className="mt-8 mb-2 text-center">
            <ModalFooter />
          </div>
        </div>
      </div>

      <div
        className="hidden lg:flex bg-cover bg-center h-full flex-col justify-end"
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

      <div
        className="lg:hidden sm:block absolute top-0 left-0 w-full h-full bg-cover bg-center"
        style={{
          backgroundImage: `url(${loginBg})`,
        }}
      ></div>
    </div>
  );
};

export default Login;