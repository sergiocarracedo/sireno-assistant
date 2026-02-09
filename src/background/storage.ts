import type { ExtensionConfig, Skill, LLMLogEntry } from '../shared/types';
import { DEFAULT_SKILLS } from '../shared/skill-templates';
import { skillMatchesDomain } from '../shared/skill-utils';
import { createLogger } from '../shared/logger';

const logger = createLogger('Storage');

const DEFAULT_CONFIG: ExtensionConfig = {
  provider: 'openai',
  model: 'gpt-5.2',
  apiKey: '',
  temperature: 0.7,
  maxTokens: 2000,
  allPageTextLimit: 10000,
  showSparkOnHover: true,
  enableLogging: false,
};

/**
 * Get extension configuration from chrome.storage
 */
export async function getConfig(): Promise<ExtensionConfig> {
  const result = await chrome.storage.sync.get('config');
  return { ...DEFAULT_CONFIG, ...(result.config || {}) };
}

/**
 * Save extension configuration to chrome.storage
 */
export async function setConfig(config: Partial<ExtensionConfig>): Promise<void> {
  const current = await getConfig();
  const updated = { ...current, ...config };
  await chrome.storage.sync.set({ config: updated });
}

/**
 * Get all skills from chrome.storage
 * Returns default skills if no custom skills exist
 */
export async function getSkills(): Promise<Skill[]> {
  const result = await chrome.storage.sync.get('skills');
  const customSkills = result.skills || [];
  
  // If no custom skills, return defaults
  if (customSkills.length === 0) {
    return DEFAULT_SKILLS;
  }
  
  return customSkills;
}

/**
 * Save a skill (create or update)
 */
export async function saveSkill(skill: Skill): Promise<void> {
  const skills = await getSkills();
  const index = skills.findIndex((s) => s.id === skill.id);
  if (index >= 0) {
    skills[index] = skill;
  } else {
    skills.push(skill);
  }
  await chrome.storage.sync.set({ skills });
}

/**
 * Delete a skill by ID
 */
export async function deleteSkill(skillId: string): Promise<void> {
  const skills = await getSkills();
  const filteredSkills = skills.filter((s) => s.id !== skillId);
  await chrome.storage.sync.set({ skills: filteredSkills });
}

/**
 * Filters skills by domain match pattern
 */
export async function getActiveSkills(domain: string, url: string): Promise<Skill[]> {
  const allSkills = await getSkills();
  const disabledIds = await getDisabledSkillIds();
  
  return allSkills.filter((skill) => 
    !disabledIds.includes(skill.id) && 
    skillMatchesDomain(skill, domain, url)
  );
}

/**
 * Check if a skill is manually disabled
 */
export async function isSkillDisabled(skillId: string): Promise<boolean> {
  const key = `skill_disabled_${skillId}`;
  const result = await chrome.storage.local.get(key);
  return result[key] === true;
}

/**
 * Set skill enabled/disabled state
 */
export async function setSkillDisabled(skillId: string, disabled: boolean): Promise<void> {
  const key = `skill_disabled_${skillId}`;
  if (disabled) {
    await chrome.storage.local.set({ [key]: true });
    logger.info(`Skill disabled: ${skillId}`);
  } else {
    await chrome.storage.local.remove(key);
    logger.info(`Skill enabled: ${skillId}`);
  }
}

/**
 * Get all disabled skill IDs
 */
export async function getDisabledSkillIds(): Promise<string[]> {
  const allItems = await chrome.storage.local.get(null);
  const disabledIds: string[] = [];
  
  for (const key in allItems) {
    if (key.startsWith('skill_disabled_') && allItems[key] === true) {
      const skillId = key.replace('skill_disabled_', '');
      disabledIds.push(skillId);
    }
  }
  
  return disabledIds;
}

/**
 * Message type for chat history
 */
export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
}

/**
 * Get chat messages for a specific tab
 */
export async function getChatMessages(tabId: number): Promise<ChatMessage[]> {
  const key = `chat_messages_${tabId}`;
  const result = await chrome.storage.local.get(key);
  return result[key] || [];
}

/**
 * Save chat messages for a specific tab
 */
export async function saveChatMessages(tabId: number, messages: ChatMessage[]): Promise<void> {
  const key = `chat_messages_${tabId}`;
  await chrome.storage.local.set({ [key]: messages });
}

/**
 * Clear chat messages for a specific tab
 */
export async function clearChatMessages(tabId: number): Promise<void> {
  const key = `chat_messages_${tabId}`;
  await chrome.storage.local.remove(key);
}

/**
 * Cleanup old chat messages for tabs that no longer exist
 */
export async function cleanupOldChats(): Promise<void> {
  // Get all storage keys
  const allItems = await chrome.storage.local.get(null);
  const chatKeys = Object.keys(allItems).filter((key) => key.startsWith('chat_messages_'));
  
  // Get all currently open tabs
  const tabs = await chrome.tabs.query({});
  const activeTabIds = new Set(tabs.map((tab) => tab.id));
  
  // Remove chat history for tabs that no longer exist
  const keysToRemove: string[] = [];
  for (const key of chatKeys) {
    const tabId = parseInt(key.replace('chat_messages_', ''), 10);
    if (!activeTabIds.has(tabId)) {
      keysToRemove.push(key);
    }
  }
  
  if (keysToRemove.length > 0) {
    await chrome.storage.local.remove(keysToRemove);
    logger.info(`Cleaned up ${keysToRemove.length} old chat histories`);
  }
}

