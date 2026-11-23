import { readFileSync, writeFileSync } from 'node:fs';
const f = new URL('data.json', import.meta.url);
const d = JSON.parse(readFileSync(f, 'utf8'));
const now = '2026-11-23T13:00:00.000Z';
const people = ['Ana Exemplo', 'Bruno Exemplo', 'Carla Exemplo', 'Diego Exemplo', 'Elisa Exemplo', 'Fábio Exemplo', 'Gabi Exemplo', 'Hugo Exemplo'];
const cars = [['Fiat', 'Argo'], ['VW', 'Gol'], ['Chevrolet', 'Onix'], ['Toyota', 'Corolla'], ['Hyundai', 'HB20'], ['Renault', 'Kwid'], ['Honda', 'Civic'], ['Jeep', 'Renegade']];
const cust = (i) => ({ id: `cust-${i}`, number: 100 + i, name: people[i], cpfCnpj: null, phone: '(00) 00000-0000', phone2: null, whatsapp: true });
const veh = (i) => ({ id: `veh-${i}`, plate: `DEM${i}A0${i}`, brand: cars[i][0], model: cars[i][1], currentKm: 30000 + i * 7350 });
const day = (i) => new Date(Date.parse(now) - i * 86400000).toISOString();
const soStatus = ['OPEN', 'IN_PROGRESS', 'IN_PROGRESS', 'COMPLETED', 'DELIVERED', 'OPEN', 'COMPLETED', 'DELIVERED'];
const totals = [480, 1250, 890, 2140, 360, 720, 1580, 940];
const so = soStatus.map((status, i) => ({ id: `so-${i}`, organizationId: 'org-demo', number: 1201 + i, legacyNumber: null, customerId: `cust-${i}`, vehicleId: `veh-${i}`, status, date: day(i), warrantyDays: 90, currentKm: veh(i).currentKm, subtotal: totals[i], discountType: null, discountValue: null, discountAmount: 0, total: totals[i], amountPaid: status === 'DELIVERED' ? totals[i] : 0, amountOpen: status === 'DELIVERED' ? 0 : totals[i], financialStatus: status === 'DELIVERED' ? 'PAID' : 'OPEN', createdAt: day(i), updatedAt: day(i), completedAt: null, canceledAt: null, approved: status !== 'OPEN', approvedAt: null, customer: cust(i), vehicle: veh(i) }));
const bStatus = ['DRAFT', 'APPROVED', 'PARTIALLY_APPROVED', 'CONVERTED', 'DRAFT', 'APPROVED'];
const budgets = bStatus.map((status, i) => ({ id: `bud-${i}`, organizationId: 'org-demo', number: 501 + i, customerId: `cust-${i + 1}`, vehicleId: `veh-${i + 1}`, date: day(i), warrantyDays: 90, status, subtotal: totals[i] + 200, discountType: null, discountValue: null, discountAmount: 0, total: totals[i] + 200, approvedAt: null, createdAt: day(i), updatedAt: day(i), customer: cust(i + 1), vehicle: veh(i + 1), archivedAt: null, parentBudgetId: null, rootBudgetId: null, versionNumber: 1, approvedAmount: status === 'DRAFT' ? 0 : totals[i], paidAmount: 0, remainingAmount: totals[i], paymentStatus: 'UNPAID' }));
Object.assign(d, {
  'GET /api/organizations/current': { id: 'org-demo', name: 'Oficina Exemplo', slug: 'oficina-exemplo', isActive: true, timezone: 'America/Sao_Paulo', role: 'OWNER', hasLogo: false, hasDocumentLogo: false, useSystemLogoForDocuments: true, legalName: null, document: null, phone: null, whatsapp: null, email: null, postalCode: null, street: null, numberAddress: null, complement: null, neighborhood: null, city: null, state: null },
  'GET /api/billing-account/current': { id: 'ba-demo', name: 'Oficina Exemplo', allowedOrganizations: 1, usedOrganizations: 1, unitPrice: 0, calculatedMonthlyAmount: 0, negotiatedMonthlyAmount: null, effectiveMonthlyAmount: 0, isFree: true, status: 'ACTIVE' },
  'GET /api/subscription': { calendar: null, id: 'sub-demo', billingAccountId: 'ba-demo', status: 'ACTIVE', startedAt: day(60), trialStartedAt: null, trialEndsAt: null, currentPeriodStart: day(20), currentPeriodEnd: day(-10), nextDueDate: day(-10), billingDay: 10, graceDays: 5, canceledAt: null, blockedAt: null, unitPrice: 0, allowedOrganizations: 1, usedOrganizations: 1, negotiatedMonthlyAmount: null, isFree: true, effectiveMonthlyAmount: 0, standardMonthlyAmount: 0, currentPayment: null },
  'GET /api/notifications': { items: [], total: 0, unread: 0, page: 1, limit: 20 },
  'GET /api/service-orders': { items: so, total: so.length, page: 1, limit: 20 },
  'GET /api/budgets': { items: budgets, total: budgets.length, page: 1, limit: 20 },
});
writeFileSync(f, JSON.stringify(d, null, 1));
