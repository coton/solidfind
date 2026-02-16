"use client";

import { useState, useRef, useEffect } from "react";

const sortOptions = [
  { value: "latest", label: "Sort by: Latest" },
  { value: "ranking", label: "Sort by Ranking" },
  { value: "favorites", label: "Sort by: Favorites" },
  { value: "team-smallest", label: "Team size: Smallest first" },
  { value: "team-largest", label: "Team size: Largest first" },
  { value: "projects-few", label: "Projects: Few > More" },
  { value: "projects-more", label: "Projects: More > Few" },
];

interface SortDropdownProps {
  value: string;
  onChange: (value: string) => void;
}

export function SortDropdown({ value, onChange }: SortDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const selectedOption = sortOptions.find((opt) => opt.value === value) || sortOptions[0];

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setIsOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div ref={ref} className="relative">
      {/* Trigger */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-[6px] text-[11px] font-medium text-[#333] tracking-[0.22px] leading-[14px] text-right hover:opacity-70 transition-opacity cursor-pointer"
      >
        {selectedOption.label}
        {/* Down arrow from Figma — 6x4 */}
        <svg 
          width="6" 
          height="4" 
          viewBox="0 0 6 4" 
          fill="none" 
          xmlns="http://www.w3.org/2000/svg"
          className={`transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
        >
          <path d="M3 4L0 0h6L3 4z" fill="#f14110"/>
        </svg>
      </button>

      {/* Dropdown with smooth animation */}
      <div 
        className={`
          absolute top-[20px] right-0 w-[170px] bg-white rounded-[6px] shadow-md z-50 py-[10px] px-[9px]
          transition-all duration-200 ease-out origin-top-right
          ${isOpen 
            ? 'opacity-100 scale-100 pointer-events-auto' 
            : 'opacity-0 scale-95 pointer-events-none'
          }
        `}
      >
        <div className="flex flex-col gap-[10px]">
          {sortOptions.map((option, idx) => (
            <div key={option.value}>
              <button
                onClick={() => { onChange(option.value); setIsOpen(false); }}
                className={`w-full text-right text-[11px] font-medium tracking-[0.22px] leading-[14px] transition-colors cursor-pointer ${
                  value === option.value ? 'text-[#f14110]' : 'text-[#333]'
                } hover:text-[#f14110]`}
              >
                {option.label}
              </button>
              {idx < sortOptions.length - 1 && (
                <div className="w-full h-[1px] bg-[#e4e4e4] mt-[10px]" />
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