/**
 * Tab state management
 */
import type { TabState } from '../shared/types';

const DEFAULT_TAB_STATE: TabState = {
  selectedFieldIds: [],
  contextLevel: 'selected',
  hasActiveSession: false,
  lastUpdated: Date.now(),
};

/**
 * Get tab state for a specific tab
 */
export async function getTabState(tabId: number): Promise<TabState> {
  const key = `tab_state_${tabId}`;
  const result = await chrome.storage.local.get(key);
  return result[key] || { ...DEFAULT_TAB_STATE };
}

/**
 * Save tab state for a specific tab
 */
export async function saveTabState(tabId: number, state: Partial<TabState>): Promise<void> {
  const current = await getTabState(tabId);
  const updated = { ...current, ...state, lastUpdated: Date.now() };
  const key = `tab_state_${tabId}`;
  await chrome.storage.local.set({ [key]: updated });
}

/**
 * Clear tab state for a specific tab
 */
export async function clearTabState(tabId: number): Promise<void> {
  const key = `tab_state_${tabId}`;
  await chrome.storage.local.remove(key);
}

/**
 * Get all LLM logs
 */
export async function getLLMLogs(): Promise<LLMLogEntry[]> {
  const result = await chrome.storage.local.get('llmLogs');
  return result.llmLogs || [];
}

/**
 * Add an LLM log entry (only if logging is enabled)
 */
export async function addLLMLog(entry: Omit<LLMLogEntry, 'id' | 'timestamp'>): Promise<void> {
  const config = await getConfig();
  if (!config.enableLogging) return; // Don't log if disabled
  
  const logs = await getLLMLogs();
  const newEntry: LLMLogEntry = {
    ...entry,
    id: `log_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    timestamp: Date.now(),
  };
  
  logs.unshift(newEntry); // Add to beginning
  
  // Keep only last 100 logs
  const trimmedLogs = logs.slice(0, 100);
  
  await chrome.storage.local.set({ llmLogs: trimmedLogs });
}

/**
 * Clear all LLM logs
 */
export async function clearLLMLogs(): Promise<void> {
  await chrome.storage.local.remove('llmLogs');
}

/**
 * Excluded field info
 */
export interface ExcludedField {
  fieldId: string;
  fieldLabel: string;
  url: string;
  timestamp: number;
}

/**
 * Get excluded fields for a specific URL
 */
export async function getExcludedFields(url: string): Promise<ExcludedField[]> {
  const key = `excluded_fields_${url}`;
  logger.debug('getExcludedFields - key:', key);
  const result = await chrome.storage.local.get(key);
  logger.debug('getExcludedFields - result:', result);
  const fields = result[key] || [];
  logger.debug('getExcludedFields - returning:', fields);
  return fields;
}

/**
 * Add a field to the excluded list
 */
export async function addExcludedField(field: Omit<ExcludedField, 'timestamp'>): Promise<void> {
  logger.debug('addExcludedField called with:', field);
  const excludedFields = await getExcludedFields(field.url);
  logger.debug('Current excluded fields:', excludedFields);
  
  // Check if already excluded
  if (excludedFields.some((f) => f.fieldId === field.fieldId)) {
    logger.debug('Field already excluded, skipping');
    return;
  }
  
  const newField: ExcludedField = {
    ...field,
    timestamp: Date.now(),
  };
  
  excludedFields.push(newField);
  
  const key = `excluded_fields_${field.url}`;
  logger.debug('Saving to key:', key, 'with data:', excludedFields);
  
  try {
    await chrome.storage.local.set({ [key]: excludedFields });
    logger.debug('Storage write completed');
    
    // Verify the write
    const verification = await chrome.storage.local.get(key);
    logger.debug('Verification read:', verification);
    
    if (!verification[key]) {
      logger.error('VERIFICATION FAILED: Key not found in storage after write!');
    } else if (verification[key].length !== excludedFields.length) {
      logger.error('VERIFICATION FAILED: Array length mismatch!');
    } else {
      logger.debug('Verification successful - data saved correctly');
    }
  } catch (error) {
    logger.error('Failed to save excluded field:', error);
    throw error;
  }
  
  logger.debug(`Added field to excluded list: ${field.fieldId} on ${field.url}`);
}

/**
 * Remove a field from the excluded list
 */
export async function removeExcludedField(url: string, fieldId: string): Promise<void> {
  const excludedFields = await getExcludedFields(url);
  const filtered = excludedFields.filter((f) => f.fieldId !== fieldId);
  
  const key = `excluded_fields_${url}`;
  await chrome.storage.local.set({ [key]: filtered });
  logger.debug(`Removed field from excluded list: ${fieldId} on ${url}`);
}

/**
 * Check if a field is excluded
 */
export async function isFieldExcluded(url: string, fieldId: string): Promise<boolean> {
  const excludedFields = await getExcludedFields(url);
  return excludedFields.some((f) => f.fieldId === fieldId);
}

/**
 * Clear all excluded fields for a specific URL
 */
export async function clearExcludedFields(url: string): Promise<void> {
  const key = `excluded_fields_${url}`;
  await chrome.storage.local.remove(key);
  logger.debug(`Cleared all excluded fields for ${url}`);
}
