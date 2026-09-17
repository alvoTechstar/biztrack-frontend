import React from "react";
import Logo from "./Logo";

export default function Footer() {
  return (
    <footer className="w-full h-12 bg-white border-t border-gray-100 flex items-center justify-between px-6 shrink-0">
      <span className="text-gray-500 font-[Averta-Bolder] text-sm">
        Powered by
      </span>
      <div className="flex items-center">
        <Logo />
      </div>
    </footer>
  );
}
