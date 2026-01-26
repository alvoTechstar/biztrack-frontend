// App.jsx
import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from "react-router-dom";
import { Provider, useDispatch, useSelector } from "react-redux";
import Cookies from "js-cookie";
import { store, authActions } from "./store";

import { ThemeProvider } from "./components/theme/ThemeContext";
import MainLayout from "./layout";
import AppRoutes from "./components/AppRoutes";
import ContentLoader from "./components/Loader/ContentLoader";

import Login from "./views/sign-in/Login";
import ForgotPassword from "./views/sign-in/ForgotPassword";
import OTPInput from "./views/sign-in/ForgotPassword/OTPInput";
import NotFound from "./components/notfound";
import Unauthorized from "./components/notfound/Unauthorized";

import { routes } from "./config/routes";

// ---------------------------------------------------
// Protected layout that includes MainLayout + Sidebar
// ---------------------------------------------------
const ThemedMainLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);
  const dispatch = useDispatch();
  const authState = useSelector((state) => state.auth.value);

  // Load user from cookie if Redux is empty
  useEffect(() => {
    if (!authState) {
      const userCookie = Cookies.get("user");
      if (userCookie) {
        try {
          const parsedUser = JSON.parse(userCookie);
          const cleanUser = parsedUser._doc || parsedUser;
          dispatch(authActions.setAuth(cleanUser));
        } catch (e) {
          console.error("Error parsing user from cookie:", e);
          Cookies.remove("user");
          dispatch(authActions.setAuth(null));
        }
      }
    }
    setIsLoadingAuth(false);
  }, [authState, dispatch]);

  if (isLoadingAuth) {
    return (
      <div className="min-h-screen bg-white p-8">
        <div className="max-w-7xl mx-auto">
          <ContentLoader
            state={true}
            loading={true}
            loadingText="Loading application..."
            loadedText=""
            color="primary"
          />
        </div>
      </div>
    );
  }

  if (!authState) {
    return <Navigate to="/login" replace />; // Redirect to /login if not authenticated
  }

  return (
    <MainLayout
      sidebarOpen={sidebarOpen}
      toggleSidebar={() => setSidebarOpen(!sidebarOpen)}
    >
      <Outlet />
    </MainLayout>
  );
};

// ------------------------
// Main App Component
// ------------------------
const App = () => {
  return (
    <Provider store={store}>
      <ThemeProvider>
        <Router>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Navigate to="/login" replace />} /> {/* Redirect / to /login */}
            <Route path="/login" element={<Login />} />
            <Route path="/reset-password" element={<ForgotPassword />} />
            <Route path="/otp" element={<OTPInput />} />
            <Route path="/unauthorized" element={<Unauthorized />} />
            <Route path="/not-found" element={<NotFound />} />

            {/* Protected Routes */}
            <Route element={<ThemedMainLayout />}>
              {routes
                .filter((route) => route.isPrivate)
                .map((route) => (
                  <Route
                    key={route.path}
                    path={route.path.startsWith("/") ? route.path.substring(1) : route.path}
                    element={
                      <AppRoutes allowedRoles={route.allowedRoles}>
                        {route.element}
                      </AppRoutes>
                    }
                  />
                ))}
            </Route>

            {/* Catch-all */}
            {/* <Route path="*" element={<Navigate to="/not-found" replace />} /> */}
          </Routes>
        </Router>
      </ThemeProvider>
    </Provider>
  );
};

export default App;