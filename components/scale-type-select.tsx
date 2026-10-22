// components/scale-type-select.tsx
"use client";

import { useEffect } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";

import {
  SCALE_TYPE_BY_CATEGORY,
  ScaleCategory
} from "@/data/utilities";

import { ScaleType } from "@/lib/database/models/scales_product";

interface ScaleTypeSelectProps {
  category?: ScaleCategory;
  value?: ScaleType;
  onChange: (value: ScaleType | undefined) => void;
  disabled?: boolean;
}

export function ScaleTypeSelect({
  category,
  value,
  onChange,
  disabled
}: ScaleTypeSelectProps) {
  const options = category
    ? SCALE_TYPE_BY_CATEGORY[category] ?? []
    : [];

  // Reset value if category changes and value is invalid
  useEffect(() => {
    if (value && !options.includes(value)) {
      onChange(undefined);
    }
  }, [category]);

  return (
    <Select
      value={value ?? ""}
      onValueChange={v =>
        onChange(v as ScaleType)
      }
      disabled={disabled || !category}
    >
      <SelectTrigger>
        <SelectValue
          placeholder={
            category
              ? "Select scale type"
              : "Select category first"
          }
        />
      </SelectTrigger>

      <SelectContent>
        {options.map(type => (
          <SelectItem key={type} value={type}>
            {type}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
