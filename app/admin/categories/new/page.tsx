"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import CategoryForm from "@/components/forms/CategoryForm";

// --------------------------------------------------
// Types
// --------------------------------------------------

type Category = {
  _id: string;
  name: string;
};

// --------------------------------------------------
// Page
// --------------------------------------------------

export default function NewCategoryPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [parentId, setParentId] = useState<string | null>(null);

  useEffect(() => {
    fetchCategories();
  }, []);

const fetchCategories = async () => {
  try {
    const res = await fetch("/api/admin/categories");
    const data = await res.json();

    // Make sure we have an array
    if (Array.isArray(data)) {
      setCategories(data);
    } else {
      console.error("[CATEGORIES_FETCH]", data);
      setCategories([]); // fallback
    }
  } catch (err) {
    console.error("[CATEGORIES_FETCH_ERROR]", err);
    setCategories([]);
  }
};


  return (
    <div className="p-8 max-w-4xl space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/admin/categories">
          <Button size="sm" variant="ghost">
            <ArrowLeft size={16} />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold">Create Category</h1>
          <p className="text-gray-600">Add a new category or subcategory</p>
        </div>
      </div>

      {/* Parent selector */}
      <div className="space-y-2">
        <label className="text-sm font-medium">Parent category (optional)</label>
        <select
  aria-label="select-input"
  className="input"
  value={parentId || ""}
  onChange={(e) => setParentId(e.target.value || null)}
>
  <option value="">— No parent (top-level) —</option>
  {Array.isArray(categories) && categories.map((cat) => (
    <option key={cat._id} value={cat._id}>
      {cat.name}
    </option>
  ))}
</select>

      </div>

      {/* Form */}
      <CategoryForm parentId={parentId} />
    </div>
  );
}
