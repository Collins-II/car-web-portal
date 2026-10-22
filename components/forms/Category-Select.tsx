"use client";

import { useEffect, useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

interface Category {
  _id: string;
  name: string;
  slug: string;
}

interface CategorySelectProps {
  value: string;
  onChange: (id: string, slug: string) => void;
  placeholder?: string;
  disabled?: boolean;
  onCreateCategory?: () => void;
}

export function CategorySelect({
  value,
  onChange,
  placeholder = "Select category",
  disabled = false,
  onCreateCategory
}: CategorySelectProps) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  /* ---------------- Fetch categories ---------------- */
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(true);
        setError(false);

        const res = await fetch("/api/admin/categories");
        if (!res.ok) throw new Error();

        const data: Category[] = await res.json();
        setCategories(data);
      } catch (err) {
        console.error("[CATEGORY_SELECT]", err);
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  /* ---------------- Handle change ---------------- */
  const handleChange = (id: string) => {
    const category = categories.find(c => c._id === id);
    if (!category) return;

    onChange(category._id, category.name);
  };

  /* ---------------- Render ---------------- */
  return (
    <Select
      value={value}
      onValueChange={handleChange}
      disabled={disabled || loading || error}
    >
      <SelectTrigger>
        <SelectValue
          placeholder={
            loading
              ? "Loading categories..."
              : error
              ? "Failed to load categories"
              : placeholder
          }
        />
      </SelectTrigger>

      <SelectContent>
        {/* Categories */}
        {categories.map(category => (
          <SelectItem key={category._id} value={category._id}>
            {category.name}
          </SelectItem>
        ))}

        {/* Empty State */}
        {!loading && categories.length === 0 && (
          <div className="px-3 py-2 space-y-2">
            <p className="text-sm text-muted-foreground">
              No categories found
            </p>


          </div>
        )}
                    {onCreateCategory && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="w-full flex gap-2"
                onClick={onCreateCategory}
              >
                <Plus size={14} />
                Create Category
              </Button>
            )}
      </SelectContent>
    </Select>
  );
}
