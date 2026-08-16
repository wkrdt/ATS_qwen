import type { DB } from "../types";
import { uid } from "../lib/utils";

const DAY = 24 * 3600 * 1000;

export function buildSeed(): DB {
  const now = Date.now();
  const t = (daysAgo: number, hourShift = 0) => now - daysAgo * DAY - hourShift * 3600 * 1000;

  const cNorth = { id: uid("c"), name: "Northwind Robotics", address: "Wilhelminenhofstr. 76, 12459 Berlin, Germany", contact: "Greta Hoffmann", website: "https://northwindrobotics.eu", createdAt: t(46), updatedAt: t(12) };
  const cKopi = { id: uid("c"), name: "Kopi Kultur Group", address: "Jl. Senopati No. 41, Kebayoran Baru, Jakarta Selatan 12190", contact: "Bimo Adjie", website: "https://kopikultur.id", createdAt: t(38), updatedAt: t(20) };
  const cHarbor = { id: uid("c"), name: "Harbor & Lane Logistics", address: "71 Robinson Road, #14-01, Singapore 068895", contact: "Melissa Tan", website: "https://harborlane.sg", createdAt: t(29), updatedAt: t(6) };
  const cBlue = { id: uid("c"), name: "Bluefin Analytics", address: "Level 3, 185 Elizabeth St, Sydney NSW 2000, Australia", contact: "Oliver Grant", website: "https://bluefinanalytics.com.au", createdAt: t(17), updatedAt: t(2) };

  const pMech = { id: uid("p"), companyId: cNorth.id, title: "Senior Mechanical Engineer", type: "Full-time" as const, status: "Open" as const, salary: "€78k – €92k", openedAt: t(30), createdAt: t(30), updatedAt: t(4) };
  const pVision = { id: uid("p"), companyId: cNorth.id, title: "Machine Vision Specialist", type: "Contract" as const, status: "Open" as const, salary: "€650/day", openedAt: t(18), createdAt: t(18), updatedAt: t(8) };
  const pBarista = { id: uid("p"), companyId: cKopi.id, title: "Head Barista Trainer", type: "Full-time" as const, status: "Filled" as const, salary: "IDR 12 – 15jt", openedAt: t(34), createdAt: t(34), updatedAt: t(9) };
  const pSupply = { id: uid("p"), companyId: cHarbor.id, title: "Supply Chain Analyst", type: "Full-time" as const, status: "Open" as const, salary: "SGD 6.5 – 8k", openedAt: t(21), createdAt: t(21), updatedAt: t(3) };
  const pOps = { id: uid("p"), companyId: cHarbor.id, title: "Warehouse Ops Manager", type: "Full-time" as const, status: "On Hold" as const, salary: "SGD 8 – 9.5k", openedAt: t(25), createdAt: t(25), updatedAt: t(5) };
  const pFull = { id: uid("p"), companyId: cBlue.id, title: "Full-Stack Engineer (React)", type: "Contract" as const, status: "Open" as const, salary: "AUD 900/day", openedAt: t(11), createdAt: t(11), updatedAt: t(1) };
  const pCS = { id: uid("p"), companyId: cBlue.id, title: "Customer Success Lead", type: "Part-time" as const, status: "Cancelled" as const, salary: "AUD 55k pro-rata", openedAt: t(15), createdAt: t(15), updatedAt: t(7) };

  const candidates = [
    { id: uid("k"), name: "Lukas Brenner", email: "lukas.brenner@mailbox.de", phone: "+49 171 555 0192", positionId: pMech.id, stage: "Interview" as const, source: "LinkedIn", note: "8 yrs in automation, led a 4-person design team. Wants hybrid Berlin.", createdAt: t(16), updatedAt: t(1) },
    { id: uid("k"), name: "Priya Nair", email: "priya.nair@proton.me", phone: "+91 98 4455 2210", positionId: pVision.id, stage: "Screened" as const, source: "Referral", note: "Referred by Greta. Strong OpenCV + Python, open to contract.", createdAt: t(9), updatedAt: t(2) },
    { id: uid("k"), name: "Aisyah Putri", email: "aisyah.putri@gmail.com", phone: "+62 812 9001 3345", positionId: pSupply.id, stage: "Offer" as const, source: "Job Board", note: "Offer extended SGD 7.2k — awaiting response by Friday.", createdAt: t(14), updatedAt: t(0, 5) },
    { id: uid("k"), name: "Tom Westbrook", email: "t.westbrook@outlook.com", phone: "+61 412 660 987", positionId: pFull.id, stage: "Sourced" as const, source: "LinkedIn", note: "", createdAt: t(3), updatedAt: t(3) },
    { id: uid("k"), name: "Sari Wulandari", email: "sari.wulan@yahoo.com", phone: "+62 813 7788 1290", positionId: pBarista.id, stage: "Placed" as const, source: "Talent Pool", note: "Placed 9 days ago. Check-in call scheduled for week 4.", createdAt: t(26), updatedAt: t(9) },
    { id: uid("k"), name: "Daniel Okafor", email: "d.okafor@gmail.com", phone: "+65 8231 4409", positionId: pSupply.id, stage: "Interview" as const, source: "Direct", note: "Second interview with ops director next Tuesday.", createdAt: t(12), updatedAt: t(2, 6) },
    { id: uid("k"), name: "Hannah Lindqvist", email: "hannah.l@fastmail.com", phone: "", positionId: pMech.id, stage: "Sourced" as const, source: "LinkedIn", note: "Passive — happy in current role but curious about robotics.", createdAt: t(5), updatedAt: t(5) },
    { id: uid("k"), name: "Marcus Chen", email: "marcus.chen@gmail.com", phone: "+65 9111 7743", positionId: pOps.id, stage: "Screened" as const, source: "Referral", note: "Referral from Melissa. 6 yrs warehouse ops, SAP EWM.", createdAt: t(8), updatedAt: t(4) },
    { id: uid("k"), name: "Elif Kaya", email: "elif.kaya@web.de", phone: "+49 160 224 8873", positionId: pVision.id, stage: "Rejected" as const, source: "Job Board", note: "Not enough production-deployment experience. Keep warm for Q3.", createdAt: t(19), updatedAt: t(6) },
    { id: uid("k"), name: "Ravi Menon", email: "ravi.menon@icloud.com", phone: "+61 433 208 115", positionId: pFull.id, stage: "Sourced" as const, source: "Referral", note: "", createdAt: t(1), updatedAt: t(1) },
  ];

  const activity = [
    { id: uid("a"), kind: "candidate" as const, message: "Aisyah Putri moved to Offer — Supply Chain Analyst", at: t(0, 5) },
    { id: uid("a"), kind: "sync" as const, message: "Workspace snapshot saved locally", at: t(0, 8) },
    { id: uid("a"), kind: "position" as const, message: "Full-Stack Engineer (React) opened at Bluefin Analytics", at: t(1) },
    { id: uid("a"), kind: "candidate" as const, message: "Daniel Okafor moved to Interview — Supply Chain Analyst", at: t(2, 6) },
    { id: uid("a"), kind: "candidate" as const, message: "Ravi Menon sourced via Referral", at: t(1, 3) },
    { id: uid("a"), kind: "company" as const, message: "Bluefin Analytics added as a client", at: t(17) },
    { id: uid("a"), kind: "candidate" as const, message: "Sari Wulandari placed — Head Barista Trainer", at: t(9) },
  ].sort((a, b) => b.at - a.at);

  return {
    companies: [cNorth, cKopi, cHarbor, cBlue],
    positions: [pMech, pVision, pBarista, pSupply, pOps, pFull, pCS],
    candidates,
    activity,
  };
}

export const EMPTY_DB: DB = { companies: [], positions: [], candidates: [], activity: [] };
