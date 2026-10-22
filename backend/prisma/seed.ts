/* ============================================================
   Bhowanee - Database Seed Script
   Populates development data matching the existing frontend data.js
   Run: npx prisma db seed
   ============================================================ */

import { PrismaClient, UserRole, ContractStage, LotStatus } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();
const SALT_ROUNDS = 12;

async function main() {
  console.log('🌱 Seeding Bhowanee database...');

  // Idempotency: skip if already seeded
  const existingUser = await prisma.user.findFirst();
  if (existingUser) {
    console.log('Database already contains records. Skipping seed.');
    return;
  }

  // ── Districts ─────────────────────────────────────────────
  const districts = [
    { id: 'nashik', name: 'Nashik', region: 'north' },
    { id: 'sambhajinagar', name: 'Sambhajinagar', region: 'marathwada' },
    { id: 'amravati', name: 'Amravati', region: 'vidarbha' },
    { id: 'nagpur', name: 'Nagpur', region: 'east' },
    { id: 'thane', name: 'Thane', region: 'konkan' },
    { id: 'pune', name: 'Pune', region: 'west' },
    { id: 'latur', name: 'Latur', region: 'marathwada' },
    { id: 'kolhapur', name: 'Kolhapur', region: 'south' },
    { id: 'solapur', name: 'Solapur', region: 'central' },
  ];

  for (const d of districts) {
    await prisma.district.upsert({ where: { id: d.id }, update: {}, create: d });
  }

  // ── Blocks ────────────────────────────────────────────────
  const dindori = await prisma.block.upsert({
    where: { id: 'block-dindori' },
    update: {},
    create: { id: 'block-dindori', name: 'Dindori', districtId: 'nashik' },
  });

  // ── Users ─────────────────────────────────────────────────
  const passwordHash = await bcrypt.hash('password123', SALT_ROUNDS);

  const farmer1 = await prisma.user.upsert({
    where: { phone: '9876543210' },
    update: {},
    create: { name: 'Prakash Sonawane', phone: '9876543210', role: UserRole.FARMER, lang: 'mr', blockId: dindori.id, districtId: 'nashik' },
  });
  const farmer2 = await prisma.user.upsert({
    where: { phone: '8765432109' },
    update: {},
    create: { name: 'Sushila Ahire', phone: '8765432109', role: UserRole.FARMER, lang: 'mr', blockId: dindori.id, districtId: 'nashik' },
  });
  const farmer3 = await prisma.user.upsert({
    where: { phone: '7654321098' },
    update: {},
    create: { name: 'Raju Patil', phone: '7654321098', role: UserRole.FARMER, lang: 'en', blockId: dindori.id, districtId: 'nashik' },
  });
  const farmer4 = await prisma.user.upsert({
    where: { phone: '9988776655' },
    update: {},
    create: { name: 'Meena Bhosale', phone: '9988776655', role: UserRole.FARMER, lang: 'mr', blockId: dindori.id, districtId: 'nashik' },
  });
  const farmer5 = await prisma.user.upsert({
    where: { phone: '8899001122' },
    update: {},
    create: { name: 'Dnyaneshwar Jadhav', phone: '8899001122', role: UserRole.FARMER, lang: 'mr', blockId: dindori.id, districtId: 'nashik' },
  });
  const farmer6 = await prisma.user.upsert({
    where: { phone: '9000112233' },
    update: {},
    create: { name: 'Savita Gaikwad', phone: '9000112233', role: UserRole.FARMER, lang: 'mr', blockId: dindori.id, districtId: 'nashik' },
  });

  const blockAdmin = await prisma.user.upsert({
    where: { phone: '9999888877' },
    update: {},
    create: { name: 'Admin Dindori', phone: '9999888877', role: UserRole.BLOCK_ADMIN, blockId: dindori.id, districtId: 'nashik' },
  });

  const buyer1 = await prisma.user.upsert({
    where: { email: 'anil@freshco.in' },
    update: {},
    create: { name: 'Anil Merchant', email: 'anil@freshco.in', passwordHash, role: UserRole.BUYER },
  });
  const buyer2 = await prisma.user.upsert({
    where: { email: 'buyer.b@example.com' },
    update: {},
    create: { name: 'Buyer B', email: 'buyer.b@example.com', passwordHash, role: UserRole.BUYER },
  });
  const buyer3 = await prisma.user.upsert({
    where: { email: 'buyer.c@example.com' },
    update: {},
    create: { name: 'Buyer C', email: 'buyer.c@example.com', passwordHash, role: UserRole.BUYER },
  });

  const investor = await prisma.user.upsert({
    where: { email: 'priya@capital.in' },
    update: {},
    create: { name: 'Priya Capital', email: 'priya@capital.in', passwordHash, role: UserRole.INVESTOR },
  });

  const logistics = await prisma.user.upsert({
    where: { email: 'logistics@bhowanee.in' },
    update: {},
    create: { name: 'Logistics Partner', email: 'logistics@bhowanee.in', passwordHash, role: UserRole.LOGISTICS },
  });

  const storage = await prisma.user.upsert({
    where: { email: 'storage@bhowanee.in' },
    update: {},
    create: { name: 'Storage Partner', email: 'storage@bhowanee.in', passwordHash, role: UserRole.STORAGE },
  });

  const superAdmin = await prisma.user.upsert({
    where: { email: 'admin@bhowanee.in' },
    update: {},
    create: { name: 'Super Admin', email: 'admin@bhowanee.in', passwordHash, role: UserRole.TEAM },
  });

  // ── Contracts ─────────────────────────────────────────────
  const c1 = await prisma.contract.create({
    data: {
      farmerId: farmer1.id, blockId: dindori.id, village: 'Pimpalgaon', district: 'nashik',
      crop: 'Onion', area: 2.4, gat: '125', stage: ContractStage.BIDS,
      leaseStart: new Date('2025-11-01'), leaseEnd: new Date('2026-06-30'),
      planSow: new Date('2025-11-10'), planHarvest: new Date('2026-04-20'),
      notes: 'Good soil moisture. Expected Grade A output.',
      tasks: { create: [
        { label: 'Sowing', due: new Date('2025-11-10'), done: true },
        { label: 'First irrigation', due: new Date('2025-12-05'), done: true },
        { label: 'Fertiliser', due: new Date('2026-01-10'), done: true },
        { label: 'Second irrigation', due: new Date('2026-02-15'), done: false },
        { label: 'Harvest', due: new Date('2026-04-20'), done: false },
      ]},
      costs: { create: [
        { type: 'Seeds', amount: 4200, date: new Date('2025-11-08') },
        { type: 'Fertiliser', amount: 3100, date: new Date('2026-01-10') },
        { type: 'Labour', amount: 2800, date: new Date('2025-11-10') },
      ]},
    },
  });

  const c2 = await prisma.contract.create({
    data: {
      farmerId: farmer2.id, blockId: dindori.id, village: 'Pimpalgaon', district: 'nashik',
      crop: 'Onion', area: 1.8, gat: '123', stage: ContractStage.HARVEST,
      leaseStart: new Date('2025-11-01'), leaseEnd: new Date('2026-06-30'),
      notes: 'Issue flagged: water shortage.',
      tasks: { create: [
        { label: 'Sowing', due: new Date('2025-11-12'), done: true },
        { label: 'Harvest', due: new Date('2026-04-25'), done: false },
      ]},
      costs: { create: [
        { type: 'Seeds', amount: 3100, date: new Date('2025-11-10') },
        { type: 'Labour', amount: 2200, date: new Date('2025-11-12') },
      ]},
    },
  });

  const c3 = await prisma.contract.create({
    data: {
      farmerId: farmer3.id, blockId: dindori.id, village: 'Wadgaon', district: 'nashik',
      crop: 'Tomato', area: 1.2, gat: '128', stage: ContractStage.GROWING,
      leaseStart: new Date('2026-01-01'), leaseEnd: new Date('2026-08-31'),
      tasks: { create: [{ label: 'Sowing', due: new Date('2026-01-15'), done: true }] },
      costs: { create: [{ type: 'Seeds', amount: 2800, date: new Date('2026-01-12') }] },
    },
  });

  await prisma.contract.create({
    data: {
      farmerId: farmer4.id, blockId: dindori.id, village: 'Wadgaon', district: 'nashik',
      crop: 'Soybean', area: 3.0, gat: '129', stage: ContractStage.GROWING,
      leaseStart: new Date('2025-06-01'), leaseEnd: new Date('2026-03-31'),
      costs: { create: [
        { type: 'Seeds', amount: 5800, date: new Date('2025-06-18') },
        { type: 'Fertiliser', amount: 4100, date: new Date('2025-07-10') },
      ]},
    },
  });

  const c5 = await prisma.contract.create({
    data: {
      farmerId: farmer5.id, blockId: dindori.id, village: 'Pimpalgaon', district: 'nashik',
      crop: 'Onion', area: 2.0, gat: '66', stage: ContractStage.ISSUE,
      notes: 'Crop damage from hailstorm.',
      costs: { create: [{ type: 'Seeds', amount: 3800, date: new Date('2025-11-12') }] },
    },
  });

  await prisma.contract.create({
    data: {
      farmerId: farmer6.id, blockId: dindori.id, village: 'Wadgaon', district: 'nashik',
      crop: 'Pulses', area: 1.5, gat: '47', stage: ContractStage.NOT_SOWN,
      notes: 'Lease signed. Waiting for sowing.',
    },
  });

  // ── Lots ──────────────────────────────────────────────────
  const l1 = await prisma.lot.create({
    data: { contractId: c1.id, grade: 'A', weightQt: 12, farmerPrice: 2100, status: LotStatus.OPEN, listedAt: new Date('2026-03-01') },
  });
  const l2 = await prisma.lot.create({
    data: { contractId: c2.id, grade: 'B', weightQt: 8, farmerPrice: 1900, status: LotStatus.OPEN, listedAt: new Date('2026-03-03') },
  });

  // ── Bids ──────────────────────────────────────────────────
  const bidData = [
    { lotId: l1.id, buyerId: buyer1.id, price: 1750, createdAt: new Date('2026-03-02T10:00:00Z') },
    { lotId: l1.id, buyerId: buyer2.id, price: 1740, createdAt: new Date('2026-03-02T10:30:00Z') },
    { lotId: l1.id, buyerId: buyer1.id, price: 1800, createdAt: new Date('2026-03-02T11:00:00Z') },
    { lotId: l1.id, buyerId: buyer3.id, price: 1930, createdAt: new Date('2026-03-02T13:00:00Z') },
    { lotId: l1.id, buyerId: buyer2.id, price: 1900, createdAt: new Date('2026-03-02T14:00:00Z') },
    { lotId: l1.id, buyerId: buyer1.id, price: 1980, createdAt: new Date('2026-03-03T09:00:00Z') },
    { lotId: l1.id, buyerId: buyer3.id, price: 2040, createdAt: new Date('2026-03-03T11:00:00Z') },
    { lotId: l2.id, buyerId: buyer2.id, price: 1750, createdAt: new Date('2026-03-04T10:00:00Z') },
    { lotId: l2.id, buyerId: buyer1.id, price: 1820, createdAt: new Date('2026-03-04T12:00:00Z') },
  ];
  for (const b of bidData) {
    await prisma.bid.create({ data: b });
  }

  // ── Plans ─────────────────────────────────────────────────
  const p1 = await prisma.plan.create({ data: { name: 'Onion, rabi season', term: '5 months', termMonths: 5, risk: 'Higher', riskScore: 3, demandSold: 70, expectedReturn: '14 to 18%', expectedReturnPct: 16, minInvestment: 25000, status: 'OPEN', note: 'One crop, one season, 70% sold before planting.', buyers: ['Maharashtra FPO Traders', 'National Cold Chain Ltd'] } });
  const p2 = await prisma.plan.create({ data: { name: 'Mixed pulses and grains', term: '18 months', termMonths: 18, risk: 'Lower', riskScore: 1, demandSold: 85, expectedReturn: '9 to 11%', expectedReturnPct: 10, minInvestment: 50000, status: 'OPEN', buyers: ['Agri Commodity Exchange', 'State Warehouse Corp'], timelinePayout: new Date('2027-12-15') } });
  const p3 = await prisma.plan.create({ data: { name: 'Tomato and soybean', term: '10 months', termMonths: 10, risk: 'Medium', riskScore: 2, demandSold: 60, expectedReturn: '11 to 14%', expectedReturnPct: 12.5, minInvestment: 25000, status: 'CLOSING_SOON', buyers: ['Fresh Mart Supply Co'], timelinePayout: new Date('2027-03-30') } });
  const p4 = await prisma.plan.create({ data: { name: 'Sugarcane, second cut', term: '12 months', termMonths: 12, risk: 'Lower', riskScore: 1, demandSold: 95, expectedReturn: '8 to 10%', expectedReturnPct: 9, minInvestment: 50000, status: 'FULL', buyers: ['Shree Warana Sugar Factory'] } });

  // ── Investments ───────────────────────────────────────────
  await prisma.investment.createMany({ data: [
    { planId: p2.id, investorId: investor.id, amount: 100000, stage: 'Growing', projectedReturn: 110000, nextPayout: new Date('2027-12-15') },
    { planId: p3.id, investorId: investor.id, amount: 50000, stage: 'Growing', projectedReturn: 56250, nextPayout: new Date('2027-03-30') },
    { planId: p4.id, investorId: investor.id, amount: 75000, stage: 'Closed', projectedReturn: 82500, actualReturn: 82500, nextPayout: new Date('2026-11-01') },
  ]});

  // ── Warehouses ────────────────────────────────────────────
  const w1 = await prisma.warehouse.create({ data: { name: 'Dindori Cold Store', lat: 20.20, lng: 73.83, capacityQt: 5000, usedQt: 4100, contact: '9876543000' } });
  const w2 = await prisma.warehouse.create({ data: { name: 'Nashik Hub Warehouse', lat: 19.99, lng: 73.79, capacityQt: 8000, usedQt: 2900, contact: '9876543001' } });
  await prisma.warehouse.create({ data: { name: 'Pimpalgaon Storage', lat: 20.33, lng: 73.82, capacityQt: 2000, usedQt: 800, contact: '9876543002' } });

  // ── Pickups ───────────────────────────────────────────────
  await prisma.pickup.createMany({ data: [
    { lotId: l1.id, contractId: c1.id, farm: 'Gat 118, Pimpalgaon', warehouseId: w1.id, scheduledAt: new Date('2026-04-22T07:00:00Z'), status: 'SCHEDULED', vehicle: 'MH-15-AB-1234' },
    { lotId: l2.id, contractId: c2.id, farm: 'Gat 147, Pimpalgaon', warehouseId: w2.id, scheduledAt: new Date('2026-04-23T08:00:00Z'), status: 'PENDING' },
  ]});

  // ── Handoffs ──────────────────────────────────────────────
  await prisma.handoff.create({ data: { lotId: l1.id, from: 'Farm (Gat 118)', to: 'Dindori Cold Store', weightQt: 12, confirmedBy: 'Block Admin' } });

  // ── Disputes ──────────────────────────────────────────────
  await prisma.dispute.createMany({ data: [
    { contractId: c1.id, type: 'Quality', description: 'Buyer C reports 10% of lot is Grade B, not Grade A.', raisedById: buyer3.id, owner: 'Super Admin' },
    { contractId: c5.id, type: 'Crop damage', description: 'Hailstorm on March 15 damaged approximately 40% of standing crop.', raisedById: blockAdmin.id, owner: 'Super Admin' },
  ]});

  // ── Payments ──────────────────────────────────────────────
  await prisma.payment.createMany({ data: [
    { contractId: c1.id, lotId: l1.id, amount: 24480, fromName: 'Buyer C', toName: 'Prakash Sonawane', status: 'SETTLED', settledAt: new Date('2026-03-21') },
    { contractId: c3.id, amount: 8400, fromName: 'Bhowanee', toName: 'Raju Patil', status: 'PENDING' },
  ]});

  // ── Compliance ────────────────────────────────────────────
  await prisma.complianceItem.createMany({ data: [
    { contractId: c1.id, type: 'Lease renewal', dueDate: new Date('2026-06-30'), status: 'Active', notes: '7 months remaining' },
    { contractId: c2.id, type: 'Land ceiling check', dueDate: new Date('2026-05-15'), status: 'Pending', notes: 'Awaiting district record' },
    { contractId: c5.id, type: 'Crop insurance claim', dueDate: new Date('2026-04-01'), status: 'Urgent', notes: 'Hailstorm damage - file within 15 days' },
  ]});

  // ── KYC Queue ─────────────────────────────────────────────
  await prisma.kycSubmission.createMany({ data: [
    { userId: buyer1.id, role: 'Buyer', status: 'PENDING' },
    { userId: investor.id, role: 'Investor', status: 'PENDING' },
  ]});

  // ── Audit Trail ───────────────────────────────────────────
  await prisma.auditEntry.createMany({ data: [
    { actorId: blockAdmin.id, action: 'Set price ₹2,100 on Gat 118 onion lot', forFarmer: 'Prakash Sonawane', confirmed: 'Farmer, by SMS reply 1' },
    { actorId: blockAdmin.id, action: 'Listed lot - Onion, 12 quintal, Grade A', forFarmer: 'Prakash Sonawane', confirmed: 'Farmer, by SMS reply 1' },
    { actorId: blockAdmin.id, action: 'Accepted bid ₹2,040 from Buyer C', forFarmer: 'Prakash Sonawane', confirmed: 'Farmer, by voice call' },
  ]});

  // ── District Stats ────────────────────────────────────────
  const districtStats = [
    { districtId: 'nashik', contracts: 312, farmers: 690, acres: 1420, openBids: 14, disputes: 2, demandQt: 18000, supplyQt: 14200 },
    { districtId: 'sambhajinagar', contracts: 148, farmers: 320, acres: 700, openBids: 6, disputes: 1, demandQt: 9000, supplyQt: 7800 },
    { districtId: 'amravati', contracts: 76, farmers: 160, acres: 380, openBids: 3, disputes: 0, demandQt: 4500, supplyQt: 4200 },
    { districtId: 'nagpur', contracts: 44, farmers: 90, acres: 210, openBids: 1, disputes: 0, demandQt: 2800, supplyQt: 2200 },
    { districtId: 'thane', contracts: 21, farmers: 45, acres: 90, openBids: 0, disputes: 0, demandQt: 1200, supplyQt: 900 },
    { districtId: 'pune', contracts: 265, farmers: 590, acres: 1210, openBids: 11, disputes: 1, demandQt: 15000, supplyQt: 11800 },
    { districtId: 'latur', contracts: 97, farmers: 210, acres: 450, openBids: 4, disputes: 0, demandQt: 6000, supplyQt: 5200 },
    { districtId: 'kolhapur', contracts: 183, farmers: 400, acres: 860, openBids: 7, disputes: 1, demandQt: 10500, supplyQt: 9200 },
    { districtId: 'solapur', contracts: 122, farmers: 270, acres: 560, openBids: 5, disputes: 0, demandQt: 7500, supplyQt: 6800 },
  ];
  for (const s of districtStats) {
    await prisma.districtStats.upsert({
      where: { districtId: s.districtId },
      update: s,
      create: { id: `stats-${s.districtId}`, ...s },
    });
  }

  console.log('✅ Seed complete!');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
