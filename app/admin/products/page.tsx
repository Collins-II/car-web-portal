"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import ProductForm from "@/components/forms/ProductForm";

type Product = {
  _id: string;
  name: string;
  sku?: string;
  price?: number;
  image?: string;
  status?: "active" | "inactive";
};

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Product | null>(null);
  const [showForm, setShowForm] = useState(false);

  /* ----------------------------
     Fetch products
  ---------------------------- */
  const loadProducts = async () => {
    setLoading(true);
    const res = await fetch("/api/admin/products");
    const json = await res.json();
    setProducts(json.data ?? json);
    setLoading(false);
  };

  useEffect(() => {
    loadProducts();
  }, []);

  /* ----------------------------
     Delete
  ---------------------------- */
  const deleteProduct = async (id: string) => {
    if (!confirm("Delete this product?")) return;

    await fetch(`/api/admin/products/${id}`, {
      method: "DELETE",
    });

    loadProducts();
  };

  return (
    <div className="w-full max-w-6xl mx-auto p-6 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Products</h1>

        <button
          onClick={() => {
            setEditing(null);
            setShowForm(true);
          }}
          className="bg-black text-white px-4 py-2 rounded"
        >
          + New Product
        </button>
      </div>

      {/* Create / Edit Form */}
      {showForm && (
        <ProductForm
          product={editing ?? undefined}
          onSuccess={() => {
            setShowForm(false);
            setEditing(null);
            loadProducts();
          }}
          onCancel={() => {
            setShowForm(false);
            setEditing(null);
          }}
        />
      )}

      {/* Loading */}
      {loading && <p className="text-gray-500">Loading products…</p>}

      {/* List */}
      {!loading && products.length > 0 && (
        <div className="w-full space-y-4">
          {products.map((product) => (
            <div
              key={product._id}
              className="flex flex-wrap items-center gap-4 border rounded p-4 bg-white"
            >
              {/* Image */}
              <div className="relative w-24 h-20 border rounded overflow-hidden bg-gray-50">
                {product.image ? (
                  <Image
                    src={product.image}
                    alt={product.name}
                    fill
                    className="object-contain"
                  />
                ) : (
                  <div className="flex items-center justify-center h-full text-xs text-gray-400">
                    No image
                  </div>
                )}
              </div>

              {/* Info */}
              <div className="flex-1">
                <p className="font-medium">{product.name}</p>

                {product.sku && (
                  <p className="text-xs text-gray-500">SKU: {product.sku}</p>
                )}

                {product.price !== undefined && (
                  <p className="text-xs text-gray-500">
                    Price: {product.price.toLocaleString()}
                  </p>
                )}

                <p className="text-xs">
                  Status:{" "}
                  <span
                    className={
                      product.status === "active"
                        ? "text-green-600"
                        : "text-red-500"
                    }
                  >
                    {product.status ?? "inactive"}
                  </span>
                </p>
              </div>

              {/* Actions */}
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    setEditing(product);
                    setShowForm(true);
                  }}
                  className="px-3 py-1 border rounded text-sm"
                >
                  Edit
                </button>

                <button
                  onClick={() => deleteProduct(product._id)}
                  className="px-3 py-1 border border-red-500 text-red-500 rounded text-sm"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {!loading && products.length === 0 && (
        <p className="text-gray-500">No products created yet.</p>
      )}
    </div>
  );
}
