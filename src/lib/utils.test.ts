import { describe, it, expect, beforeEach, vi } from 'vitest';
import { uid, timeAgo, fmtDate, fmtClock, isThisMonth, weekBuckets, mergeById, normalizeUrl, hostOf, initialsOf, addedThisWeek } from './utils';
import type { HasId } from './utils';

describe('utils', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2024-01-15T12:00:00Z'));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('uid', () => {
    it('generates unique IDs with prefix', () => {
      const id1 = uid('test');
      const id2 = uid('test');
      expect(id1).toMatch(/^test_/);
      expect(id2).toMatch(/^test_/);
      expect(id1).not.toBe(id2);
    });

    it('generates IDs with different prefixes', () => {
      const id1 = uid('c');
      const id2 = uid('p');
      expect(id1).toMatch(/^c_/);
      expect(id2).toMatch(/^p_/);
    });
  });

  describe('timeAgo', () => {
    it('returns seconds ago for recent timestamps', () => {
      const ts = Date.now() - 30 * 1000;
      expect(timeAgo(ts)).toBe('30s ago');
    });

    it('returns minutes ago', () => {
      const ts = Date.now() - 5 * 60 * 1000;
      expect(timeAgo(ts)).toBe('5m ago');
    });

    it('returns hours ago', () => {
      const ts = Date.now() - 3 * 60 * 60 * 1000;
      expect(timeAgo(ts)).toBe('3h ago');
    });

    it('returns days ago', () => {
      const ts = Date.now() - 10 * 24 * 60 * 60 * 1000;
      expect(timeAgo(ts)).toBe('10d ago');
    });

    it('returns months ago', () => {
      const ts = Date.now() - 60 * 24 * 60 * 60 * 1000;
      expect(timeAgo(ts)).toBe('2mo ago');
    });

    it('returns years ago', () => {
      const ts = Date.now() - 400 * 24 * 60 * 60 * 1000;
      expect(timeAgo(ts)).toBe('1y ago');
    });
  });

  describe('fmtDate', () => {
    it('formats date in GB locale', () => {
      const ts = new Date('2024-01-15T12:00:00Z').getTime();
      expect(fmtDate(ts)).toBe('15 Jan 2024');
    });
  });

  describe('fmtClock', () => {
    it('formats time in GB locale', () => {
      const ts = new Date('2024-01-15T14:30:00Z').getTime();
      expect(fmtClock(ts)).toBe('14:30');
    });
  });

  describe('isThisMonth', () => {
    it('returns true for current month', () => {
      const ts = Date.now();
      expect(isThisMonth(ts)).toBe(true);
    });

    it('returns false for different month', () => {
      const ts = Date.now() - 60 * 24 * 60 * 60 * 1000;
      expect(isThisMonth(ts)).toBe(false);
    });
  });

  describe('weekBuckets', () => {
    it('counts items per week', () => {
      const now = Date.now();
      const week = 7 * 24 * 60 * 60 * 1000;
      const items = [
        { createdAt: now }, // this week
        { createdAt: now - week }, // last week
        { createdAt: now - week * 2 }, // 2 weeks ago
        { createdAt: now - week * 10 }, // 10 weeks ago (out of range for 4 weeks)
      ];
      const buckets = weekBuckets(items, 4);
      expect(buckets).toHaveLength(4);
      expect(buckets[3]).toBe(1); // most recent week
      expect(buckets[2]).toBe(1);
      expect(buckets[1]).toBe(1);
      expect(buckets[0]).toBe(0); // oldest week (10 weeks ago is out of range)
    });

    it('returns empty array for no items', () => {
      expect(weekBuckets([], 4)).toEqual([0, 0, 0, 0]);
    });
  });

  describe('mergeById', () => {
    interface TestItem extends HasId {
      name: string;
    }

    it('merges local and remote arrays', () => {
      const local: TestItem[] = [
        { id: '1', name: 'Local 1', createdAt: 1000, updatedAt: 2000 },
        { id: '2', name: 'Local 2', createdAt: 1000, updatedAt: 2000 },
      ];
      const remote: TestItem[] = [
        { id: '2', name: 'Remote 2', createdAt: 1000, updatedAt: 3000 }, // newer
        { id: '3', name: 'Remote 3', createdAt: 1000, updatedAt: 2000 },
      ];
      const merged = mergeById(local, remote);
      expect(merged).toHaveLength(3);
      expect(merged.find(i => i.id === '2')?.name).toBe('Remote 2');
      expect(merged.find(i => i.id === '1')?.name).toBe('Local 1');
      expect(merged.find(i => i.id === '3')?.name).toBe('Remote 3');
    });

    it('prefers local when updatedAt is newer', () => {
      const local: TestItem[] = [
        { id: '1', name: 'Local Newer', createdAt: 1000, updatedAt: 5000 },
      ];
      const remote: TestItem[] = [
        { id: '1', name: 'Remote Older', createdAt: 1000, updatedAt: 3000 },
      ];
      const merged = mergeById(local, remote);
      expect(merged).toHaveLength(1);
      expect(merged[0].name).toBe('Local Newer');
    });

    it('sorts by createdAt', () => {
      const local: TestItem[] = [
        { id: '2', name: 'Later', createdAt: 2000, updatedAt: 2000 },
        { id: '1', name: 'Earlier', createdAt: 1000, updatedAt: 2000 },
      ];
      const merged = mergeById(local, []);
      expect(merged[0].id).toBe('1');
      expect(merged[1].id).toBe('2');
    });
  });

  describe('normalizeUrl', () => {
    it('adds https:// if missing', () => {
      expect(normalizeUrl('example.com')).toBe('https://example.com/');
    });

    it('keeps existing protocol', () => {
      expect(normalizeUrl('http://example.com')).toBe('http://example.com/');
    });

    it('returns null for invalid URLs', () => {
      expect(normalizeUrl('not-a-valid-url')).toBe(null);
    });

    it('returns null for URLs without hostname', () => {
      expect(normalizeUrl('https://localhost')).toBe(null);
    });

    it('returns null for empty string', () => {
      expect(normalizeUrl('')).toBe(null);
    });

    it('trims whitespace', () => {
      expect(normalizeUrl('  example.com  ')).toBe('https://example.com/');
    });
  });

  describe('hostOf', () => {
    it('extracts hostname', () => {
      expect(hostOf('https://www.example.com/path')).toBe('example.com');
    });

    it('removes www prefix', () => {
      expect(hostOf('https://www.google.com')).toBe('google.com');
    });

    it('returns original on error', () => {
      expect(hostOf('not-a-url')).toBe('not-a-url');
    });
  });

  describe('initialsOf', () => {
    it('extracts initials from name', () => {
      expect(initialsOf('John Doe')).toBe('JD');
    });

    it('handles single word', () => {
      expect(initialsOf('John')).toBe('J');
    });

    it('handles multiple spaces', () => {
      expect(initialsOf('John   Doe')).toBe('JD');
    });

    it('returns ? for empty string', () => {
      expect(initialsOf('')).toBe('?');
    });

    it('uppercase initials', () => {
      expect(initialsOf('john doe')).toBe('JD');
    });
  });

  describe('addedThisWeek', () => {
    it('counts items added in the last week', () => {
      const now = Date.now();
      const day = 24 * 60 * 60 * 1000;
      const items = [
        { createdAt: now }, // today
        { createdAt: now - 3 * day }, // 3 days ago
        { createdAt: now - 8 * day }, // 8 days ago (outside week)
      ];
      expect(addedThisWeek(items)).toBe(2);
    });

    it('returns 0 for no items', () => {
      expect(addedThisWeek([])).toBe(0);
    });
  });
});
