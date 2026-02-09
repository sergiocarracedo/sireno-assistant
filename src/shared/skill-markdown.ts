/**
 * Utilities for importing and exporting skills as markdown files
 * Following Agent Skills specification (https://agentskills.io/specification)
 */

import type { Skill } from './types';

/**
 * Convert a skill to markdown format with YAML frontmatter
 */
export function skillToMarkdown(skill: Skill): string {
  const lines: string[] = [];
  
  // YAML frontmatter
  lines.push('---');
  lines.push(`name: ${skill.name}`);
  lines.push(`description: ${skill.description}`);
  
  if (skill.license) {
    lines.push(`license: ${skill.license}`);
  }
  
  if (skill.compatibility) {
    lines.push(`compatibility: ${skill.compatibility}`);
  }
  
  // Metadata section
  if (skill.metadata && Object.keys(skill.metadata).length > 0) {
    lines.push('metadata:');
    
    // Domain match
    if (skill.metadata.domainMatch) {
      lines.push(`  domainMatch:`);
      lines.push(`    type: ${skill.metadata.domainMatch.type}`);
      lines.push(`    pattern: "${skill.metadata.domainMatch.pattern}"`);
    }
    
    // Intent triggers
    if (skill.metadata.intentTriggers && skill.metadata.intentTriggers.length > 0) {
      lines.push(`  intentTriggers:`);
      skill.metadata.intentTriggers.forEach(trigger => {
        lines.push(`    - ${trigger}`);
      });
    }
    
    // Safety settings
    if (skill.metadata.safety) {
      lines.push(`  safety:`);
      if (skill.metadata.safety.neverModifyPasswords !== undefined) {
        lines.push(`    neverModifyPasswords: ${skill.metadata.safety.neverModifyPasswords}`);
      }
      if (skill.metadata.safety.maxFieldLength !== undefined) {
        lines.push(`    maxFieldLength: ${skill.metadata.safety.maxFieldLength}`);
      }
    }
    
    // Other custom metadata
    Object.keys(skill.metadata).forEach(key => {
      if (key !== 'domainMatch' && key !== 'intentTriggers' && key !== 'safety') {
        const value = skill.metadata![key];
        if (typeof value === 'string') {
          lines.push(`  ${key}: "${value}"`);
        } else {
          lines.push(`  ${key}: ${JSON.stringify(value)}`);
        }
      }
    });
  }
  
  lines.push('---');
  lines.push('');
  
  // Body content (instructions)
  lines.push(skill.instructions);
  
  return lines.join('\n');
}

/**
 * Parse a markdown file to extract skill data
 */
export function markdownToSkill(markdown: string): Skill {
  const lines = markdown.split('\n');
  
  // Parse YAML frontmatter
  let name = '';
  let description = '';
  let license: string | undefined;
  let compatibility: string | undefined;
  let domainMatch: { type: 'exact' | 'regex'; pattern: string } | undefined;
  let intentTriggers: string[] = [];
  let safety: { neverModifyPasswords?: boolean; maxFieldLength?: number } = {};
  let customMetadata: Record<string, any> = {};
  let instructions = '';
  
  let inFrontmatter = false;
  let inMetadata = false;
  let currentMetadataKey = '';
  let afterFrontmatter = false;
  let instructionLines: string[] = [];
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();
    
    // Start of frontmatter
    if (trimmed === '---' && !inFrontmatter && !afterFrontmatter) {
      inFrontmatter = true;
      continue;
    }
    
    // End of frontmatter
    if (trimmed === '---' && inFrontmatter) {
      inFrontmatter = false;
      afterFrontmatter = true;
      continue;
    }
    
    // Inside frontmatter
    if (inFrontmatter) {
      // Top-level fields
      if (trimmed.startsWith('name:')) {
        name = trimmed.substring(5).trim();
      } else if (trimmed.startsWith('description:')) {
        description = trimmed.substring(12).trim();
      } else if (trimmed.startsWith('license:')) {
        license = trimmed.substring(8).trim();
      } else if (trimmed.startsWith('compatibility:')) {
        compatibility = trimmed.substring(14).trim();
      } else if (trimmed === 'metadata:') {
        inMetadata = true;
      } else if (inMetadata && line.startsWith('  ') && !line.startsWith('    ')) {
        // Second-level metadata keys
        const colonIndex = trimmed.indexOf(':');
        if (colonIndex > 0) {
          currentMetadataKey = trimmed.substring(0, colonIndex);
          const value = trimmed.substring(colonIndex + 1).trim();
          
          if (currentMetadataKey === 'domainMatch') {
            domainMatch = { type: 'exact', pattern: '*' };
          } else if (currentMetadataKey === 'intentTriggers') {
            intentTriggers = [];
          } else if (currentMetadataKey === 'safety') {
            safety = {};
          } else if (value) {
            // Simple string value
            customMetadata[currentMetadataKey] = value.replace(/^["']|["']$/g, '');
          }
        }
      } else if (inMetadata && line.startsWith('    ')) {
        // Third-level metadata values
        const keyValue = trimmed.split(':');
        if (keyValue.length === 2) {
          const key = keyValue[0].trim();
          const value = keyValue[1].trim().replace(/^["']|["']$/g, '');
          
          if (currentMetadataKey === 'domainMatch') {
            if (key === 'type' && (value === 'exact' || value === 'regex')) {
              domainMatch!.type = value;
            } else if (key === 'pattern') {
              domainMatch!.pattern = value;
            }
          } else if (currentMetadataKey === 'safety') {
            if (key === 'neverModifyPasswords') {
              safety.neverModifyPasswords = value === 'true';
            } else if (key === 'maxFieldLength') {
              safety.maxFieldLength = parseInt(value, 10);
            }
          }
        } else if (trimmed.startsWith('- ') && currentMetadataKey === 'intentTriggers') {
          intentTriggers.push(trimmed.substring(2));
        }
      }
    }
    
    // After frontmatter - collect instructions
    if (afterFrontmatter && trimmed !== '') {
      instructionLines.push(line);
    }
  }
  
  instructions = instructionLines.join('\n').trim();
  
  // Validation
  if (!name) {
    throw new Error('Skill name not found in frontmatter');
  }
  
  if (!description) {
    throw new Error('Skill description not found in frontmatter');
  }
  
  if (!instructions) {
    throw new Error('Instructions not found in markdown body');
  }
  
  // Build metadata object
  const metadata: Skill['metadata'] = {};
  
  if (domainMatch) {
    metadata.domainMatch = domainMatch;
  }
  
  if (intentTriggers.length > 0) {
    metadata.intentTriggers = intentTriggers;
  }
  
  if (Object.keys(safety).length > 0) {
    metadata.safety = safety;
  }
  
  // Add custom metadata
  Object.assign(metadata, customMetadata);
  
  return {
    id: `skill-${Date.now()}`,
    name,
    description,
    license,
    compatibility,
    metadata: Object.keys(metadata).length > 0 ? metadata : undefined,
    instructions,
  };
}

/**
 * Download a skill as a markdown file
 */
export function downloadSkillAsMarkdown(skill: Skill): void {
  const markdown = skillToMarkdown(skill);
  const blob = new Blob([markdown], { type: 'text/markdown' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${skill.name}.md`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Read a markdown file and parse it into a skill
 */
export async function readMarkdownFile(file: File): Promise<Skill> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const markdown = e.target?.result as string;
        const skill = markdownToSkill(markdown);
        resolve(skill);
      } catch (error) {
        reject(error);
      }
    };
    
    reader.onerror = () => {
      reject(new Error('Failed to read file'));
    };
    
    reader.readAsText(file);
  });
}
