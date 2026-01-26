// components/modal/ModalFooter.jsx
import React from 'react';
import iswLogo from "../../assets/Logos/isw.png";

const ModalFooter = ({ children }) => (
  <div className="bg-white">
    {/* Divider */}

    {/* Powered by + logo, centered, with a bit of top/bottom padding */}
    <div className="flex items-center justify-center space-x-2 py-2 mb-3">
      <span className="text-gray-700 font-averta text-sm leading-none">
        Powered by
      </span>
      <img
        src={iswLogo}
        alt="ISW Logo"
        className="h-5 align-middle object-contain"
      />
    </div>

    {/* Render whatever you passed as `footer` centered */}
    {children && (
      <div className="text-center px-4 pb-4">
        {children}
      </div>
    )}
  </div>
);

export default ModalFooter;
