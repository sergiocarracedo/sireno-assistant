import type { Skill } from './types';

/**
 * Pre-built skill templates that users can use as starting points
 */
export const DEFAULT_SKILLS: Skill[] = [
  {
    id: 'personal-info-filler',
    name: 'Personal Info Filler',
    description: 'Automatically fills personal information fields with your customized data across all websites',
    instructions: `When filling personal information fields, use the following data:

Name: [User should customize this]
Email: [User should customize this]
Phone: [User should customize this]
Address: [User should customize this]
City: [User should customize this]
State: [User should customize this]
ZIP: [User should customize this]
Country: [User should customize this]

IMPORTANT: User must edit this skill and add their actual information before using it.`,
    metadata: {
      domainMatch: {
        type: 'exact' as const,
        pattern: '*', // Works on all domains
      },
      intentTriggers: ['fill', 'autofill', 'personal', 'info'],
      safety: {
        neverModifyPasswords: true,
        maxFieldLength: 500,
      },
    },
  },
  {
    id: 'professional-tone-linkedin',
    name: 'Professional Tone (LinkedIn)',
    description: 'Generates professional, formal business language optimized for LinkedIn profiles and communications',
    instructions: `When generating or modifying text for LinkedIn:

- Use professional, formal language
- Avoid casual contractions (use "do not" instead of "don't")
- Emphasize achievements and measurable results
- Use action verbs (led, managed, developed, achieved)
- Keep tone confident but humble
- Focus on value delivered to employers/clients
- Use industry-standard terminology
- Maintain third-person perspective for bio sections`,
    metadata: {
      domainMatch: {
        type: 'exact' as const,
        pattern: 'linkedin.com',
      },
      intentTriggers: ['professional', 'formal', 'business'],
      safety: {
        maxFieldLength: 2000,
      },
    },
  },
  {
    id: 'casual-tone-social',
    name: 'Casual Tone (Social Media)',
    description: 'Creates friendly, conversational content for Twitter, Facebook, Instagram, and other social platforms',
    instructions: `When generating or modifying text for social media:

- Use casual, friendly, conversational tone
- Contractions are encouraged ("don't", "we're", "it's")
- Emojis are appropriate when they enhance the message
- Keep it short and engaging (respect character limits)
- Use first-person perspective ("I", "we")
- Feel free to use informal language
- Add personality and authenticity
- Make it shareable and relatable`,
    metadata: {
      domainMatch: {
        type: 'regex' as const,
        pattern: '(twitter\\.com|x\\.com|facebook\\.com|instagram\\.com)',
      },
      intentTriggers: ['casual', 'friendly', 'social'],
      safety: {
        maxFieldLength: 1000,
      },
    },
  },
  {
    id: 'grammar-spelling-corrector',
    name: 'Grammar & Spelling Corrector',
    description: 'Fixes grammar, spelling, and punctuation errors while preserving original meaning and tone',
    instructions: `When asked to fix, correct, or proofread text:

- Correct grammar errors
- Fix spelling mistakes
- Improve punctuation
- Fix capitalization issues
- Preserve the original meaning and intent
- Maintain the original tone (casual/formal)
- Do NOT rewrite or rephrase unless explicitly asked
- Do NOT change the message's core content
- Only make corrections, not improvements`,
    metadata: {
      domainMatch: {
        type: 'exact' as const,
        pattern: '*', // Works on all domains
      },
      intentTriggers: ['fix', 'correct', 'grammar', 'spelling', 'proofread'],
      safety: {
        maxFieldLength: 5000,
      },
    },
  },
  {
    id: 'form-helper',
    name: 'Smart Form Helper',
    description: 'Intelligently formats addresses, phone numbers, dates, names, and emails to standard conventions',
    instructions: `When filling form fields, apply smart formatting:

Address Fields:
- Use proper address format (Street, City, State ZIP)
- Capitalize street names properly
- Use standard state abbreviations (CA, NY, TX, etc.)

Phone Numbers:
- Format US numbers as: (XXX) XXX-XXXX
- Format international numbers with country code: +XX XXX-XXX-XXXX
- Remove extra characters (keep only digits and formatting)

Dates:
- Use MM/DD/YYYY for US forms
- Use DD/MM/YYYY for international forms
- Accept natural language ("tomorrow", "next week") and convert

Names:
- Capitalize properly (First Middle Last)
- Handle prefixes (Dr., Mr., Ms.) correctly

Email:
- Validate email format
- Lowercase the domain portion
- Preserve case in local part if specified`,
    metadata: {
      domainMatch: {
        type: 'exact' as const,
        pattern: '*', // Works on all domains
      },
      intentTriggers: ['format', 'standardize', 'normalize'],
      safety: {
        neverModifyPasswords: true,
        maxFieldLength: 500,
      },
    },
  },
];

/**
 * Get a skill template by ID
 */
export function getSkillTemplate(id: string): Skill | undefined {
  return DEFAULT_SKILLS.find((skill) => skill.id === id);
}

/**
 * Get all skill templates
 */
export function getAllSkillTemplates(): Skill[] {
  return [...DEFAULT_SKILLS];
}
