import React from "react";

interface AppSliderProps {
  open: boolean;
  children: React.ReactNode;
  /** Tailwind max-height class used while the content is expanded. */
  maxHeight?: string;
  className?: string;
}

export const AppSlider: React.FC<AppSliderProps> = ({
  open,
  children,
  maxHeight = "max-h-32",
  className = "",
}) => (
  <div
    className={`overflow-hidden transition-all duration-300 ease-in-out ${
      open ? `${maxHeight} opacity-100` : "max-h-0 opacity-0"
    } ${className}`}
  >
    {children}
  </div>
);
