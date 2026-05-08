// App.jsx
import React, { useState, useEffect, Suspense } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from "react-router-dom";
import { Provider, useDispatch, useSelector } from "react-redux";
import Cookies from "js-cookie";
import { store, authActions } from "./store";

import { ThemeProvider } from "./components/theme/ThemeContext";
import MainLayout from "./layout";
import AppRoutes from "./components/AppRoutes";
import ContentLoader from "./components/Loader/ContentLoader";
import { useIdleTimeout } from "./hooks/useIdleTimeout";

import Login from "./views/sign-in/Login";
import ForgotPassword from "./views/sign-in/ForgotPassword";
import OTPInput from "./views/sign-in/ForgotPassword/OTPInput";
import NotFound from "./components/notfound";
import Unauthorized from "./components/notfound/Unauthorized";

import { routes } from "./config/routes";

// Error Boundary Component
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error("App Error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-red-600 mb-4">Something went wrong</h1>
            <p className="mb-4">Please refresh the page or try again later.</p>
            <button 
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Refresh Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// ---------------------------------------------------
// Protected layout that includes MainLayout + Sidebar
// ---------------------------------------------------
const ThemedMainLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);
  const dispatch = useDispatch();
  const authState = useSelector((state) => state.auth.value);
  useIdleTimeout();

  // Load user from localStorage if Redux is empty
  useEffect(() => {
    const loadUser = async () => {
      try {
        if (!authState) {
          // Try localStorage first
          const userData = localStorage.getItem("user");
          if (userData) {
            const parsedUser = JSON.parse(userData);
            const cleanUser = parsedUser._doc || parsedUser;
            dispatch(authActions.setAuth(cleanUser));
            
            // Also set cookie for consistency
            Cookies.set("user", JSON.stringify(cleanUser), { expires: 7 });
          }
        }
      } catch (error) {
        console.error("Error loading user:", error);
        // Clear invalid data
        localStorage.removeItem("user");
        Cookies.remove("user");
        dispatch(authActions.setAuth(null));
      } finally {
        setIsLoadingAuth(false);
      }
    };

    loadUser();
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
    return <Navigate to="/login" replace />;
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
    <ErrorBoundary>
      <Provider store={store}>
        <ThemeProvider>
          <Router>
            <Suspense fallback={
              <div className="min-h-screen flex items-center justify-center">
                <ContentLoader
                  state={true}
                  loading={true}
                  loadingText="Loading..."
                  loadedText=""
                  color="primary"
                />
              </div>
            }>
              <Routes>
                {/* Public Routes */}
                <Route path="/" element={<Navigate to="/login" replace />} />
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
                        path={route.path}
                        element={
                          <AppRoutes allowedRoles={route.allowedRoles}>
                            {route.element}
                          </AppRoutes>
                        }
                      />
                    ))}
                </Route>

                {/* Catch-all route - IMPORTANT for Netlify */}
                <Route path="*" element={<Navigate to="/login" replace />} />
              </Routes>
            </Suspense>
          </Router>
        </ThemeProvider>
      </Provider>
    </ErrorBoundary>
  );
};

export default App;