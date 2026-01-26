import React, {
  createContext,
  useState,
  useEffect,
  useContext,
  useMemo,
} from "react";
import { useSelector } from "react-redux";
import BiztrackLogo from "../../assets/Logos/biztrack-logo.png";

const ThemeContext = createContext(null);

// Default colors
const DEFAULT_COLORS = {
  primary: "#edb211ff",
  success: "#22c55e",
  warning: "#f59e0b",
  error: "#ef4444",
  secondary: "#64748b",
};

// Default theme
const DEFAULT_THEME = {
  primaryColor: "#edb211ff",
  logoUrl: BiztrackLogo,
  businessType: "general",
  businessName: "Business",
  colors: DEFAULT_COLORS,
};

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState(DEFAULT_THEME);

  // 🔑 Redux auth state (contains { user, token })
  const authValue = useSelector((state) => state.auth?.value);

  useEffect(() => {

    const loadBusinessTheme = () => {
      // 1️⃣ No auth → default theme
      if (!authValue) {
        return DEFAULT_THEME;
      }

      // 2️⃣ Normalize auth shape
      let parsedAuth = authValue;

      if (typeof authValue === "string") {
        try {
          parsedAuth = JSON.parse(authValue);
        } catch (error) {
          return DEFAULT_THEME;
        }
      }

      // 🔥 CRITICAL FIX: normalize user object
      const user =
        parsedAuth?.user && typeof parsedAuth.user === "object"
          ? parsedAuth.user
          : parsedAuth;


      if (!user || typeof user !== "object") {
        return DEFAULT_THEME;
      }

      // 3️⃣ Extract primary color
      const primaryColor =
        user.primaryColor ||
        user.businessPrimaryColor ||
        DEFAULT_THEME.primaryColor;

      // 4️⃣ Extract business info
      const businessType = (user.businessType || "general").toLowerCase();
      const businessName = user.businessName || "Business";

      // 5️⃣ Extract logo (uploaded OR default)
      const possibleLogos = [
        user.logo,
        user.businessLogo,
        user.logoUrl,
        user.business?.logo,
        user.business?.logoUrl,
      ];


      let logoUrl = BiztrackLogo;

      for (const logo of possibleLogos) {
        if (typeof logo === "string" && logo.trim() !== "") {
          logoUrl = logo;
          break;
        }
      }

      const computedTheme = {
        primaryColor,
        logoUrl,
        businessType,
        businessName,
        colors: {
          primary: primaryColor,
          success: DEFAULT_COLORS.success,
          warning: DEFAULT_COLORS.warning,
          error: DEFAULT_COLORS.error,
          secondary: DEFAULT_COLORS.secondary,
        },
      };
      return computedTheme;
    };

    const businessTheme = loadBusinessTheme();
    setTheme(businessTheme);

  }, [authValue]);

  // 6️⃣ Apply CSS variables
  useEffect(() => {
    const root = document.documentElement;

    root.style.setProperty(
      "--primary-color",
      theme.primaryColor || DEFAULT_THEME.primaryColor
    );
    root.style.setProperty("--color-success", theme.colors.success);
    root.style.setProperty("--color-warning", theme.colors.warning);
    root.style.setProperty("--color-error", theme.colors.error);
    root.style.setProperty("--color-secondary", theme.colors.secondary);

  }, [theme]);

  // 7️⃣ Safe exposed context
  const safeTheme = useMemo(() => {
    return {
      primaryColor: theme.primaryColor || DEFAULT_THEME.primaryColor,
      logoUrl: theme.logoUrl || DEFAULT_THEME.logoUrl,
      businessType: theme.businessType || DEFAULT_THEME.businessType,
      businessName: theme.businessName || DEFAULT_THEME.businessName,
      colors: theme.colors || DEFAULT_COLORS,
    };
  }, [theme]);

  return (
    <ThemeContext.Provider value={safeTheme}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within ThemeProvider");
  }
  return context;
};
