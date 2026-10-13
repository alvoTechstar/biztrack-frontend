import React, { useMemo } from "react";
import { useSelector } from "react-redux";
import { Link, useLocation } from "react-router-dom";
import { MENU } from "../../config/Menu";
import { useTheme } from "../theme/ThemeContext";
import { normalizeRole } from "../../utilities/Sharedfunctions.jsx";

const Sidebar = ({ isOpen, toggleSidebar }) => {
  const user = useSelector((state) => state.auth.value);
  const location = useLocation();
  const { primaryColor } = useTheme();


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
          className="fixed inset-x-0 top-16 bottom-0 z-20 lg:hidden"
          onClick={toggleSidebar}
          style={{
            backdropFilter: "blur(2px)",
            backgroundColor: "rgba(92, 91, 91, 0.1)",
          }}
        />
      )}

      <aside
        className={`fixed left-0 top-16 bottom-0 w-60 bg-white border-r border-gray-100 shadow-sm z-30 flex flex-col transform transition-transform duration-300 ease-in-out
        lg:translate-x-0 lg:static ${isOpen ? "translate-x-0" : "-translate-x-full"}`}
      >
      {/* No header row here — the sidebar starts directly with the menu.
          On mobile it closes via the backdrop or tapping a menu item. */}
        <nav className="px-3 py-4 flex-1 overflow-y-auto">
          <ul className="space-y-1">
            {allowedMenuItems.map((item) => {
              const isActive = location.pathname === item.path
                || location.pathname.startsWith(`${item.path}/`);

              return (
                <li key={item.key}>
                  <Link
                    to={item.path}
                    onClick={handleItemClick}
                    className="relative flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors hover:bg-gray-50"
                    style={{
                      backgroundColor: isActive ? `${primaryColor}15` : undefined,
                      color: isActive ? primaryColor : "#4B5563",
                    }}
                  >
                    {isActive && (
                      <span
                        className="absolute left-0 inset-y-0 w-1 rounded-r-full"
                        style={{ backgroundColor: primaryColor }}
                      />
                    )}
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