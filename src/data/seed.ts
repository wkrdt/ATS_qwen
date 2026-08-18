import type { DB } from "../types";
import { uid } from "../lib/utils";

const DAY = 24 * 3600 * 1000;

export function buildSeed(): DB {
  const now = Date.now();
  const t = (daysAgo: number, hourShift = 0) => now - daysAgo * DAY - hourShift * 3600 * 1000;
  
  // Indonesian companies
  const cHalliburton = { id: uid("c"), name: "Halliburton", address: "Jakarta, Indonesia", contact: "Recruitment Team", website: "https://www.halliburton.com", createdAt: t(46), updatedAt: t(12) };
  const cIndika = { id: uid("c"), name: "Indika Energy", address: "Jakarta, Indonesia", contact: "HR Department", website: "https://www.indika.co.id", createdAt: t(38), updatedAt: t(20) };
  const cHalodoc = { id: uid("c"), name: "Halodoc", address: "Jakarta, Indonesia", contact: "Talent Acquisition", website: "https://www.halodoc.com", createdAt: t(29), updatedAt: t(6) };
  const cSTS = { id: uid("c"), name: "Senayan Trikarya Sempana", address: "Jakarta, Indonesia", contact: "Sales & HR", website: "https://www.sts-auto.com", createdAt: t(17), updatedAt: t(2) };
  
  // Halliburton positions (10)
  const pHallDrilling = { id: uid("p"), companyId: cHalliburton.id, title: "Drilling Engineer", type: "Full-time" as const, status: "Open" as const, salary: "IDR 25-35jt", openedAt: t(30), createdAt: t(30), updatedAt: t(4) };
  const pHallCompletion = { id: uid("p"), companyId: cHalliburton.id, title: "Completion Engineer", type: "Full-time" as const, status: "Open" as const, salary: "IDR 20-28jt", openedAt: t(25), createdAt: t(25), updatedAt: t(8) };
  const pHallField = { id: uid("p"), companyId: cHalliburton.id, title: "Field Service Representative", type: "Full-time" as const, status: "Open" as const, salary: "IDR 12-18jt", openedAt: t(20), createdAt: t(20), updatedAt: t(5) };
  const pHallHSE = { id: uid("p"), companyId: cHalliburton.id, title: "HSE Specialist", type: "Full-time" as const, status: "Open" as const, salary: "IDR 18-25jt", openedAt: t(18), createdAt: t(18), updatedAt: t(3) };
  const pHallSupply = { id: uid("p"), companyId: cHalliburton.id, title: "Supply Chain Coordinator", type: "Full-time" as const, status: "Open" as const, salary: "IDR 15-22jt", openedAt: t(15), createdAt: t(15), updatedAt: t(2) };
  const pHallMech = { id: uid("p"), companyId: cHalliburton.id, title: "Mechanical Engineer", type: "Full-time" as const, status: "Open" as const, salary: "IDR 22-30jt", openedAt: t(12), createdAt: t(12), updatedAt: t(1) };
  const pHallData = { id: uid("p"), companyId: cHalliburton.id, title: "Data Analyst", type: "Full-time" as const, status: "Open" as const, salary: "IDR 16-23jt", openedAt: t(10), createdAt: t(10), updatedAt: t(2) };
  const pHallPM = { id: uid("p"), companyId: cHalliburton.id, title: "Project Manager", type: "Full-time" as const, status: "Open" as const, salary: "IDR 30-40jt", openedAt: t(8), createdAt: t(8), updatedAt: t(1) };
  const pHallElectrical = { id: uid("p"), companyId: cHalliburton.id, title: "Electrical Technician", type: "Full-time" as const, status: "Open" as const, salary: "IDR 10-15jt", openedAt: t(6), createdAt: t(6), updatedAt: t(1) };
  const pHallBD = { id: uid("p"), companyId: cHalliburton.id, title: "Business Development Manager", type: "Full-time" as const, status: "Open" as const, salary: "IDR 28-38jt", openedAt: t(4), createdAt: t(4), updatedAt: t(1) };
  
  // Indika Energy positions (10)
  const pIndikaMining = { id: uid("p"), companyId: cIndika.id, title: "Mining Engineer", type: "Full-time" as const, status: "Open" as const, salary: "IDR 24-32jt", openedAt: t(28), createdAt: t(28), updatedAt: t(3) };
  const pIndikaGeo = { id: uid("p"), companyId: cIndika.id, title: "Geologist", type: "Full-time" as const, status: "Open" as const, salary: "IDR 18-25jt", openedAt: t(22), createdAt: t(22), updatedAt: t(4) };
  const pIndikaHeavy = { id: uid("p"), companyId: cIndika.id, title: "Heavy Equipment Operator", type: "Full-time" as const, status: "Open" as const, salary: "IDR 8-12jt", openedAt: t(19), createdAt: t(19), updatedAt: t(2) };
  const pIndikaEnv = { id: uid("p"), companyId: cIndika.id, title: "Environmental Engineer", type: "Full-time" as const, status: "Open" as const, salary: "IDR 17-24jt", openedAt: t(16), createdAt: t(16), updatedAt: t(3) };
  const pIndikaPlant = { id: uid("p"), companyId: cIndika.id, title: "Plant Manager", type: "Full-time" as const, status: "Open" as const, salary: "IDR 35-45jt", openedAt: t(14), createdAt: t(14), updatedAt: t(2) };
  const pIndikaFinance = { id: uid("p"), companyId: cIndika.id, title: "Finance Analyst", type: "Full-time" as const, status: "Open" as const, salary: "IDR 15-22jt", openedAt: t(11), createdAt: t(11), updatedAt: t(1) };
  const pIndikaMaint = { id: uid("p"), companyId: cIndika.id, title: "Maintenance Supervisor", type: "Full-time" as const, status: "Open" as const, salary: "IDR 20-28jt", openedAt: t(9), createdAt: t(9), updatedAt: t(2) };
  const pIndikaHR = { id: uid("p"), companyId: cIndika.id, title: "HR Business Partner", type: "Full-time" as const, status: "Open" as const, salary: "IDR 22-30jt", openedAt: t(7), createdAt: t(7), updatedAt: t(1) };
  const pIndikaSafety = { id: uid("p"), companyId: cIndika.id, title: "Safety Officer", type: "Full-time" as const, status: "Open" as const, salary: "IDR 12-18jt", openedAt: t(5), createdAt: t(5), updatedAt: t(1) };
  const pIndikaProcure = { id: uid("p"), companyId: cIndika.id, title: "Procurement Specialist", type: "Full-time" as const, status: "Open" as const, salary: "IDR 16-23jt", openedAt: t(3), createdAt: t(3), updatedAt: t(1) };
  
  // Halodoc positions (10)
  const pHaloBackend = { id: uid("p"), companyId: cHalodoc.id, title: "Software Engineer (Backend)", type: "Full-time" as const, status: "Open" as const, salary: "IDR 18-28jt", openedAt: t(26), createdAt: t(26), updatedAt: t(3) };
  const pHaloMobile = { id: uid("p"), companyId: cHalodoc.id, title: "Mobile Developer (iOS/Android)", type: "Full-time" as const, status: "Open" as const, salary: "IDR 17-26jt", openedAt: t(21), createdAt: t(21), updatedAt: t(2) };
  const pHaloPM = { id: uid("p"), companyId: cHalodoc.id, title: "Product Manager", type: "Full-time" as const, status: "Open" as const, salary: "IDR 25-35jt", openedAt: t(17), createdAt: t(17), updatedAt: t(2) };
  const pHaloUX = { id: uid("p"), companyId: cHalodoc.id, title: "UX/UI Designer", type: "Full-time" as const, status: "Open" as const, salary: "IDR 15-23jt", openedAt: t(13), createdAt: t(13), updatedAt: t(1) };
  const pHaloData = { id: uid("p"), companyId: cHalodoc.id, title: "Data Scientist", type: "Full-time" as const, status: "Open" as const, salary: "IDR 22-32jt", openedAt: t(10), createdAt: t(10), updatedAt: t(2) };
  const pHaloDevOps = { id: uid("p"), companyId: cHalodoc.id, title: "DevOps Engineer", type: "Full-time" as const, status: "Open" as const, salary: "IDR 20-30jt", openedAt: t(8), createdAt: t(8), updatedAt: t(1) };
  const pHaloCS = { id: uid("p"), companyId: cHalodoc.id, title: "Customer Success Manager", type: "Full-time" as const, status: "Open" as const, salary: "IDR 12-18jt", openedAt: t(6), createdAt: t(6), updatedAt: t(1) };
  const pHaloContent = { id: uid("p"), companyId: cHalodoc.id, title: "Medical Content Writer", type: "Full-time" as const, status: "Open" as const, salary: "IDR 10-15jt", openedAt: t(4), createdAt: t(4), updatedAt: t(1) };
  const pHaloPartner = { id: uid("p"), companyId: cHalodoc.id, title: "Partnership Manager", type: "Full-time" as const, status: "Open" as const, salary: "IDR 20-28jt", openedAt: t(2), createdAt: t(2), updatedAt: t(1) };
  const pHaloQA = { id: uid("p"), companyId: cHalodoc.id, title: "QA Engineer", type: "Full-time" as const, status: "Open" as const, salary: "IDR 14-20jt", openedAt: t(1), createdAt: t(1), updatedAt: t(0) };
  
  // STS positions (10)
  const pSTSSales = { id: uid("p"), companyId: cSTS.id, title: "Sales Executive (Luxury Cars)", type: "Full-time" as const, status: "Open" as const, salary: "IDR 10-20jt + Comm", openedAt: t(24), createdAt: t(24), updatedAt: t(2) };
  const pSTSService = { id: uid("p"), companyId: cSTS.id, title: "Service Advisor", type: "Full-time" as const, status: "Open" as const, salary: "IDR 8-12jt", openedAt: t(18), createdAt: t(18), updatedAt: t(2) };
  const pSTSTech = { id: uid("p"), companyId: cSTS.id, title: "Automotive Technician", type: "Full-time" as const, status: "Open" as const, salary: "IDR 10-16jt", openedAt: t(14), createdAt: t(14), updatedAt: t(1) };
  const pSTSParts = { id: uid("p"), companyId: cSTS.id, title: "Parts Administrator", type: "Full-time" as const, status: "Open" as const, salary: "IDR 7-10jt", openedAt: t(11), createdAt: t(11), updatedAt: t(1) };
  const pSTSMkt = { id: uid("p"), companyId: cSTS.id, title: "Marketing Coordinator", type: "Full-time" as const, status: "Open" as const, salary: "IDR 12-18jt", openedAt: t(8), createdAt: t(8), updatedAt: t(1) };
  const pSTSFin = { id: uid("p"), companyId: cSTS.id, title: "Finance & Accounting Staff", type: "Full-time" as const, status: "Open" as const, salary: "IDR 8-12jt", openedAt: t(6), createdAt: t(6), updatedAt: t(1) };
  const pSTSShowroom = { id: uid("p"), companyId: cSTS.id, title: "Showroom Supervisor", type: "Full-time" as const, status: "Open" as const, salary: "IDR 15-22jt", openedAt: t(4), createdAt: t(4), updatedAt: t(1) };
  const pSTSBody = { id: uid("p"), companyId: cSTS.id, title: "Body & Paint Technician", type: "Full-time" as const, status: "Open" as const, salary: "IDR 12-18jt", openedAt: t(3), createdAt: t(3), updatedAt: t(1) };
  const pSTSCRO = { id: uid("p"), companyId: cSTS.id, title: "Customer Relationship Officer", type: "Full-time" as const, status: "Open" as const, salary: "IDR 7-10jt", openedAt: t(2), createdAt: t(2), updatedAt: t(0) };
  const pSTSGA = { id: uid("p"), companyId: cSTS.id, title: "General Affairs Staff", type: "Full-time" as const, status: "Open" as const, salary: "IDR 7-10jt", openedAt: t(1), createdAt: t(1), updatedAt: t(0) };
  
  const candidates = [
    { id: uid("k"), name: "Andi Pratama", email: "andi.pratama@gmail.com", phone: "+62 812 3456 7890", positionId: pHallDrilling.id, stage: "Interview" as const, source: "LinkedIn", note: "5 yrs drilling experience, currently in Riau. Available for Jakarta relocation.", createdAt: t(16), updatedAt: t(1) },
    { id: uid("k"), name: "Siti Nurhaliza", email: "siti.nurhaliza@yahoo.com", phone: "+62 813 8765 4321", positionId: pHaloBackend.id, stage: "Screened" as const, source: "Referral", note: "Strong Go/Python background, worked at fintech startup. Open to health-tech mission.", createdAt: t(9), updatedAt: t(2) },
    { id: uid("k"), name: "Budi Santoso", email: "budi.santoso@gmail.com", phone: "+62 811 2233 4455", positionId: pIndikaMining.id, stage: "Offer" as const, source: "Job Board", note: "Offer extended IDR 28jt — awaiting response by Friday.", createdAt: t(14), updatedAt: t(0, 5) },
    { id: uid("k"), name: "Dewi Lestari", email: "dewi.lestari@outlook.com", phone: "+62 812 9988 7766", positionId: pSTSSales.id, stage: "Sourced" as const, source: "LinkedIn", note: "3 yrs luxury retail experience, passionate about automotive.", createdAt: t(3), updatedAt: t(3) },
    { id: uid("k"), name: "Rahman Hakim", email: "rahman.hakim@gmail.com", phone: "+62 813 5544 3322", positionId: pHallHSE.id, stage: "Placed" as const, source: "Talent Pool", note: "Placed 9 days ago. Check-in call scheduled for week 4.", createdAt: t(26), updatedAt: t(9) },
    { id: uid("k"), name: "Fitri Handayani", email: "fitri.handayani@yahoo.com", phone: "+62 812 7766 5544", positionId: pHaloPM.id, stage: "Interview" as const, source: "Direct", note: "Second interview with product director next Tuesday.", createdAt: t(12), updatedAt: t(2, 6) },
    { id: uid("k"), name: "Agus Wijaya", email: "agus.wijaya@gmail.com", phone: "+62 811 3344 5566", positionId: pIndikaEnv.id, stage: "Sourced" as const, source: "LinkedIn", note: "Passive — happy in current role but curious about mining sustainability.", createdAt: t(5), updatedAt: t(5) },
    { id: uid("k"), name: "Maya Kusuma", email: "maya.kusuma@icloud.com", phone: "+62 813 2211 0099", positionId: pSTSService.id, stage: "Screened" as const, source: "Referral", note: "Referral from showroom supervisor. 4 yrs automotive service experience.", createdAt: t(8), updatedAt: t(4) },
    { id: uid("k"), name: "Hendra Gunawan", email: "hendra.gunawan@gmail.com", phone: "+62 812 4455 6677", positionId: pHaloMobile.id, stage: "Rejected" as const, source: "Job Board", note: "Not enough Swift experience. Keep warm for Android roles.", createdAt: t(19), updatedAt: t(6) },
    { id: uid("k"), name: "Linda Permata", email: "linda.permata@yahoo.com", phone: "+62 811 6677 8899", positionId: pIndikaFinance.id, stage: "Sourced" as const, source: "Referral", note: "CPA candidate, strong Excel and SAP skills.", createdAt: t(1), updatedAt: t(1) },
  ];
  
  const activity = [
    { id: uid("a"), kind: "candidate" as const, message: "Budi Santoso moved to Offer — Mining Engineer", at: t(0, 5) },
    { id: uid("a"), kind: "sync" as const, message: "Workspace snapshot saved locally", at: t(0, 8) },
    { id: uid("a"), kind: "position" as const, message: "QA Engineer opened at Halodoc", at: t(1) },
    { id: uid("a"), kind: "candidate" as const, message: "Fitri Handayani moved to Interview — Product Manager", at: t(2, 6) },
    { id: uid("a"), kind: "candidate" as const, message: "Linda Permata sourced via Referral", at: t(1, 3) },
    { id: uid("a"), kind: "company" as const, message: "Senayan Trikarya Sempana added as a client", at: t(17) },
    { id: uid("a"), kind: "candidate" as const, message: "Rahman Hakim placed — HSE Specialist", at: t(9) },
  ].sort((a, b) => b.at - a.at);
  
  return {
    companies: [cHalliburton, cIndika, cHalodoc, cSTS],
    positions: [
      pHallDrilling, pHallCompletion, pHallField, pHallHSE, pHallSupply, pHallMech, pHallData, pHallPM, pHallElectrical, pHallBD,
      pIndikaMining, pIndikaGeo, pIndikaHeavy, pIndikaEnv, pIndikaPlant, pIndikaFinance, pIndikaMaint, pIndikaHR, pIndikaSafety, pIndikaProcure,
      pHaloBackend, pHaloMobile, pHaloPM, pHaloUX, pHaloData, pHaloDevOps, pHaloCS, pHaloContent, pHaloPartner, pHaloQA,
      pSTSSales, pSTSService, pSTSTech, pSTSParts, pSTSMkt, pSTSFin, pSTSShowroom, pSTSBody, pSTSCRO, pSTSGA,
    ],
    candidates,
    activity,
  };
}

export const EMPTY_DB: DB = { companies: [], positions: [], candidates: [], activity: [] };
