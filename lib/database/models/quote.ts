import { Schema, model, models, Document } from "mongoose"

export interface IQuote extends Document {
  productId?: string
  productName?: string
  name: string
  email: string
  phone: string
  message?: string
  status: "new" | "contacted" | "closed"
  createdAt: Date
}

const QuoteSchema = new Schema<IQuote>(
  {
    productId: String,
    productName: String,
    name: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String, required: true },
    message: String,
    status: {
      type: String,
      enum: ["new", "contacted", "closed"],
      default: "new",
    },
  },
  { timestamps: true }
)

export const Quote =
  models.Quote || model<IQuote>("Quote", QuoteSchema)
