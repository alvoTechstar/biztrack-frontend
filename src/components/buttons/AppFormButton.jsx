import React from "react";

export default function AppFormButton({
  text,
  color,
  isLoading,
  validation,
  action,
  icon,
}) {
  return (
    <button
      type="button"
      className={`w-full rounded-lg flex items-center justify-center gap-2 h-[42px] px-6 py-4 text-sm font-semibold transition-all
        ${color === "invert" 
          ? "bg-white text-gray-800 border border-gray-400" 
          : "text-white"} 
        ${isLoading || !validation ? "cursor-not-allowed" : "cursor-pointer"}`}
      style={color !== "invert" ? { backgroundColor: color } : {}}
      disabled={!!(isLoading || !validation)}
      onClick={() => action()}
    >
      {icon && <span className="text-inherit flex items-center ">{React.cloneElement(icon, { fontSize: "small" })}</span>}
      <span>{text}</span>
    </button>
  );
}
