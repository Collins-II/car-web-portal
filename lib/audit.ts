// lib/audit.ts
import AuditLog from "@/lib/database/models/audit-log"

export async function logAudit({
  actorId,
  actorName,
  action,
  entity,
  entityId,
  metadata,
  ip,
  userAgent,
}: {
  actorId?: string
  actorName?: string
  action: string
  entity: string
  entityId?: string
  metadata?: Record<string, any>
  ip?: string
  userAgent?: string
}) {
  await AuditLog.create({
    actorId,
    actorName,
    action,
    entity,
    entityId,
    metadata,
    ip,
    userAgent,
  })
}
