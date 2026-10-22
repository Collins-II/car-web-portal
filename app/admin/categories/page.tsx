"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Plus, Pencil, Trash2, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { motion } from "framer-motion";

// --------------------------------------------------
// Types
// --------------------------------------------------

type Category = {
  _id: string;
  name: string;
  slug: string;
  parent?: string | null;
};

// --------------------------------------------------
// Page
// --------------------------------------------------

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCategories();
  }, []);

const fetchCategories = async () => {
  setLoading(true);

  const res = await fetch("/api/admin/categories");

  if (!res.ok) {
    setLoading(false);
    throw new Error("Failed to fetch categories");
  }

  const data = await res.json();
  setCategories(data);
  setLoading(false);
};


  const deleteCategory = async (id: string) => {
    if (!confirm("Delete this category? Child categories will NOT be deleted.")) return;

    await fetch(`/api/admin/categories/${id}`, { method: "DELETE" });
    fetchCategories();
  };

  const tree = buildTree(categories);

  return (
    <div className="p-8 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Categories</h1>
          <p className="text-gray-600">Manage nested product & scale categories</p>
        </div>

        <Link href="/admin/categories/new">
          <Button className="flex gap-2">
            <Plus size={16} /> New Category
          </Button>
        </Link>
      </div>

      {/* Content */}
      {loading ? (
        <p>Loading categories...</p>
      ) : tree.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="space-y-4">
          {tree.map((cat) => (
            <CategoryNode
              key={cat._id}
              category={cat}
              onDelete={deleteCategory}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// --------------------------------------------------
// Tree helpers
// --------------------------------------------------

function buildTree(categories: Category[]) {
  const map = new Map<string, any>();
  const roots: any[] = [];

  categories.forEach((cat) => map.set(cat._id, { ...cat, children: [] }));

  map.forEach((cat) => {
    if (cat.parent) {
      map.get(cat.parent)?.children.push(cat);
    } else {
      roots.push(cat);
    }
  });

  return roots;
}

// --------------------------------------------------
// Components
// --------------------------------------------------

function CategoryNode({
  category,
  onDelete,
}: {
  category: any;
  onDelete: (id: string) => void;
}) {
  const [open, setOpen] = useState(true);

  return (
    <motion.div
      initial={{ opacity: 0, y: 5 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {category.children.length > 0 && (
                <button aria-label="open-button" onClick={() => setOpen(!open)}>
                  <ChevronRight
                    className={`transition ${open ? "rotate-90" : ""}`}
                    size={16}
                  />
                </button>
              )}
              <span className="font-medium">{category.name}</span>
              <span className="text-xs text-gray-500">/{category.slug}</span>
            </div>

            <div className="flex gap-2">
              <Link href={`/admin/categories/${category._id}/edit`}>
                <Button size="sm" variant="secondary">
                  <Pencil size={14} />
                </Button>
              </Link>
              <Button
                size="sm"
                variant="destructive"
                onClick={() => onDelete(category._id)}
              >
                <Trash2 size={14} />
              </Button>
            </div>
          </div>

          {open && category.children.length > 0 && (
            <div className="pl-6 mt-3 space-y-2 border-l">
              {category.children.map((child: any) => (
                <CategoryNode
                  key={child._id}
                  category={child}
                  onDelete={onDelete}
                />
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}

function EmptyState() {
  return (
    <Card>
      <CardContent className="p-8 text-center">
        <p className="text-gray-600">No categories yet</p>
        <Link href="/admin/categories/new">
          <Button className="mt-4">Create your first category</Button>
        </Link>
      </CardContent>
    </Card>
  );
}
