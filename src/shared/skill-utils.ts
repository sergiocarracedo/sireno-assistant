/**
 * Helper utilities for working with skills
 */

import type { Skill } from './types';

/**
 * Get domain match configuration from skill metadata
 */
export function getSkillDomainMatch(skill: Skill): { type: 'exact' | 'regex'; pattern: string } {
  return skill.metadata?.domainMatch || { type: 'exact', pattern: '*' };
}

/**
 * Get intent triggers from skill metadata
 */
export function getSkillIntentTriggers(skill: Skill): string[] {
  return skill.metadata?.intentTriggers || [];
}

/**
 * Get safety settings from skill metadata
 */
export function getSkillSafety(skill: Skill): { neverModifyPasswords?: boolean; maxFieldLength?: number } {
  return skill.metadata?.safety || {};
}

/**
 * Check if a skill matches a given domain/URL
 */
export function skillMatchesDomain(skill: Skill, domain: string, url: string): boolean {
  const domainMatch = getSkillDomainMatch(skill);
  const pattern = domainMatch.pattern;
  
  if (pattern === '*') return true;
  
  if (domainMatch.type === 'exact') {
    return domain.includes(pattern) || url.includes(pattern);
  } else if (domainMatch.type === 'regex') {
    try {
      const regex = new RegExp(pattern);
      return regex.test(domain) || regex.test(url);
    } catch {
      return false;
    }
  }
  
  return false;
}
