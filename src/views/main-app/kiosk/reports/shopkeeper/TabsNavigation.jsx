import React from "react";
import { useTheme } from "../../../../../components/theme/ThemeContext";

const TabsNavigation = ({ activeTab, setActiveTab }) => {
  const { primaryColor } = useTheme();
  const tabs = ["Sales Report", "Debt Report", "Product Summary"];

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
      <nav className="flex overflow-x-auto px-4 sm:px-6">
        {tabs.map((tab, index) => (
          <button
            key={index}
            onClick={() => setActiveTab(index)}
            style={{
              borderBottomColor: activeTab === index ? primaryColor : 'transparent',
              color: activeTab === index ? primaryColor : '#6B7280',
            }}
            className="py-4 px-1 mr-6 last:mr-0 border-b-2 font-medium text-sm whitespace-nowrap transition-colors hover:text-gray-700"
          >
            {tab}
          </button>
        ))}
      </nav>
    </div>
  );
};

export default TabsNavigation;
