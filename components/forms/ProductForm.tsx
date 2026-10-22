"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { z } from "zod";
import slugify from "slugify";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";

import { Plus, Trash, X } from "lucide-react";

import { GalleryUploader } from "@/components/gallery-uploader";
import { CategorySelect } from "./Category-Select";
import { CreateCategoryModal } from "../modals/CategoryCreateModal";
import { MainImageUploader } from "../main-image-uploader";
import { ScaleType } from "@/lib/database/models/scales_product";
import { ScaleTypeSelect } from "../scale-type-select";
import { getCategoryFromScale, ScaleCategory } from "@/data/utilities";

/* ---------------- Schema ---------------- */
const VariantSchema = z.object({
  sku: z.string().optional(),
  platformSize: z.string().optional(),
  loadCellCount: z.number().min(1).optional(),
  maxCapacity: z.number().min(0).optional(),
  price: z.number().min(0).optional(),
  stock: z.number().min(0).optional()
});

export const ProductSchema = z.object({
  _id: z.string(),
  name: z.string().min(2),
  slug: z.string().min(2),

  categoryId: z.string().min(1),
  categorySlug: z.string().min(1),

  scaleType: z.custom<ScaleType>().optional(),

  description: z.string().min(10),

  image: z.string().url(),
  gallery: z.array(z.string().url()).default([]),

  price: z.number().min(0),
  currency: z.enum(["ZMW", "USD"]),

  features: z.array(z.string()).default([]),
  specifications: z.record(z.string(), z.string()).default({}),
  dimensions: z.string().optional(),

  minCapacity: z.number().min(0).optional(),
  maxCapacity: z.number().min(0).optional(),

  accuracyClass: z
    .enum(["Class I", "Class II", "Class III", "Class IIII"])
    .optional(),

  certifications: z
    .array(z.enum(["ISO", "OIML", "NTEP", "CE", "GMP"]))
    .default([]),

  variants: z.array(VariantSchema).default([]),

  stock: z.number().min(0),
  inStock: z.boolean(),

  tags: z.array(z.string()).default([]),

  isActive: z.boolean()
});

type AccuracyClass =
  | "Class I"
  | "Class II"
  | "Class III"
  | "Class IIII";

export type ProductFormState = z.infer<typeof ProductSchema>;
export type Variant = z.infer<typeof VariantSchema>;

interface Props {
  product?: Partial<ProductFormState> & {
    category?: { _id: string };
  };
  onSuccess: () => void;
  onCancel?: () => void;
}

