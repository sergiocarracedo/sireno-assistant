import type { ContextBundle, FieldRef, LLMResponse, Skill, LLMLogEntry } from "./types";
import type { ChatMessage, ExcludedField } from "../background/storage";

/**
 * Message types for communication between extension contexts
 */

// Content script -> Side panel
export type ContentToSidePanelMessage =
  | { type: "FIELDS_SCANNED"; fields: FieldRef[] }
  | { type: "SELECTION_UPDATED"; selectedIds: string[] }
  | { type: "CONTEXT_EXTRACTED"; context: ContextBundle };

// Side panel -> Content script
export type SidePanelToContentMessage =
  | { type: "SCAN_FIELDS" }
  | { type: "ENTER_SELECT_MODE" }
  | { type: "EXIT_SELECT_MODE" }
  | { type: "TOGGLE_FIELD"; fieldId: string }
  | { type: "FOCUS_FIELD"; fieldId: string }
  | { type: "HIGHLIGHT_FIELD"; fieldId: string; duration?: number }
  | { type: "EXTRACT_CONTEXT"; level: ContextBundle["level"]; selectedIds: string[] }
  | { type: "APPLY_CHANGES"; changes: LLMResponse["changes"]; fields: FieldRef[] }
  | { type: "FIELD_UNEXCLUDED"; fieldId: string };

// Side panel -> Service worker (via Port or sendMessage)
export interface RunLLMRequest {
  instruction: string;
  context: ContextBundle;
  fields: FieldRef[];
  skill?: Skill; // Deprecated: use skills array instead
  skills?: Skill[]; // Multiple active skills
}

export type SidePanelToServiceWorkerMessage =
  | { type: "RUN_LLM"; request: RunLLMRequest }
  | { type: "VALIDATE_CONFIG" }
  | { type: "GET_CONFIG" }
  | { type: "SET_CONFIG"; config: Partial<import("./types").ExtensionConfig> }
  | { type: "GET_SKILLS"; url?: string }
  | { type: "SAVE_SKILL"; skill: Skill }
  | { type: "DELETE_SKILL"; skillId: string }
  | { type: "GET_CHAT_MESSAGES"; tabId: number }
  | { type: "SAVE_CHAT_MESSAGES"; tabId: number; messages: ChatMessage[] }
  | { type: "CLEAR_CHAT_MESSAGES"; tabId: number }
  | {
      type: "RUN_INLINE_LLM";
      fieldId: string;
      fieldLabel: string;
      fieldPlaceholder?: string;
      instruction: string;
      currentValue: string;
    }
  | { type: "GET_LLM_LOGS" }
  | { type: "CLEAR_LLM_LOGS" }
  | { type: "OPEN_SIDEBAR_CHAT"; fieldId: string; inputText: string }
  | { type: "OPEN_SIDEBAR_SKILLS" }
  | { type: "GET_EXCLUDED_FIELDS"; url: string }
  | { type: "ADD_EXCLUDED_FIELD"; fieldId: string; fieldLabel: string; url: string }
  | { type: "REMOVE_EXCLUDED_FIELD"; url: string; fieldId: string }
  | { type: "EXCLUDE_FIELD"; fieldId: string; fieldLabel: string }
  | { type: "IS_FIELD_EXCLUDED"; url: string; fieldId: string }
  | { type: "DEBUG_DUMP_STORAGE" };

// Service worker -> Side panel (streaming or response)
export type ServiceWorkerToSidePanelMessage =
  | { type: "LLM_PROGRESS"; partial?: Partial<LLMResponse> }
  | { type: "LLM_COMPLETE"; response: LLMResponse }
  | { type: "LLM_ERROR"; error: string }
  | { type: "CONFIG_RESPONSE"; config: import("./types").ExtensionConfig }
  | { type: "SKILLS_RESPONSE"; skills: Skill[] }
  | { type: "CHAT_MESSAGES_RESPONSE"; messages: ChatMessage[] }
  | { type: "CHAT_MESSAGES_SAVED" }
  | { type: "CHAT_MESSAGES_CLEARED" }
  | { type: "INLINE_LLM_COMPLETE"; newValue: string }
  | { type: "LLM_LOGS_RESPONSE"; logs: LLMLogEntry[] }
  | { type: "LLM_LOGS_CLEARED" }
  | { type: "SIDEBAR_OPENED"; view: "chat" | "skills" }
  | { type: "EXCLUDED_FIELDS_RESPONSE"; fields: ExcludedField[] }
  | { type: "EXCLUDED_FIELD_ADDED" }
  | { type: "EXCLUDED_FIELD_REMOVED" }
  | { type: "FIELD_EXCLUDED" }
  | { type: "FIELD_EXCLUDED_RESPONSE"; isExcluded: boolean }
  | { type: "DEBUG_STORAGE_DUMP"; data: any };
