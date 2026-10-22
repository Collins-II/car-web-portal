import mongoose, { Schema, Document, Types } from "mongoose";

/* ------------------------------------------------------------
   🧠 Category Interface
------------------------------------------------------------ */
export interface ICategory extends Document {
  name: string;
  slug: string;
  description?: string;

  /** Hierarchy */
  parent?: Types.ObjectId | null;

  /** Visuals */
  image?: string; // Cloudinary / CDN URL
  icon?: string;  // emoji or icon key

  /** Control */
  isActive: boolean;
  position: number; // ordering in UI

  /** Relations */
  productsCount: number; // scalable replacement for products[]

  /** SEO */
  seo?: {
    title?: string;
    description?: string;
  };

  createdAt: Date;
  updatedAt: Date;
}

/* ------------------------------------------------------------
   🧱 Schema
------------------------------------------------------------ */
const CategorySchema = new Schema<ICategory>(
  {
    /* Core */
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 120,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    description: {
      type: String,
      trim: true,
      maxlength: 500,
    },

    /* Hierarchy */
    parent: {
      type: Schema.Types.ObjectId,
      ref: "Category",
      default: null,
      index: true,
    },

    /* Visuals */
    image: {
      type: String,
      default: undefined,
    },
    icon: {
      type: String,
      default: undefined,
      maxlength: 10,
    },

    /* Control */
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
    position: {
      type: Number,
      default: 0,
      index: true,
    },

    /* Relations (scalable) */
    productsCount: {
      type: Number,
      default: 0,
      min: 0,
    },

    /* SEO */
    seo: {
      title: { type: String, trim: true, maxlength: 70 },
      description: { type: String, trim: true, maxlength: 160 },
    },
  },
  { timestamps: true }
);

/* ------------------------------------------------------------
   🔒 Validation Rules
------------------------------------------------------------ */
CategorySchema.pre("save", function (next) {
  if (this.image && this.icon) {
    return next(
      new Error("Category can have either an image or an icon, not both")
    );
  }
  next();
});

/* ------------------------------------------------------------
   ⚡ Indexes
------------------------------------------------------------ */
CategorySchema.index({ parent: 1, position: 1 });
CategorySchema.index({ isActive: 1 });
CategorySchema.index({ slug: 1 }, { unique: true });

/* ------------------------------------------------------------
   🚀 Export
------------------------------------------------------------ */
export default mongoose.models.Category ||
  mongoose.model<ICategory>("Category", CategorySchema);