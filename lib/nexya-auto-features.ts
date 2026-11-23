/**
 * Origem no código de cada bloco de funcionalidades do NEXYA Auto (textos em i18n/messages/*.ts,
 * nexyaAuto.features, mesma ordem; aprovados em 2026-11-21).
 * Integração fiscal e importação de dados ficam FORA por decisão do Eduardo.
 */
export const nexyaAutoFeatureSources = [
  "VehicleCheckIn, VehicleInspectionPhoto, VehicleDamage",
  "[CONFIRMAR EM PRODUÇÃO] BudgetPublication, BudgetItemDecision (aprovação pelo link público)",
  "ServiceOrder, VehicleDelivery, ServiceOrderEditAudit",
  "[CONFIRMAR EM PRODUÇÃO] VehicleHistoryPublication (histórico compartilhado)",
  "Appointment",
  "Part, PartPhoto, Purchase, Supplier, StockMovement",
  "FinancialEntry, FinancialCategory, reports",
  "Membership, MembershipPermission, Invitation",
  "[CONFIRMAR EM PRODUÇÃO] backend/src/documents (documentos em PDF)",
] as const;
