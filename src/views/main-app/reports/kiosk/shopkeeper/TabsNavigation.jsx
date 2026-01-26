import React from "react";

const TabsNavigation = ({ activeTab, setActiveTab }) => {
  const tabs = ["Sales Report", "Debt Report", "Product Summary"];

  return (
    <div className="bg-white rounded-lg shadow-md mb-6 border border-gray-200">
      <div className="border-b border-gray-200">
        <nav className="flex space-x-8 px-6">
          {tabs.map((tab, index) => (
            <button
              key={index}
              onClick={() => setActiveTab(index)}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === index
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              {tab}
            </button>
          ))}
        </nav>
      </div>
    </div>
  );
};

export default TabsNavigation;