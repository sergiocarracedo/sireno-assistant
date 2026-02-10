/**
 * Shared types for the extension
 */

export type Provider = 'openai' | 'anthropic' | 'google' | 'groq';

export type ContextLevel = 'none' | 'domain' | 'url' | 'selected' | 'allPage';

export type FieldAction = 'replace' | 'append' | 'clear' | 'skip';

export interface FieldRef {
  /** Unique ID for this field in the current session */
  id: string;
  /** Frame ID where the field lives */
  frameId: number;
  /** Best-effort selector */
  selector: string;
  /** Field type (input, textarea, contenteditable, file) */
  kind: 'input' | 'textarea' | 'contenteditable' | 'file';
  /** Input type attribute (for input elements) */
  inputType?: string;
  /** Human-readable label/name/placeholder */
  labelHint: string;
  /** Current value */
  value: string;
}

/**
 * Skill following Agent Skills specification (https://agentskills.io/specification)
 */
export interface Skill {
  /** Unique identifier (internal, not part of spec) */
  id: string;
  /** Required: Skill name (1-64 chars, lowercase, hyphens only) */
  name: string;
  /** Required: Description of what skill does and when to use it (1-1024 chars) */
  description: string;
  /** Optional: License information */
  license?: string;
  /** Optional: Environment requirements */
  compatibility?: string;
  /** Optional: Additional metadata (domain matching, safety, etc.) */
  metadata?: {
    /** Domain matching configuration */
    domainMatch?: {
      type: 'exact' | 'regex';
      pattern: string;
    };
    /** Intent keywords for activation */
    intentTriggers?: string[];
    /** Safety settings */
    safety?: {
      neverModifyPasswords?: boolean;
      maxFieldLength?: number;
    };
    /** Custom metadata */
    [key: string]: any;
  };
  /** Skill instructions (the body content) */
  instructions: string;
}

export interface ExtensionConfig {
  provider: Provider;
  model: string;
  apiKey: string;
  temperature?: number;
  maxTokens?: number;
  /** Character limit for "allPage" context */
  allPageTextLimit?: number;
  /** Show spark icons on hover (default: true) */
  showSparkOnHover?: boolean;
  /** Enable LLM request/response logging (default: false) */
  enableLogging?: boolean;
}

/** LLM log entry */
export interface LLMLogEntry {
  id: string;
  timestamp: number;
  type: 'chat' | 'inline';
  request: {
    model: string;
    messages: Array<{ role: string; content: string }>;
    temperature?: number;
  };
  response: {
    text: string;
    usage?: {
      promptTokens?: number;
      completionTokens?: number;
      totalTokens?: number;
    };
  };
  error?: string;
}

export interface ContextBundle {
  level: ContextLevel;
  domain?: string;
  url?: string;
  selectedFields?: FieldRef[];
  pageText?: string;
  /** Current date and time in user's locale */
  dateTime?: string;
  /** Browser language (e.g., "en-US", "es-ES") */
  language?: string;
}

export interface LLMChange {
  /** Index into the selectedFields array */
  fieldIndex: number;
  action: FieldAction;
  value: string;
  rationale?: string;
}

export interface LLMResponse {
  changes: LLMChange[];
  globalNotes?: string;
}

export interface TabState {
  /** Selected field IDs for this tab */
  selectedFieldIds: string[];
  /** Context level setting for this tab */
  contextLevel: ContextLevel;
  /** Whether extension is active on this tab */
  hasActiveSession: boolean;
  /** Last updated timestamp */
  lastUpdated: number;
}
