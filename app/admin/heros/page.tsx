"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import BannerReorder from "@/components/forms/BannerReorder";
import HeroForm from "@/components/forms/HeroForm";

type Banner = {
  _id: string;
  title: string;
  subtitle?: string;
  image: string;
  link?: string;
  position: number;
  isActive: boolean;
  startAt?: string;
  endAt?: string;
};

export default function AdminHeroPage() {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Banner | null>(null);
  const [showForm, setShowForm] = useState(false);

  /* ----------------------------
     Fetch banners
  ---------------------------- */
  const loadBanners = async () => {
    setLoading(true);
    const res = await fetch("/api/admin/heros");
    
    const json = await res.json();
    setBanners(json.data);
    setLoading(false);
  };

  useEffect(() => {
    loadBanners();
  }, []);

  /* ----------------------------
     Reorder handler
  ---------------------------- */
  const handleReorder = async (items: Banner[]) => {
    setBanners(items);

    await fetch("/api/admin/banners/reorder", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(
        items.map((b, index) => ({
          id: b._id,
          position: index,
        }))
      ),
    });
  };

  /* ----------------------------
     Toggle active
  ---------------------------- */
  const toggleActive = async (banner: Banner) => {
    await fetch(`/api/admin/heros/${banner._id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isActive: !banner.isActive }),
    });

    loadBanners();
  };

  /* ----------------------------
     Delete
  ---------------------------- */
  const deleteBanner = async (id: string) => {
    if (!confirm("Delete this banner?")) return;

    await fetch(`/api/admin/heros/${id}`, {
      method: "DELETE",
    });

    loadBanners();
  };

  return (
    <div className="w-full max-w-6xl mx-auto p-6 space-y-8">
      {/* Header */}
      <div className="w-full flex items-center justify-between ">
        <h1 className="text-2xl font-bold">Heros</h1>
        <button
          onClick={() => {
            setEditing(null);
            setShowForm(true);
          }}
          className="bg-black text-white px-4 py-2 rounded"
        >
          + New Banner
        </button>
      </div>

      {/* Create / Edit Form */}
      {showForm && (
        <HeroForm
          hero={editing ?? undefined}
          onSuccess={() => {
            setShowForm(false);
            setEditing(null);
            loadBanners();
          }}
        />
      )}

      {/* Loading */}
      {loading && <p className="text-gray-500">Loading hero banners…</p>}

      {/* Reorder */}
      {!loading && banners.length > 0 && (
        <>
          <div>
            <h2 className="font-semibold mb-2">Reorder Hero Banners</h2>
            <BannerReorder banners={banners} onReorder={handleReorder} />
          </div>

          {/* List */}
          <div className="space-y-4">
            {banners.map((banner) => (
              <div
                key={banner._id}
                className="flex items-center gap-4 border rounded p-4 bg-white"
              >
                {/* Image */}
                <div className="relative w-40 h-20 border rounded overflow-hidden">
                  <Image
                    src={banner.image}
                    alt={banner.title}
                    fill
                    className="object-cover"
                  />
                </div>

                {/* Info */}
                <div className="flex-1">
                  <p className="font-medium">{banner.title}</p>
                  <p className="text-xs text-gray-500">
                    Position: {banner.position}
                  </p>
                  <p className="text-xs">
                    Status:{" "}
                    <span
                      className={
                        banner.isActive
                          ? "text-green-600"
                          : "text-red-500"
                      }
                    >
                      {banner.isActive ? "Active" : "Inactive"}
                    </span>
                  </p>
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      setEditing(banner);
                      setShowForm(true);
                    }}
                    className="px-3 py-1 border rounded text-sm"
                  >
                    Edit
                  </button>

                  <button
                    onClick={() => toggleActive(banner)}
                    className="px-3 py-1 border rounded text-sm"
                  >
                    {banner.isActive ? "Disable" : "Enable"}
                  </button>

                  <button
                    onClick={() => deleteBanner(banner._id)}
                    className="px-3 py-1 border border-red-500 text-red-500 rounded text-sm"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {!loading && banners.length === 0 && (
        <p className="text-gray-500">No banners created yet.</p>
      )}
    </div>
  );
}
