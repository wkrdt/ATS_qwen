import { describe, it, expect, beforeEach, vi } from 'vitest';
import { buildSeed, getCompanyIconName, EMPTY_DB } from './seed';
import type { DB } from '../types';

describe('seed', () => {
  describe('buildSeed', () => {
    let db: DB;

    beforeEach(() => {
      db = buildSeed();
    });

    it('returns a valid DB structure', () => {
      expect(db).toHaveProperty('companies');
      expect(db).toHaveProperty('positions');
      expect(db).toHaveProperty('candidates');
      expect(db).toHaveProperty('contracts');
      expect(db).toHaveProperty('activity');
    });

    it('creates companies with required fields', () => {
      expect(db.companies.length).toBeGreaterThan(0);
      db.companies.forEach(company => {
        expect(company).toHaveProperty('id');
        expect(company).toHaveProperty('name');
        expect(company).toHaveProperty('address');
        expect(company).toHaveProperty('contact');
        expect(company).toHaveProperty('website');
        expect(company).toHaveProperty('createdAt');
        expect(company).toHaveProperty('updatedAt');
      });
    });

    it('creates positions with required fields', () => {
      expect(db.positions.length).toBeGreaterThan(0);
      db.positions.forEach(position => {
        expect(position).toHaveProperty('id');
        expect(position).toHaveProperty('companyId');
        expect(position).toHaveProperty('title');
        expect(position).toHaveProperty('type');
        expect(position).toHaveProperty('status');
        expect(position).toHaveProperty('salary');
        expect(position).toHaveProperty('createdAt');
        expect(position).toHaveProperty('updatedAt');
      });
    });

    it('creates candidates with required fields', () => {
      expect(db.candidates.length).toBeGreaterThan(0);
      db.candidates.forEach(candidate => {
        expect(candidate).toHaveProperty('id');
        expect(candidate).toHaveProperty('name');
        expect(candidate).toHaveProperty('email');
        expect(candidate).toHaveProperty('phone');
        expect(candidate).toHaveProperty('positionId');
        expect(candidate).toHaveProperty('stage');
        expect(candidate).toHaveProperty('source');
        expect(candidate).toHaveProperty('note');
        expect(candidate).toHaveProperty('createdAt');
        expect(candidate).toHaveProperty('updatedAt');
      });
    });

    it('creates contracts with required fields', () => {
      expect(db.contracts.length).toBeGreaterThan(0);
      db.contracts.forEach(contract => {
        expect(contract).toHaveProperty('id');
        expect(contract).toHaveProperty('companyId');
        expect(contract).toHaveProperty('documentType');
        expect(contract).toHaveProperty('startDate');
        expect(contract).toHaveProperty('endDate');
        expect(contract).toHaveProperty('createdAt');
        expect(contract).toHaveProperty('updatedAt');
      });
    });

    it('creates activity log entries', () => {
      expect(db.activity.length).toBeGreaterThan(0);
      db.activity.forEach(entry => {
        expect(entry).toHaveProperty('id');
        expect(entry).toHaveProperty('kind');
        expect(entry).toHaveProperty('message');
        expect(entry).toHaveProperty('at');
      });
    });

    it('ensures all positions reference valid companies', () => {
      const companyIds = new Set(db.companies.map(c => c.id));
      db.positions.forEach(position => {
        expect(companyIds.has(position.companyId)).toBe(true);
      });
    });

    it('ensures candidate stages are valid', () => {
      const validStages = ['Sourced', 'Screened', 'Interview', 'Offer', 'Placed', 'Rejected'];
      db.candidates.forEach(candidate => {
        expect(validStages).toContain(candidate.stage);
      });
    });

    it('ensures position types are valid', () => {
      const validTypes = ['Full-time', 'Part-time', 'Contract'];
      db.positions.forEach(position => {
        expect(validTypes).toContain(position.type);
      });
    });

    it('ensures position statuses are valid', () => {
      const validStatuses = ['Open', 'On Hold', 'Filled', 'Cancelled'];
      db.positions.forEach(position => {
        expect(validStatuses).toContain(position.status);
      });
    });

    it('activity is sorted by timestamp descending', () => {
      for (let i = 1; i < db.activity.length; i++) {
        expect(db.activity[i - 1].at).toBeGreaterThanOrEqual(db.activity[i].at);
      }
    });
  });

  describe('getCompanyIconName', () => {
    it('removes PT prefix', () => {
      expect(getCompanyIconName('PT Halliburton')).toBe('Halliburton');
    });

    it('removes CV prefix', () => {
      expect(getCompanyIconName('CV Maju Jaya')).toBe('Maju Jaya');
    });

    it('removes TBK suffix', () => {
      expect(getCompanyIconName('Indika Energy TBK')).toBe('Indika Energy');
    });

    it('handles multiple prefixes', () => {
      expect(getCompanyIconName('PT CV Test Company')).toBe('Test Company');
    });

    it('returns original name if no prefixes', () => {
      expect(getCompanyIconName('Google')).toBe('Google');
    });

    it('trims result', () => {
      expect(getCompanyIconName('PT   Test  ')).toBe('Test');
    });
  });

  describe('EMPTY_DB', () => {
    it('has empty arrays for all collections', () => {
      expect(EMPTY_DB.companies).toEqual([]);
      expect(EMPTY_DB.positions).toEqual([]);
      expect(EMPTY_DB.candidates).toEqual([]);
      expect(EMPTY_DB.contracts).toEqual([]);
      expect(EMPTY_DB.activity).toEqual([]);
    });
  });
});
