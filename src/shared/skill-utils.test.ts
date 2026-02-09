import { describe, it, expect } from 'vitest';
import { skillMatchesDomain, getSkillDomainMatch, getSkillIntentTriggers, getSkillSafety } from './skill-utils';
import type { Skill } from './types';

// Helper to create test skills
const createSkill = (overrides: Partial<Skill> = {}): Skill => ({
  id: '1',
  name: 'Test Skill',
  description: 'A test skill',
  instructions: 'Test instructions',
  ...overrides,
});

describe('skill-utils', () => {
  describe('getSkillDomainMatch', () => {
    it('should return default wildcard for skills without metadata', () => {
      const skill = createSkill();
      const match = getSkillDomainMatch(skill);
      expect(match).toEqual({ type: 'exact', pattern: '*' });
    });

    it('should return configured domain match', () => {
      const skill = createSkill({
        metadata: {
          domainMatch: { type: 'exact', pattern: 'example.com' },
        },
      });

      const match = getSkillDomainMatch(skill);
      expect(match).toEqual({ type: 'exact', pattern: 'example.com' });
    });
  });

  describe('getSkillIntentTriggers', () => {
    it('should return empty array for skills without triggers', () => {
      const skill = createSkill();
      const triggers = getSkillIntentTriggers(skill);
      expect(triggers).toEqual([]);
    });

    it('should return configured intent triggers', () => {
      const skill = createSkill({
        metadata: {
          intentTriggers: ['translate', 'convert'],
        },
      });

      const triggers = getSkillIntentTriggers(skill);
      expect(triggers).toEqual(['translate', 'convert']);
    });
  });

  describe('getSkillSafety', () => {
    it('should return empty object for skills without safety settings', () => {
      const skill = createSkill();
      const safety = getSkillSafety(skill);
      expect(safety).toEqual({});
    });

    it('should return configured safety settings', () => {
      const skill = createSkill({
        metadata: {
          safety: {
            neverModifyPasswords: true,
            maxFieldLength: 500,
          },
        },
      });

      const safety = getSkillSafety(skill);
      expect(safety).toEqual({
        neverModifyPasswords: true,
        maxFieldLength: 500,
      });
    });
  });

  describe('skillMatchesDomain', () => {
    it('should match wildcard pattern for any domain', () => {
      const skill = createSkill({
        metadata: {
          domainMatch: { type: 'exact', pattern: '*' },
        },
      });

      expect(skillMatchesDomain(skill, 'example.com', 'https://example.com')).toBe(true);
      expect(skillMatchesDomain(skill, 'another.com', 'https://another.com')).toBe(true);
    });

    it('should match exact domain pattern', () => {
      const skill = createSkill({
        name: 'Gmail Skill',
        metadata: {
          domainMatch: { type: 'exact', pattern: 'gmail.com' },
        },
      });

      expect(skillMatchesDomain(skill, 'mail.gmail.com', 'https://mail.gmail.com')).toBe(true);
      expect(skillMatchesDomain(skill, 'example.com', 'https://example.com')).toBe(false);
    });

    it('should match URL pattern', () => {
      const skill = createSkill({
        name: 'LinkedIn Jobs',
        metadata: {
          domainMatch: { type: 'exact', pattern: 'linkedin.com/jobs' },
        },
      });

      expect(skillMatchesDomain(skill, 'linkedin.com', 'https://linkedin.com/jobs/search')).toBe(true);
      expect(skillMatchesDomain(skill, 'linkedin.com', 'https://linkedin.com/feed')).toBe(false);
    });

    it('should match regex pattern against domain', () => {
      const skill = createSkill({
        name: 'Google Services',
        metadata: {
          domainMatch: { type: 'regex', pattern: '^[\\w-]+\\.google\\.com$' },
        },
      });

      expect(skillMatchesDomain(skill, 'mail.google.com', 'https://mail.google.com')).toBe(true);
      expect(skillMatchesDomain(skill, 'docs.google.com', 'https://docs.google.com')).toBe(true);
      expect(skillMatchesDomain(skill, 'google.com', 'https://google.com')).toBe(false);
      expect(skillMatchesDomain(skill, 'example.com', 'https://example.com')).toBe(false);
    });

    it('should match regex pattern against URL', () => {
      const skill = createSkill({
        name: 'Form Pages',
        metadata: {
          domainMatch: { type: 'regex', pattern: '/form/' },
        },
      });

      expect(skillMatchesDomain(skill, 'example.com', 'https://example.com/form/contact')).toBe(true);
      expect(skillMatchesDomain(skill, 'example.com', 'https://example.com/about')).toBe(false);
    });

    it('should return false for invalid regex', () => {
      const skill = createSkill({
        name: 'Bad Regex',
        metadata: {
          domainMatch: { type: 'regex', pattern: '[invalid(' },
        },
      });

      expect(skillMatchesDomain(skill, 'example.com', 'https://example.com')).toBe(false);
    });

    it('should default to wildcard when no metadata', () => {
      const skill = createSkill();
      expect(skillMatchesDomain(skill, 'example.com', 'https://example.com')).toBe(true);
      expect(skillMatchesDomain(skill, 'another.com', 'https://another.com')).toBe(true);
    });
  });
});
