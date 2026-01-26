import React from "react";
import Logo from "./Logo";

export default function Footer() {
  return (
    <footer className="fixed bottom-0 left-0 w-full h-12 bg-white z-50 flex items-center justify-between px-6 shadow-md">
      <span className="text-gray-700 font-[Averta-Bolder, sans-serif] text-sm">
        Powered by
      </span>
      <div className="flex items-center">
        <Logo />
      </div>
    </footer>
  );
}
