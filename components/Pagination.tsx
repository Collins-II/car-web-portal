"use client";

import {
  IconChevronLeft,
  IconChevronRight,
  IconChevronsLeft,
  IconChevronsRight,
} from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface PaginationProps {
  page: number;
  pageSize: number;
  totalItems: number;
  pageSizes?: number[];
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
}

export function Pagination({
  page,
  pageSize,
  totalItems,
  pageSizes = [8, 12, 16, 24],
  onPageChange,
  onPageSizeChange,
}: PaginationProps) {
  const pageCount = Math.ceil(totalItems / pageSize);
  const canPrevious = page > 1;
  const canNext = page < pageCount;

  return (
    <div className="max-w-5xl mx-auto flex flex-col gap-4 md:flex-row md:items-center md:justify-center px-4 py-4 bg-white border-t border-gray-200">
      
      {/* Info */}
      <div className="hidden md:flex items-center gap-1 text-sm text-gray-500">
        Showing{" "}
        <span className="font-medium text-gray-900">
          {(page - 1) * pageSize + 1}
        </span>
        –
        <span className="font-medium text-gray-900">
          {Math.min(page * pageSize, totalItems)}
        </span>{" "}
        of{" "}
        <span className="font-medium text-gray-900">{totalItems}</span> products
      </div>

      <div className="flex items-center justify-between md:justify-end gap-4 w-full md:w-auto">
        
        {/* Page size */}
        <div className="hidden md:flex items-center gap-2">
          <Label className="text-sm text-gray-600">
            Items per page
          </Label>
          <Select
            value={`${pageSize}`}
            onValueChange={(v) => onPageSizeChange(Number(v))}
          >
            <SelectTrigger
              size="sm"
              className="w-20 bg-white border-gray-300 text-gray-800"
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent side="top" className="bg-white text-gray-800">
              {pageSizes.map((size) => (
                <SelectItem key={size} value={`${size}`}>
                  {size}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Page indicator */}
        <div className="text-sm text-gray-600">
          Page{" "}
          <span className="font-medium text-gray-900">{page}</span>{" "}
          of{" "}
          <span className="font-medium text-gray-900">{pageCount}</span>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-1">
          <Button
            variant="outline"
            size="icon"
            onClick={() => onPageChange(1)}
            disabled={!canPrevious}
            className="border-gray-300 bg-white hover:bg-gray-100"
          >
            <IconChevronsLeft className="h-4 w-4 text-gray-700" />
          </Button>

          <Button
            variant="outline"
            size="icon"
            onClick={() => onPageChange(page - 1)}
            disabled={!canPrevious}
            className="border-gray-300 bg-white hover:bg-gray-100"
          >
            <IconChevronLeft className="h-4 w-4 text-gray-700" />
          </Button>

          <Button
            variant="outline"
            size="icon"
            onClick={() => onPageChange(page + 1)}
            disabled={!canNext}
            className="border-gray-300 bg-white hover:bg-gray-100"
          >
            <IconChevronRight className="h-4 w-4 text-gray-700" />
          </Button>

          <Button
            variant="outline"
            size="icon"
            onClick={() => onPageChange(pageCount)}
            disabled={!canNext}
            className="border-gray-300 bg-white hover:bg-gray-100"
          >
            <IconChevronsRight className="h-4 w-4 text-gray-700" />
          </Button>
        </div>
      </div>
    </div>
  );
}
