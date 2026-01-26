import React, { useMemo } from "react";
import { useSelector } from "react-redux";
import { Link, useLocation } from "react-router-dom";
import { MENU } from "../../config/Menu";
import { X } from "lucide-react";
import { useTheme } from "../theme/ThemeContext";
import { normalizeRole } from "../../utilities/SharedFunctions";
import URLS from "../../utilities/Endpoints";

const DEFAULT_LOGO = "http://localhost:3000/assets/biztrack-logo.png";
const BACKEND_URL = URLS.TAG_BASE_URL || "http://localhost:3000";

const Sidebar = ({ isOpen, toggleSidebar }) => {
  const user = useSelector((state) => state.auth.value);
  const location = useLocation();
  const { logoUrl, primaryColor } = useTheme();

  const displayLogo = useMemo(() => {
    const normalizeLogoUrl = (url) => {
      if (!url || typeof url !== 'string') return null;
      url = url.trim();
      if (url.startsWith('http://') || url.startsWith('https://')) {
        return url;
      }
      if (url.startsWith('/assets/logos/')) {
        return `${BACKEND_URL}${url}`;
      }
      if (url && url.includes('.')) {
        const cleanFilename = url.replace(/^\//, '');
        const hasExtension = /\.(jpg|jpeg|png|gif|svg|webp|bmp)$/i.test(cleanFilename);
        if (hasExtension) {
          return `${BACKEND_URL}/assets/logos/${cleanFilename}`;
        }
      }
      if (url.startsWith('/')) {
        return `${BACKEND_URL}${url}`;
      }
      return null;
    };
    if (user?.logo) {
      const normalizedUrl = normalizeLogoUrl(user.logo);
      if (normalizedUrl) {
        return normalizedUrl;
      }
    }
    if (user?.businessLogo) {
      const normalizedUrl = normalizeLogoUrl(user.businessLogo);
      if (normalizedUrl) {
        return normalizedUrl;
      }
    }
    if (logoUrl) {
      const normalizedUrl = normalizeLogoUrl(logoUrl);
      if (normalizedUrl) {
        return normalizedUrl;
      }
    }
    if (user?.logoUrl) {
      const normalizedUrl = normalizeLogoUrl(user.logoUrl);
      if (normalizedUrl) {
        return normalizedUrl;
      }
    }
    return DEFAULT_LOGO;
  }, [user?.logo, user?.businessLogo, user?.logoUrl, logoUrl]);


  const normalizedRole = useMemo(() => {
    return user?.role ? normalizeRole(user.role) : "";
  }, [user?.role]);
  const allowedMenuItems = useMemo(() => {
    if (!normalizedRole) return [];
    return MENU.filter((item) =>
      item.permissions.includes(normalizedRole)
    );
  }, [normalizedRole]);

  const handleItemClick = () => {
    if (isOpen && window.innerWidth < 1024) {
      toggleSidebar();
    }
  };

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 z-20 lg:hidden"
          onClick={toggleSidebar}
          style={{
            backdropFilter: "blur(2px)",
            backgroundColor: "rgba(92, 91, 91, 0.1)",
          }}
        />
      )}

      <aside
        className={`fixed top-0 left-0 h-full w-60 bg-white shadow-md z-30 transform transition-transform duration-300 ease-in-out
        lg:translate-x-0 lg:static ${isOpen ? "translate-x-0" : "-translate-x-full"}`}
      >
        <div className="flex items-center justify-between px-4 py-3 border-b lg:hidden">
          <img
            src={displayLogo}
            alt="Business Logo"
            className="h-8 w-auto object-contain max-w-full"
            onError={(e) => {
              console.error("❌ Image failed to load:", displayLogo);
              console.error("❌ User data for debugging:", {
                user: user,
                logoField: user?.logo,
                themeLogo: logoUrl,
                backendUrl: BACKEND_URL
              });
              e.currentTarget.onerror = null;
              e.currentTarget.src = DEFAULT_LOGO;
            }}
            onLoad={() => {
            }}
          />
          <button onClick={toggleSidebar}>
            <X size={24} />
          </button>
        </div>

        <div className="hidden lg:flex items-center justify-center py-4 border-b">
          <img
            src={displayLogo}
            alt="Business Logo"
            className="h-8 w-auto object-contain max-w-full"
            onError={(e) => {
              console.error("❌ Image failed to load:", displayLogo);
              e.currentTarget.onerror = null;
              e.currentTarget.src = DEFAULT_LOGO;
            }}
            onLoad={() => {
            }}
          />
        </div>
        <nav className="px-3 py-4">
          <ul className="space-y-1">
            {allowedMenuItems.map((item) => {
              const isActive = location.pathname === item.path;

              return (
                <li key={item.key}>
                  <Link
                    to={item.path}
                    onClick={handleItemClick}
                    className="flex items-center px-3 py-2 rounded-md text-sm font-medium transition"
                    style={{
                      backgroundColor: isActive ? `${primaryColor}15` : undefined,
                      color: isActive ? primaryColor : "#4B5563",
                    }}
                  >
                    <span className="mr-3">{item.icon}</span>
                    {item.title}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
      </aside>
    </>
  );
};

export default Sidebar;