/* ---------------- Component ---------------- */
export default function ProductForm({
  product,
  onSuccess,
  onCancel
}: Props) {
  const isEdit = Boolean(product);

  const [autoSlug, setAutoSlug] = useState(true);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [openCreateCategory, setOpenCreateCategory] = useState(false);

  const [featureInput, setFeatureInput] = useState("");
  const [tagInput, setTagInput] = useState("");
  const [specKey, setSpecKey] = useState("");
  const [specValue, setSpecValue] = useState("");

  const [form, setForm] = useState<ProductFormState>({
    _id: product?._id ?? "",
    name: product?.name ?? "",
    slug: product?.slug ?? "",

    categoryId: product?.category?._id ?? "",
    categorySlug: product?.categorySlug ?? "",

    scaleType: product?.scaleType,

    description: product?.description ?? "",

    image: product?.image ?? "",
    gallery: product?.gallery ?? [],

    price: product?.price ?? 0,
    currency: product?.currency ?? "ZMW",

    features: product?.features ?? [],
    specifications: product?.specifications ?? {},
    dimensions: product?.dimensions,

    minCapacity: product?.minCapacity,
    maxCapacity: product?.maxCapacity,

    accuracyClass: product?.accuracyClass,

    certifications: product?.certifications ?? [],

    variants: product?.variants ?? [],

    stock: product?.stock ?? 0,
    inStock: (product?.stock ?? 0) > 0,

    tags: product?.tags ?? [],

    isActive: product?.isActive ?? true
  });

  /* -------- Slug sync -------- */
  useEffect(() => {
    if (!autoSlug) return;
    setForm(f => {
      const slug = slugify(f.name, { lower: true });
      return f.slug === slug ? f : { ...f, slug };
    });
  }, [form.name, autoSlug]);

  /* -------- Stock → inStock sync -------- */
  useEffect(() => {
    setForm(f => ({ ...f, inStock: f.stock > 0 }));
  }, [form.stock]);

  /* -------- Validation -------- */
  const validate = () => {
    const res = ProductSchema.safeParse(form);
    if (!res.success) {
      const e: Record<string, string> = {};
      res.error.issues.forEach(i => {
        e[String(i.path[0])] = i.message;
      });
      setErrors(e);
      return false;
    }
    setErrors({});
    return true;
  };

  /* -------- Submit -------- */
  const submit = async () => {
    if (!validate()) return;
    setLoading(true);

    try {
      const res = await fetch(
        isEdit
          ? `/api/admin/products/${product?._id}`
          : "/api/admin/products",
        {
          method: isEdit ? "PATCH" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form)
        }
      );

      if (!res.ok) throw new Error();
      onSuccess();
    } catch {
      alert("Failed to save product");
    } finally {
      setLoading(false);
    }
  };

  /* ---------------- Render ---------------- */
  return (
    <>
      <CreateCategoryModal
        open={openCreateCategory}
        onClose={() => setOpenCreateCategory(false)}
        onCreated={c =>
          setForm(f => ({ ...f, categoryId: c._id }))
        }
      />

        <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-6xl mx-auto p-6"
      >
        <Card>
          <CardHeader>
            <CardTitle>
              {isEdit ? "Edit Product" : "Create Product"}
            </CardTitle>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Name */}
            <div className="space-y-2">
              <label className="text-sm font-medium">
                Product Name
              </label>
              <Input
                value={form.name}
                onChange={e =>
                  setForm(f => ({ ...f, name: e.target.value }))
                }
              />
            </div>

            {/* Slug */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Slug</label>
              <Input
                value={form.slug}
                onFocus={() => setAutoSlug(false)}
                onChange={e =>
                  setForm(f => ({ ...f, slug: e.target.value }))
                }
              />
            </div>

            {/* Category */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Category</label>
              <CategorySelect
                value={form.categoryId}
               onChange={(id, slug) =>
                setForm(f => ({
                 ...f,
                 categoryId: id,
                 categorySlug: slug
               }))
               }

                onCreateCategory={() =>
                  setOpenCreateCategory(true)
                }
              />
            </div>

            <input type="hidden" value={form.categorySlug} />

            {/* Scale Type */}
<div className="space-y-2">
  <label className="text-sm font-medium">
    Scale Type
  </label>

  <ScaleTypeSelect
    category={getCategoryFromScale(form.categorySlug) as ScaleCategory}
    value={form.scaleType}
    onChange={v =>
      setForm(f => ({
        ...f,
        scaleType: v
      }))
    }
  />
</div>


            {/* Description */}
            <div className="space-y-2">
              <label className="text-sm font-medium">
                Description
              </label>
              <Textarea
                value={form.description}
                onChange={e =>
                  setForm(f => ({
                    ...f,
                    description: e.target.value
                  }))
                }
              />
            </div>
            {/* Tags */}
<div className="space-y-2">
  <label className="text-sm font-medium">Tags</label>

  <div className="flex gap-2">
    <Input
      placeholder="e.g. heavy-duty"
      value={tagInput}
      onChange={e => setTagInput(e.target.value)}
      onKeyDown={e => {
        if (e.key === "Enter" && tagInput.trim()) {
          e.preventDefault();
          setForm(f => ({
            ...f,
            tags: [...f.tags, tagInput.trim()]
          }));
          setTagInput("");
        }
      }}
    />
    <Button
      type="button"
      variant="secondary"
      onClick={() => {
        if (!tagInput.trim()) return;
        setForm(f => ({
          ...f,
          tags: [...f.tags, tagInput.trim()]
        }));
        setTagInput("");
      }}
    >
      <Plus size={16} />
    </Button>
  </div>

  <div className="flex flex-wrap gap-2">
    {form.tags.map((t, i) => (
      <span
        key={i}
        className="flex items-center gap-1 bg-muted px-3 py-1 rounded-full text-sm"
      >
        {t}
        <button
          aria-label="button-tags"
          type="button"
          onClick={() =>
            setForm(f => ({
              ...f,
              tags: f.tags.filter((_, idx) => idx !== i)
            }))
          }
        >
          <X size={14} />
        </button>
      </span>
    ))}
  </div>
</div>

{/* Dimensions */}
<div className="space-y-2">
  <label className="text-sm font-medium">Dimensions</label>
  <Input
    placeholder="e.g. 500 x 400 x 120 mm"
    value={form.dimensions ?? ""}
    onChange={e =>
      setForm(f => ({ ...f, dimensions: e.target.value }))
    }
  />
</div>

{/* Capacity */}
<div className="grid grid-cols-2 gap-2">
  <div className="space-y-2">
    <label className="text-sm font-medium">Min Capacity (kg)</label>
    <Input
      type="number"
      value={form.minCapacity ?? ""}
      onChange={e =>
        setForm(f => ({
          ...f,
          minCapacity: Number(e.target.value)
        }))
      }
    />
  </div>

  <div className="space-y-2">
    <label className="text-sm font-medium">Max Capacity (kg)</label>
    <Input
      type="number"
      value={form.maxCapacity ?? ""}
      onChange={e =>
        setForm(f => ({
          ...f,
          maxCapacity: Number(e.target.value)
        }))
      }
    />
  </div>
</div>

            {/* Features */}
<div className="space-y-2">
  <label className="text-sm font-medium">Features</label>

  <div className="flex gap-2">
    <Input
      placeholder="e.g. Stainless steel platform"
      value={featureInput}
      onChange={e => setFeatureInput(e.target.value)}
      onKeyDown={e => {
        if (e.key === "Enter" && featureInput.trim()) {
          e.preventDefault();
          setForm(f => ({
            ...f,
            features: [...f.features, featureInput.trim()]
          }));
          setFeatureInput("");
        }
      }}
    />
    <Button
      type="button"
      variant="secondary"
      onClick={() => {
        if (!featureInput.trim()) return;
        setForm(f => ({
          ...f,
          features: [...f.features, featureInput.trim()]
        }));
        setFeatureInput("");
      }}
    >
      <Plus size={16} />
    </Button>
  </div>

  {/* Feature chips */}
  <div className="flex flex-wrap gap-2">
    {form.features.map((f, i) => (
      <span
        key={i}
        className="flex items-center gap-1 bg-muted px-3 py-1 rounded-full text-sm"
      >
        {f}
        <button
          aria-label="button-features"
          type="button"
          onClick={() =>
            setForm(s => ({
              ...s,
              features: s.features.filter((_, idx) => idx !== i)
            }))
          }
        >
          <X size={14} />
        </button>
      </span>
    ))}
  </div>
</div>


            {/* Price & Currency */}
            <div className="grid grid-cols-3 gap-2">
              <div className="col-span-2 space-y-2">
                <label className="text-sm font-medium">Price</label>
                <Input
                  type="number"
                  value={form.price}
                  onChange={e =>
                    setForm(f => ({
                      ...f,
                      price: Number(e.target.value)
                    }))
                  }
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">
                  Currency
                </label>
                <Select
                  value={form.currency}
                  onValueChange={v =>
                    setForm(f => ({
                      ...f,
                      currency: v as ProductFormState["currency"]
                    }))
                  }
                >
                  <SelectTrigger />
                  <SelectContent>
                    <SelectItem value="ZMW">ZMW</SelectItem>
                    <SelectItem value="USD">USD</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Stock */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Stock</label>
              <Input
                type="number"
                value={form.stock}
                onChange={e =>
                  setForm(f => ({
                    ...f,
                    stock: Number(e.target.value)
                  }))
                }
              />
            </div>

            {/* Image */}
            <div className="space-y-2">
  
              <MainImageUploader
                value={form.image}
                onChange={url =>
                  setForm(f => ({
                   ...f,
                   image: url ?? ""
                 }))
                }
              />

            </div>

            {/* Gallery */}
            <GalleryUploader
              value={form.gallery}
              onChange={g =>
                setForm(f => ({ ...f, gallery: g }))
              }
            />
{/* Variants */}
<div className="space-y-4">
  <h3 className="font-semibold">Variants</h3>

  {form.variants.map((v, i) => (
    <div
      key={i}
      className="grid grid-cols-6 gap-2 border p-3 rounded"
    >
      <Input
        placeholder="SKU"
        value={v.sku ?? ""}
        onChange={e => {
          const copy = [...form.variants];
          copy[i] = { ...copy[i], sku: e.target.value };
          setForm(f => ({ ...f, variants: copy }));
        }}
      />

      <Input
        placeholder="Platform Size"
        value={v.platformSize ?? ""}
        onChange={e => {
          const copy = [...form.variants];
          copy[i] = { ...copy[i], platformSize: e.target.value };
          setForm(f => ({ ...f, variants: copy }));
        }}
      />

      <Input
        type="number"
        placeholder="Load Cells"
        value={v.loadCellCount ?? ""}
        onChange={e => {
          const copy = [...form.variants];
          copy[i] = {
            ...copy[i],
            loadCellCount: Number(e.target.value)
          };
          setForm(f => ({ ...f, variants: copy }));
        }}
      />

      <Input
        type="number"
        placeholder="Max Capacity (kg)"
        value={v.maxCapacity ?? ""}
        onChange={e => {
          const copy = [...form.variants];
          copy[i] = {
            ...copy[i],
            maxCapacity: Number(e.target.value)
          };
          setForm(f => ({ ...f, variants: copy }));
        }}
      />

      <Input
        type="number"
        placeholder="Price"
        value={v.price ?? ""}
        onChange={e => {
          const copy = [...form.variants];
          copy[i] = {
            ...copy[i],
            price: Number(e.target.value)
          };
          setForm(f => ({ ...f, variants: copy }));
        }}
      />

      <div className="flex gap-1">
        <Input
          type="number"
          placeholder="Stock"
          value={v.stock ?? ""}
          onChange={e => {
            const copy = [...form.variants];
            copy[i] = {
              ...copy[i],
              stock: Number(e.target.value)
            };
            setForm(f => ({ ...f, variants: copy }));
          }}
        />
        <Button
          variant="destructive"
          onClick={() =>
            setForm(f => ({
              ...f,
              variants: f.variants.filter((_, idx) => idx !== i)
            }))
          }
        >
          <Trash size={16} />
        </Button>
      </div>
    </div>
  ))}

  <Button
    variant="secondary"
    onClick={() =>
      setForm(f => ({
        ...f,
        variants: [...f.variants, {}]
      }))
    }
  >
    <Plus size={16} /> Add Variant
  </Button>
</div>


{/* Specifications */}
<div className="space-y-3">
  <label className="text-sm font-medium">Specifications</label>

  <div className="grid grid-cols-3 gap-2">
    <Input
      placeholder="Key (e.g. Display)"
      value={specKey}
      onChange={e => setSpecKey(e.target.value)}
    />
    <Input
      placeholder="Value (e.g. LCD)"
      value={specValue}
      onChange={e => setSpecValue(e.target.value)}
    />
    <Button
      type="button"
      variant="secondary"
      onClick={() => {
        if (!specKey || !specValue) return;

        setForm(f => ({
          ...f,
          specifications: {
            ...f.specifications,
            [specKey]: specValue
          }
        }));

        setSpecKey("");
        setSpecValue("");
      }}
    >
      Add
    </Button>
  </div>

  {/* Specs table */}
  <div className="border rounded divide-y">
    {Object.entries(form.specifications).map(([k, v]) => (
      <div
        key={k}
        className="flex justify-between items-center p-2 text-sm"
      >
        <div>
          <strong>{k}:</strong> {v as any}
        </div>
        <Button
          size="sm"
          variant="ghost"
          onClick={() =>
            setForm(f => {
              const copy = { ...f.specifications };
              delete copy[k];
              return { ...f, specifications: copy };
            })
          }
        >
          <Trash size={14} />
        </Button>
      </div>
    ))}
  </div>
</div>

            {/* Certifications */}
            <div className="space-y-2">
              <label className="text-sm font-medium">
                Certifications
              </label>
              <div className="grid grid-cols-2 gap-2">
                {["ISO", "OIML", "NTEP", "CE", "GMP"].map(cert => {
                  const checked =
                    form.certifications.includes(cert as any);
                  return (
                    <label
                      key={cert}
                      className="flex items-center gap-2 border rounded p-2"
                    >
                      <Checkbox
                        checked={checked}
                        onCheckedChange={v =>
                          setForm(f => ({
                            ...f,
                            certifications: v
                              ? [...f.certifications, cert as any]
                              : f.certifications.filter(c => c !== cert)
                          }))
                        }
                      />
                      {cert}
                    </label>
                  );
                })}
              </div>
            </div>

            {/* Accuracy Class */}
<div className="space-y-2">
  <label className="text-sm font-medium">Accuracy Class</label>

  <Select
    value={form.accuracyClass ?? ""}
    onValueChange={(v: AccuracyClass) =>
      setForm(prev => ({
        ...prev,
        accuracyClass: v
      }))
    }
  >
    <SelectTrigger>
      <SelectValue placeholder="Select accuracy class" />
    </SelectTrigger>

    <SelectContent>
      {(
        ["Class I", "Class II", "Class III", "Class IIII"] as AccuracyClass[]
      ).map(v => (
        <SelectItem key={v} value={v}>
          {v}
        </SelectItem>
      ))}
    </SelectContent>
  </Select>
</div>


            {/* Active */}
            <div className="flex items-center gap-2">
              <Checkbox
                checked={form.isActive}
                onCheckedChange={v =>
                  setForm(f => ({ ...f, isActive: Boolean(v) }))
                }
              />
              <span>Active</span>
            </div>

            {/* Submit */}
            <div className="flex gap-2">
              <Button
                onClick={submit}
                disabled={loading}
                className="flex-1"
              >
                {loading
                  ? "Saving..."
                  : isEdit
                  ? "Update Product"
                  : "Create Product"}
              </Button>

              {onCancel && (
                <Button
                  type="button"
                  variant="secondary"
                  onClick={onCancel}
                >
                  Cancel
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </>
  );
}
