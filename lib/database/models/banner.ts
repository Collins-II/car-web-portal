import mongoose, { Schema, Document, Model } from "mongoose";

export interface BannerDocument extends Document {
  title: string;
  subtitle?: string;
  image: string;
  link?: string;
  position: number;
  isActive: boolean;
  startAt?: Date;
  endAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const BannerSchema = new Schema<BannerDocument>(
  {
    title: { type: String, required: true, trim: true },
    subtitle: { type: String },
    image: { type: String, required: true },
    link: { type: String },
    position: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },

    // 🔥 Scheduler
    startAt: { type: Date },
    endAt: { type: Date }
  },
  { timestamps: true }
);

export const Banner: Model<BannerDocument> =
  mongoose.models.Banner || mongoose.model("Banner", BannerSchema);
