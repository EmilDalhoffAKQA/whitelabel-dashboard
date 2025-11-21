"use client";

import { useState, useRef, useEffect } from "react";
import { SketchPicker } from "react-color";

interface ColorPickerProps {
  color: string;
  onChange: (color: string) => void;
  label?: string;
  description?: string;
}

export function ColorPicker({
  color,
  onChange,
  label,
  description,
}: ColorPickerProps) {
  const [displayPicker, setDisplayPicker] = useState(false);
  const pickerRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLDivElement>(null);

  // Close picker when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        pickerRef.current &&
        !pickerRef.current.contains(event.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target as Node)
      ) {
        setDisplayPicker(false);
      }
    };

    if (displayPicker) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => {
        document.removeEventListener("mousedown", handleClickOutside);
      };
    }
  }, [displayPicker]);

  const handleClick = () => {
    setDisplayPicker(!displayPicker);
  };

  const handleChange = (newColor: any) => {
    // Ensure we return uppercase hex values so app stays consistent
    onChange(newColor.hex.toUpperCase());
  };

  return (
    <div>
      {label && (
        <label className="block text-sm font-semibold mb-2">{label}</label>
      )}
      <div className="relative">
        <div
          ref={buttonRef}
          className="flex items-center gap-2 border border-gray-300 rounded-lg p-2 bg-white cursor-pointer hover:border-gray-400 transition-colors"
          onClick={handleClick}
        >
          <div
            className="w-10 h-10 rounded border border-gray-300 cursor-pointer"
            style={{ backgroundColor: color }}
          />
          <input
            type="text"
            value={color}
            onChange={(e) => onChange(e.target.value.toUpperCase())}
            onClick={(e) => e.stopPropagation()}
            placeholder="#000000"
            className="flex-1 !border-0 !shadow-none focus-visible:!ring-0 focus-visible:!ring-offset-0 uppercase outline-none"
          />
        </div>

        {displayPicker && (
          <div
            ref={pickerRef}
            className="absolute z-50 mt-2"
            style={{
              left: 0,
              top: "100%",
            }}
          >
            <SketchPicker
              color={color}
              onChange={handleChange}
              onChangeComplete={handleChange}
              disableAlpha={false}
              presetColors={[
                "#D0021B",
                "#F5A623",
                "#F8E71C",
                "#8B572A",
                "#7ED321",
                "#417505",
                "#BD10E0",
                "#9013FE",
                "#4A90E2",
                "#50E3C2",
                "#B8E986",
                "#000000",
                "#4A4A4A",
                "#9B9B9B",
                "#FFFFFF",
                "#3b82f6",
                "#8b5cf6",
                "#ec4899",
                "#10b981",
              ]}
            />
          </div>
        )}
      </div>
      {description && (
        <p className="text-xs text-gray-500 mt-2">{description}</p>
      )}
    </div>
  );
}

export default ColorPicker;
