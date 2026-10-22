// models/AuditLog.ts
import mongoose, { Schema, Document } from "mongoose"

export interface IAuditLog extends Document {
  actorId?: string
  actorName?: string
  action: string
  entity: string
  entityId?: string
  metadata?: Record<string, any>
  ip?: string
  userAgent?: string
  createdAt: Date
}

const AuditLogSchema = new Schema<IAuditLog>(
  {
    actorId: String,
    actorName: String,

    action: { type: String, required: true, index: true },
    entity: { type: String, required: true, index: true },
    entityId: String,

    metadata: Schema.Types.Mixed,

    ip: String,
    userAgent: String,
  },
  { timestamps: { createdAt: true, updatedAt: false } }
)

export default mongoose.models.AuditLog ||
  mongoose.model<IAuditLog>("AuditLog", AuditLogSchema)
