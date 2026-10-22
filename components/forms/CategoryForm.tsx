"use client";

import { useEffect, useState } from "react";
import NextImage from "next/image";
import { slugify } from "@/lib/utils";

/* -----------------------------
   Types
----------------------------- */
type ImageMode = "image" | "icon";

type CategoryFormProps = {
  initialData?: {
    _id: string;
    name: string;
    slug: string;
    description?: string;
    parent?: string | null;
    image?: string;
    icon?: string;
  };
  parentId?: string | null;
};

const REQUIRED_RATIO = 1; // square
const RATIO_TOLERANCE = 0.05;

/* -----------------------------
   Image Ratio Validation
----------------------------- */
async function validateSquareImage(file: File) {
  const src = URL.createObjectURL(file);
  const img = document.createElement("img");

  return new Promise<void>((resolve, reject) => {
    img.onload = () => {
      const ratio = img.width / img.height;
      URL.revokeObjectURL(src);

      if (Math.abs(ratio - REQUIRED_RATIO) > RATIO_TOLERANCE) {
        reject(
          new Error(
            `Invalid image ratio. Required 1:1 (got ${img.width}×${img.height})`
          )
        );
        return;
      }

      resolve();
    };

    img.onerror = () => reject(new Error("Invalid image file"));
    img.src = src;
  });
}

/* -----------------------------
   Component
----------------------------- */
export default function CategoryForm({
  initialData,
  parentId = null,
}: CategoryFormProps) {
  const isEdit = Boolean(initialData);

  const [name, setName] = useState(initialData?.name || "");
  const [slug, setSlug] = useState(initialData?.slug || "");
  const [description, setDescription] = useState(initialData?.description || "");

  const [mode, setMode] = useState<ImageMode>(
    initialData?.icon ? "icon" : "image"
  );

  const [image, setImage] = useState(initialData?.image || "");
  const [icon, setIcon] = useState(initialData?.icon || "");

  const [dragging, setDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /* Auto slug */
  useEffect(() => {
    if (!isEdit) setSlug(slugify(name));
  }, [name, isEdit]);

  /* -----------------------------
     Upload
  ----------------------------- */
  async function uploadImage(file: File) {
    try {
      setUploading(true);
      setError(null);

      await validateSquareImage(file);

      const data = new FormData();
      data.append("file", file);
      data.append("folder", "categories");

      const res = await fetch("/api/upload/cloudinary", {
        method: "POST",
        body: data,
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.message);

      setImage(json.url);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setUploading(false);
    }
  }

  /* -----------------------------
     Submit
  ----------------------------- */
  async function submit() {
    if (!name.trim()) {
      setError("Category name is required");
      return;
    }

    try {
      setSaving(true);
      setError(null);

      const res = await fetch(
        isEdit
          ? `/api/categories/${initialData!._id}`
          : "/api/categories",
        {
          method: isEdit ? "PUT" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name,
            slug,
            description,
            parent: parentId,
            image: mode === "image" ? image : undefined,
            icon: mode === "icon" ? icon : undefined,
          }),
        }
      );

      if (!res.ok) throw new Error("Failed to save category");

      alert(isEdit ? "Category updated" : "Category created");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="max-w-3xl bg-white border rounded-lg p-6 space-y-6">
      <h1 className="text-xl font-semibold">
        {isEdit ? "Edit Category" : "Create Category"}
      </h1>

      {error && (
        <div className="bg-red-50 text-red-600 p-3 rounded text-sm">
          {error}
        </div>
      )}

      {/* Name */}
      <input
        className="w-full border p-3 rounded"
        placeholder="Category name"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />

      {/* Slug */}
      <input
        className="w-full border p-3 rounded"
        placeholder="Slug"
        value={slug}
        onChange={(e) => setSlug(slugify(e.target.value))}
      />

      {/* Description */}
      <textarea
        className="w-full border p-3 rounded min-h-[100px]"
        placeholder="Description (optional)"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
      />

      {/* Mode Toggle */}
      <div className="flex gap-4">
        <label className="flex items-center gap-2">
          <input
            type="radio"
            checked={mode === "image"}
            onChange={() => setMode("image")}
          />
          Image
        </label>
        <label className="flex items-center gap-2">
          <input
            type="radio"
            checked={mode === "icon"}
            onChange={() => setMode("icon")}
          />
          Icon
        </label>
      </div>

      {/* Icon */}
      {mode === "icon" && (
        <input
          className="w-full border p-3 rounded text-center text-3xl"
          placeholder="e.g ⚖️ 🏭 📦"
          value={icon}
          onChange={(e) => setIcon(e.target.value)}
        />
      )}

      {/* Image Upload */}
      {mode === "image" && (
        <div
          className={`border-2 border-dashed rounded p-6 text-center transition ${
            dragging ? "border-black bg-gray-50" : "border-gray-300"
          }`}
          onDragOver={(e) => {
            e.preventDefault();
            setDragging(true);
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragging(false);
            if (e.dataTransfer.files[0]) {
              uploadImage(e.dataTransfer.files[0]);
            }
          }}
        >
          {image ? (
            <div className="relative h-[180px]">
              <NextImage
                src={image}
                alt="Category image"
                fill
                className="object-contain"
              />
              <button
                onClick={() => setImage("")}
                className="absolute top-2 right-2 bg-black/70 text-white px-2 py-1 text-xs rounded"
              >
                Remove
              </button>
            </div>
          ) : (
            <>
              <p className="text-sm text-gray-500">
                Drag & drop square image or click to upload
              </p>
              <input
                type="file"
                hidden
                accept="image/*"
                onChange={(e) =>
                  e.target.files && uploadImage(e.target.files[0])
                }
              />
            </>
          )}
        </div>
      )}

      {/* Submit */}
      <button
        disabled={saving || uploading}
        onClick={submit}
        className="w-full bg-black text-white py-3 rounded disabled:opacity-50"
      >
        {saving ? "Saving..." : isEdit ? "Update Category" : "Create Category"}
      </button>
    </div>
  );
}
