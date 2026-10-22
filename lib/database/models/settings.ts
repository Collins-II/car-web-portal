// models/Settings.ts
import mongoose from "mongoose"

const SettingsSchema = new mongoose.Schema(
  {
    siteName: String,
    siteEmail: String,
    sitePhone: String,

    logoUrl: String,
    currency: { type: String, default: "ZMW" },

    enableEmails: { type: Boolean, default: true },
    enableSms: { type: Boolean, default: false },

    maintenanceMode: { type: Boolean, default: false },
  },
  { timestamps: true }
)

export default mongoose.models.Settings ||
  mongoose.model("Settings", SettingsSchema)
