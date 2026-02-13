"use client";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ChevronDown } from "lucide-react";

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
  const selectedOption = sortOptions.find((opt) => opt.value === value) || sortOptions[0];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
        {selectedOption.label}
        <ChevronDown className="w-4 h-4 text-orange-500" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        {sortOptions.map((option) => (
          <DropdownMenuItem
            key={option.value}
            onClick={() => onChange(option.value)}
            className={value === option.value ? "bg-orange-50 text-orange-600" : ""}
          >
            {option.label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
