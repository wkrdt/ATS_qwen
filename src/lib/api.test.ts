import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import * as api from './api';

describe('api', () => {
  const mockBaseUrl = 'https://script.google.com/macros/s/mock/exec';
  
  // Mock fetch globally
  const originalFetch = global.fetch;
  
  beforeEach(() => {
    global.fetch = vi.fn();
  });
  
  afterEach(() => {
    global.fetch = originalFetch;
    vi.restoreAllMocks();
  });

  describe('ping', () => {
    it('calls ping action and returns response', async () => {
      const mockResponse = { ok: true, data: { status: 'ok' } };
      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });
      
      const result = await api.ping(mockBaseUrl);
      
      expect(global.fetch).toHaveBeenCalledWith(
        `${mockBaseUrl}?action=ping`,
        expect.objectContaining({ method: 'GET' })
      );
      expect(result).toEqual(mockResponse);
    });

    it('throws error on HTTP error', async () => {
      (global.fetch as any).mockResolvedValueOnce({
        ok: false,
        status: 500,
      });
      
      await expect(api.ping(mockBaseUrl)).rejects.toThrow('HTTP 500');
    });

    it('throws error on script error', async () => {
      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ ok: false, error: 'Script failed' }),
      });
      
      await expect(api.ping(mockBaseUrl)).rejects.toThrow('Script failed');
    });
  });

  describe('getAll', () => {
    it('fetches all data and coerces types correctly', async () => {
      const mockData = {
        ok: true,
        data: {
          Companies: [
            { id: 'c1', name: 'Test Co', address: 'Jakarta', contact: 'John', createdAt: 1000, updatedAt: 2000 },
          ],
          Positions: [
            { id: 'p1', companyId: 'c1', title: 'Engineer', type: 'Full-time', status: 'Open', salary: 'IDR 20jt', openedAt: 1000, createdAt: 1000, updatedAt: 2000 },
          ],
          Candidates: [
            { id: 'k1', name: 'Alice', email: 'alice@test.com', phone: '+62xxx', positionId: 'p1', stage: 'Interview', source: 'LinkedIn', note: 'Good', createdAt: 1000, updatedAt: 2000 },
          ],
          Contracts: [
            { id: 'ct1', companyId: 'c1', documentType: 'Main Contract', startDate: 1000, endDate: 2000, createdAt: 1000, updatedAt: 2000 },
          ],
        },
      };
      
      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => mockData,
      });
      
      const result = await api.getAll(mockBaseUrl);
      
      expect(result.companies).toHaveLength(1);
      expect(result.companies[0].name).toBe('Test Co');
      expect(result.positions).toHaveLength(1);
      expect(result.candidates).toHaveLength(1);
      expect(result.contracts).toHaveLength(1);
    });

    it('handles null/undefined values with defaults', async () => {
      const mockData = {
        ok: true,
        data: {
          Companies: [{ id: null, name: null, address: null, contact: null, createdAt: null, updatedAt: null }],
          Positions: [],
          Candidates: [],
          Contracts: [],
        },
      };
      
      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => mockData,
      });
      
      const result = await api.getAll(mockBaseUrl);
      
      expect(result.companies[0].id).toBe('');
      expect(result.companies[0].name).toBe('');
      expect(result.companies[0].createdAt).toBe(0);
    });

    it('handles empty data', async () => {
      const mockData = {
        ok: true,
        data: { Companies: [], Positions: [], Candidates: [], Contracts: [] },
      };
      
      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => mockData,
      });
      
      const result = await api.getAll(mockBaseUrl);
      
      expect(result.companies).toEqual([]);
      expect(result.positions).toEqual([]);
      expect(result.candidates).toEqual([]);
      expect(result.contracts).toEqual([]);
    });
  });

  describe('replaceAll', () => {
    it('posts full database snapshot', async () => {
      const mockDb = {
        companies: [{ id: 'c1', name: 'Test', address: '', contact: '', website: '', createdAt: 0, updatedAt: 0 }],
        positions: [],
        candidates: [],
        contracts: [],
        activity: [],
      };
      
      const mockResponse = { ok: true };
      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });
      
      const result = await api.replaceAll(mockBaseUrl, mockDb);
      
      expect(global.fetch).toHaveBeenCalledWith(
        mockBaseUrl,
        expect.objectContaining({
          method: 'POST',
          headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        })
      );
      
      const callArgs = (global.fetch as any).mock.calls[0][1];
      const body = JSON.parse(callArgs.body);
      expect(body.action).toBe('replaceAll');
      expect(body.data.Companies).toHaveLength(1);
      
      expect(result).toEqual(mockResponse);
    });
  });

  describe('upsert', () => {
    it('posts single record to sheet', async () => {
      const record = { id: 'c1', name: 'Test' };
      const mockResponse = { ok: true };
      
      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });
      
      const result = await api.upsert(mockBaseUrl, 'Companies', record);
      
      const callArgs = (global.fetch as any).mock.calls[0][1];
      const body = JSON.parse(callArgs.body);
      expect(body.action).toBe('upsert');
      expect(body.sheet).toBe('Companies');
      expect(body.record).toEqual(record);
      
      expect(result).toEqual(mockResponse);
    });
  });

  describe('removeRecord', () => {
    it('posts delete request', async () => {
      const mockResponse = { ok: true };
      
      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });
      
      const result = await api.removeRecord(mockBaseUrl, 'Candidates', 'k1');
      
      const callArgs = (global.fetch as any).mock.calls[0][1];
      const body = JSON.parse(callArgs.body);
      expect(body.action).toBe('remove');
      expect(body.sheet).toBe('Candidates');
      expect(body.id).toBe('k1');
      
      expect(result).toEqual(mockResponse);
    });
  });

  describe('timeout handling', () => {
    it('aborts request after timeout', async () => {
      (global.fetch as any).mockImplementation(() => {
        return new Promise((_, reject) => {
          setTimeout(() => reject(new Error('Timeout')), 100);
        });
      });
      
      await expect(api.ping(mockBaseUrl)).rejects.toThrow();
    });
  });
});
