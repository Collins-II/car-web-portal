import mongoose, { Schema, Document, Model } from "mongoose";

/* ------------------------------------------------------------
   Types
------------------------------------------------------------ */

export type ScaleCategoryType =
  | "Retail"
  | "Laboratory"
  | "Industrial"
  | "Medical"
  | "Agricultural";

export type ScaleType =
  /* -------- Retail -------- */
  | "Price Computing Scale"
  | "Counter Scale"
  | "Platform Scale"
  | "Hanging Scale"
  | "Label Printing Scale"
  | "POS Integrated Scale"
  | "Jewelry Scale"
  | "Pocket Scale"
  | "Postal Scale"
  | "Luggage Scale"

  /* -------- Laboratory -------- */
  | "Analytical Balance"
  | "Precision Balance"
  | "Micro Balance"
  | "Moisture Analyzer"
  | "Calibration Balance"

  /* -------- Industrial -------- */
  | "Floor Scale"
  | "Pallet Scale"
  | "Crane Scale"
  | "Forklift Scale"
  | "Hopper Scale"
  | "Checkweigher"
  | "Weighbridge"
  | "Axle Scale"
  | "Portable Vehicle Scale"

  /* -------- Medical -------- */
  | "Patient Scale"
  | "Wheelchair Scale"
  | "Baby Scale"
  | "BMI Scale"

  /* -------- Agricultural -------- */
  | "Livestock Scale"
  | "Grain Scale"
  | "Produce Scale"
  | "Milk Weighing Scale";


export type AccuracyClass =
  | "Class I"
  | "Class II"
  | "Class III"
  | "Class IIII";

export type Certification =
  | "ISO"
  | "OIML"
  | "NTEP"
  | "CE"
  | "GMP";

export interface Variant {
  sku?: string;
  platformSize?: string; // e.g. "300x300mm"
  loadCellCount?: number;
  maxCapacity?: number; // kg
  price?: number;
  stock?: number;
}

export interface ScaleProductDocument extends Document {
  slug: string;
  name: string;

  /** 🔗 Category relationship */
  category: mongoose.Types.ObjectId;
  categorySlug: string;

  scaleType: ScaleType;

  description: string;

  image: string;
  gallery?: string[];

  price: number;
  currency: "ZMW" | "USD";

  features?: string[];

  specifications?: Record<string, string>;
  dimensions?: string;

  /** ⚖️ Scale-specific */
  minCapacity?: number; // kg
  maxCapacity?: number; // kg
  accuracyClass?: AccuracyClass;

  certifications?: Certification[];

  variants?: Variant[];

  /** 📦 Inventory */
  stock: number;
  inStock: boolean;

  tags?: string[];

  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

/* ------------------------------------------------------------
   Schema
------------------------------------------------------------ */

const VariantSchema = new Schema<Variant>(
  {
    sku: String,
    platformSize: String,
    loadCellCount: Number,
    maxCapacity: Number,
    price: Number,
    stock: { type: Number, default: 0 }
  },
  { _id: false }
);

const ScaleProductSchema = new Schema<ScaleProductDocument>(
  {
    slug: {
      type: String,
      required: true,
      unique: true,
      index: true,
      lowercase: true,
      trim: true
    },

    name: {
      type: String,
      required: true,
      trim: true
    },

    /** 🔗 Category linkage */
    category: {
      type: Schema.Types.ObjectId,
      ref: "Category",
      required: true,
      index: true
    },

    categorySlug: {
      type: String,
      required: true,
      index: true,
      lowercase: true
    },

    scaleType: {
      type: String,
      required: true,
      index: true
    },

    description: {
      type: String,
      required: true
    },

    image: {
      type: String,
      required: true
    },

    gallery: {
      type: [String],
      default: []
    },

    price: {
      type: Number,
      required: true,
      min: 0
    },

    currency: {
      type: String,
      enum: ["ZMW", "USD"],
      default: "ZMW"
    },

    features: {
      type: [String],
      default: []
    },

    specifications: {
      type: Map,
      of: String,
      default: {}
    },

    dimensions: String,

    /** ⚖️ Capacity */
    minCapacity: {
      type: Number,
      min: 0
    },

    maxCapacity: {
      type: Number,
      min: 0
    },

    accuracyClass: {
      type: String,
      enum: ["Class I", "Class II", "Class III", "Class IIII"]
    },

    certifications: {
      type: [String],
      enum: ["ISO", "OIML", "NTEP", "CE", "GMP"],
      default: []
    },

    variants: {
      type: [VariantSchema],
      default: []
    },

    /** 📦 Inventory */
    stock: {
      type: Number,
      default: 0,
      min: 0
    },

    inStock: {
      type: Boolean,
      default: true,
      index: true
    },

    tags: {
      type: [String],
      index: true,
      default: []
    },

    isActive: {
      type: Boolean,
      default: true,
      index: true
    }
  },
  { timestamps: true }
);

/* ------------------------------------------------------------
   Hooks
------------------------------------------------------------ */

/**
 * Auto-calculate inStock
 */
ScaleProductSchema.pre("save", function (next) {
  this.inStock = this.stock > 0;
  next();
});

/* ------------------------------------------------------------
   Indexes
------------------------------------------------------------ */

ScaleProductSchema.index({
  name: "text",
  description: "text",
  tags: "text"
});

ScaleProductSchema.index({ category: 1, categorySlug: 1 });

/* ------------------------------------------------------------
   Export
------------------------------------------------------------ */

const ScaleProduct: Model<ScaleProductDocument> =
  mongoose.models.ScaleProduct ||
  mongoose.model<ScaleProductDocument>("ScaleProduct", ScaleProductSchema);

export default ScaleProduct;
