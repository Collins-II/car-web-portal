import mongoose, { Schema, Document, Model } from "mongoose";

export interface HeroDocument extends Document {
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

const HeroSchema = new Schema<HeroDocument>(
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

export const Hero: Model<HeroDocument> =
  mongoose.models.Hero || mongoose.model("Hero", HeroSchema);
