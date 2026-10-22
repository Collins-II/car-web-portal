"use client";

import { useState } from "react";
import NextImage from "next/image";

type HeroFormData = {
  title: string;
  subtitle?: string;
  image: string;
  link?: string;
  position: number;
  isActive: boolean;
  startAt?: string;
  endAt?: string;
};

type Hero = HeroFormData & {
  _id: string;
};

const REQUIRED_RATIO = 16 / 9;
const RATIO_TOLERANCE = 0.05; // 5%

/* ---------------------------------
   Image aspect ratio validation
---------------------------------- */
async function validateImageAspectRatio(file: File) {
  const src = URL.createObjectURL(file);
  const img = document.createElement("img");

  return new Promise<void>((resolve, reject) => {
    img.onload = () => {
      const ratio = img.width / img.height;
      URL.revokeObjectURL(src);

      if (Math.abs(ratio - REQUIRED_RATIO) > RATIO_TOLERANCE) {
        reject(
          new Error(
            `Invalid image ratio. Required 16:9 (got ${img.width}×${img.height})`
          )
        );
        return;
      }

      resolve();
    };

    img.onerror = () => {
      URL.revokeObjectURL(src);
      reject(new Error("Failed to load image"));
    };

    img.src = src;
  });
}

export default function HeroForm({
  hero,
  onSuccess,
}: {
  hero?: Hero;
  onSuccess?: () => void;
}) {
  const isEdit = Boolean(hero);

  const [form, setForm] = useState<HeroFormData>(
    hero ?? {
      title: "",
      subtitle: "",
      image: "",
      link: "",
      position: 0,
      isActive: true,
      startAt: "",
      endAt: "",
    }
  );

  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /* ----------------------------
     Image upload
  ---------------------------- */
  const handleImageUpload = async (file: File) => {
    try {
      setUploading(true);
      setError(null);

      //await validateImageAspectRatio(file);

      const data = new FormData();
      data.append("file", file);
      data.append("folder", "hero");

      const res = await fetch("/api/upload/cloudinary", {
        method: "POST",
        body: data,
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.message || "Upload failed");

      setForm(prev => ({ ...prev, image: json.url }));
    } catch (err: any) {
      setError(err.message);
    } finally {
      setUploading(false);
    }
  };

  /* ----------------------------
     Submit
  ---------------------------- */
  const handleSubmit = async () => {
    if (!form.title || !form.image) {
      setError("Title and image are required");
      return;
    }

    try {
      setSubmitting(true);
      setError(null);

      const res = await fetch(
        isEdit
          ? `/api/admin/heros/${hero!._id}`
          : "/api/admin/heros",
        {
          method: isEdit ? "PATCH" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ...form,
            startAt: form.startAt || undefined,
            endAt: form.endAt || undefined,
          }),
        }
      );

      const json = await res.json();
      if (!res.ok) throw new Error(json.message);

      onSuccess?.();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl bg-white border rounded-lg p-6 space-y-6">
      <h2 className="text-lg font-semibold">
        {isEdit ? "Edit Banner" : "Create Banner"}
      </h2>

      {error && (
        <div className="bg-red-50 text-red-600 p-3 rounded text-sm">
          {error}
        </div>
      )}

      <input
        className="w-full border p-3 rounded"
        placeholder="Banner title"
        value={form.title}
        onChange={e => setForm({ ...form, title: e.target.value })}
      />

      <input
        className="w-full border p-3 rounded"
        placeholder="Subtitle (optional)"
        value={form.subtitle}
        onChange={e => setForm({ ...form, subtitle: e.target.value })}
      />

      <input
        className="w-full border p-3 rounded"
        placeholder="Link (e.g /Market-Sectors/industrial-scale)"
        value={form.link}
        onChange={e => setForm({ ...form, link: e.target.value })}
      />

      <input
        type="number"
        className="w-full border p-3 rounded"
        placeholder="Position"
        value={form.position}
        onChange={e =>
          setForm({ ...form, position: Number(e.target.value) })
        }
      />

      {/* Image */}
      <div className="space-y-2">
        <label className="block text-sm font-medium">Banner Image</label>

        {form.image ? (
          <div className="relative w-full h-[180px] border rounded">
            <NextImage
              src={form.image}
              alt="Banner preview"
              fill
              className="object-contain"
            />
          </div>
        ) : (
          <label className="border-dashed border p-6 rounded cursor-pointer text-center block">
            {uploading ? "Uploading..." : "Click to upload image"}
            <input
              type="file"
              accept="image/*"
              hidden
              onChange={e =>
                e.target.files && handleImageUpload(e.target.files[0])
              }
            />
          </label>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <input
          aria-label="delte-input"
          type="datetime-local"
          className="border p-2 rounded"
          value={form.startAt}
          onChange={e => setForm({ ...form, startAt: e.target.value })}
        />
        <input
          aria-label="delte-input"
          type="datetime-local"
          className="border p-2 rounded"
          value={form.endAt}
          onChange={e => setForm({ ...form, endAt: e.target.value })}
        />
      </div>

      <label className="flex items-center gap-2">
        <input
          type="checkbox"
          checked={form.isActive}
          onChange={e =>
            setForm({ ...form, isActive: e.target.checked })
          }
        />
        Active
      </label>

      <button
        disabled={submitting || uploading}
        onClick={handleSubmit}
        className="w-full bg-black text-white py-3 rounded disabled:opacity-50"
      >
        {submitting
          ? "Saving..."
          : isEdit
          ? "Update Hero"
          : "Create Hero"}
      </button>
    </div>
  );
}
