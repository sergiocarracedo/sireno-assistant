import { Info, Zap } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import {
  AssistantMessage,
  ChatInput,
  ChatInputRef,
  EmptyChat,
  ErrorMessage,
  Select,
  ThinkingMessage,
  Tooltip,
  UserMessage,
} from '../../../shared/components';
import { Button, Label } from '../../../shared/components/ui';
import { skillMatchesDomain } from '../../../shared/skill-utils';
import type { ContextLevel, FieldRef, LLMResponse } from '../../../shared/types';
import FieldChangesMessage from './components/FieldChangesMessage';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
  changes?: LLMResponse;
  fields?: FieldRef[];
  appliedChanges?: boolean;
}

interface ChatTabProps {
  onNavigate: (view: 'chat' | 'skills' | 'settings' | 'fields') => void;
  initData?: {
    fieldId?: string;
    inputText?: string;
  } | null;
}

export default function ChatTab({ onNavigate, initData }: ChatTabProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [contextLevel, setContextLevel] = useState<ContextLevel>('selected');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentTabId, setCurrentTabId] = useState<number | null>(null);
  const [selectedFieldIds, setSelectedFieldIds] = useState<string[]>([]);
  const [totalFields, setTotalFields] = useState(0);
  const [activeSkillsCount, setActiveSkillsCount] = useState(0);
  const [activeSkillNames, setActiveSkillNames] = useState<string[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatInputRef = useRef<ChatInputRef>(null);

  // Auto-focus input when component mounts
  useEffect(() => {
    chatInputRef.current?.focus();
  }, []);

  // Handle init data from inline chat
  useEffect(() => {
    if (initData) {
      // Set input text if provided
      if (initData.inputText) {
        setInput(initData.inputText);
      }
      
      // Set selected fields to just this field
      if (initData.fieldId) {
        setSelectedFieldIds([initData.fieldId]);
        // Save to storage for this tab
        chrome.tabs.query({ active: true, currentWindow: true }).then(([tab]) => {
          if (tab.id) {
            chrome.storage.local.set({ [`selectedFields_${tab.id}`]: [initData.fieldId] });
          }
        });
      }
    }
  }, [initData]);

  // Auto-scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Load chat messages from storage on mount and tab changes
  useEffect(() => {
    loadChatHistory();
    loadSelectedFieldIds();
    scanFields();
    loadActiveSkills();

    // Listen for tab changes
    const handleTabActivated = () => {
      console.log('[ChatTab] Tab activated, reloading data...');
      loadChatHistory();
      loadSelectedFieldIds();
      scanFields();
      loadActiveSkills();
    };

    const handleTabUpdated = (tabId: number, changeInfo: chrome.tabs.TabChangeInfo) => {
      // Only reload if URL changed (page navigation)
      if (changeInfo.url) {
        console.log('[ChatTab] Tab URL changed, reloading data...');
        chrome.tabs.query({ active: true, currentWindow: true }).then(([tab]) => {
          if (tab.id === tabId) {
            loadChatHistory();
            loadSelectedFieldIds();
            scanFields();
            loadActiveSkills();
          }
        });
      }
    };

    chrome.tabs.onActivated.addListener(handleTabActivated);
    chrome.tabs.onUpdated.addListener(handleTabUpdated);

    return () => {
      chrome.tabs.onActivated.removeListener(handleTabActivated);
      chrome.tabs.onUpdated.removeListener(handleTabUpdated);
    };
  }, []);

  // Load selected field IDs from storage
  const loadSelectedFieldIds = async () => {
    try {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      if (!tab.id) return;
      
      const result = await chrome.storage.local.get(`selectedFields_${tab.id}`);
      if (result[`selectedFields_${tab.id}`]) {
        setSelectedFieldIds(result[`selectedFields_${tab.id}`]);
      }
    } catch (err) {
      console.error('Failed to load selected field IDs:', err);
    }
  };

  // Scan fields to get the total count
  const scanFields = async () => {
    try {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      if (!tab.id) return;
      
      console.log('[ChatTab] Scanning fields for tab', tab.id);
      const response = await chrome.tabs.sendMessage(tab.id, {
        type: 'SCAN_FIELDS',
      });
      
      if (response?.fields) {
        console.log('[ChatTab] Found', response.fields.length, 'fields');
        setTotalFields(response.fields.length);
      }
    } catch (err) {
      console.error('[ChatTab] Failed to scan fields:', err);
    }
  };

  // Load active skills count
  const loadActiveSkills = async () => {
    try {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      if (!tab.url) return;

      const url = new URL(tab.url);
      const domain = url.hostname;

      // Get all skills
      const response = await chrome.runtime.sendMessage({ type: 'GET_SKILLS' });
      if (response.type !== 'SKILLS_RESPONSE') return;

      // Filter active skills for this domain
      const activeSkills = response.skills.filter((skill: any) => 
        skillMatchesDomain(skill, domain, tab.url!)
      );

      setActiveSkillsCount(activeSkills.length);
      setActiveSkillNames(activeSkills.map((s: any) => s.name));
    } catch (err) {
      console.error('[ChatTab] Failed to load active skills:', err);
    }
  };

  // Save messages to storage whenever they change
  useEffect(() => {
    if (currentTabId !== null && messages.length > 0) {
      saveChatHistory();
    }
  }, [messages, currentTabId]);

  const loadChatHistory = async () => {
    try {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      if (!tab.id) return;
      
      setCurrentTabId(tab.id);
      
      const response = await chrome.runtime.sendMessage({
        type: 'GET_CHAT_MESSAGES',
        tabId: tab.id,
      });
      
      if (response?.messages) {
        setMessages(response.messages);
      }
    } catch (err) {
      console.error('Failed to load chat history:', err);
    }
  };

  const saveChatHistory = async () => {
    if (currentTabId === null) return;
    
    try {
      await chrome.runtime.sendMessage({
        type: 'SAVE_CHAT_MESSAGES',
        tabId: currentTabId,
        messages,
      });
    } catch (err) {
      console.error('Failed to save chat history:', err);
    }
  };

  const handleClearChat = async () => {
    if (!confirm('Clear all chat messages for this tab?')) return;
    
    setMessages([]);
    
    if (currentTabId !== null) {
      try {
        await chrome.runtime.sendMessage({
          type: 'CLEAR_CHAT_MESSAGES',
          tabId: currentTabId,
        });
      } catch (err) {
        console.error('Failed to clear chat history:', err);
      }
    }
  };

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage = input.trim();
    setMessages((prev) => [...prev, { role: 'user', content: userMessage, timestamp: Date.now() }]);
    setInput('');
    setLoading(true);
    setError(null);

    try {
      console.log('[ChatTab] Starting LLM request...');
      
      // Get current tab
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      if (!tab.id) throw new Error('No active tab');
      console.log('[ChatTab] Current tab ID:', tab.id);

      // Scan fields
      console.log('[ChatTab] Scanning fields...');
      let fieldsResponse: any;
      try {
        fieldsResponse = await chrome.tabs.sendMessage(tab.id, {
          type: 'SCAN_FIELDS',
        });
      } catch (err: any) {
        // Check if error is due to content script not loaded
        if (err.message?.includes('Could not establish connection') || 
            err.message?.includes('Receiving end does not exist')) {
          throw new Error('Content script not loaded. Please refresh the page and try again.');
        }
        throw err;
      }
      console.log('[ChatTab] Fields response:', fieldsResponse);

      if (!fieldsResponse?.fields || fieldsResponse.fields.length === 0) {
        throw new Error('No fields found on this page. Try refreshing the page or selecting a page with input fields.');
      }

      // Extract context
      console.log('[ChatTab] Extracting context with level:', contextLevel);
      let contextResponse: any;
      try {
        contextResponse = await chrome.tabs.sendMessage(tab.id, {
          type: 'EXTRACT_CONTEXT',
          level: contextLevel,
          selectedIds: selectedFieldIds,
        });
      } catch (err: any) {
        // Check if error is due to content script not loaded
        if (err.message?.includes('Could not establish connection') || 
            err.message?.includes('Receiving end does not exist')) {
          throw new Error('Content script not loaded. Please refresh the page and try again.');
        }
        throw err;
      }
      
      if (!contextResponse) {
        throw new Error('Failed to extract context from page');
      }
      
      console.log('[ChatTab] Context extracted:', contextResponse);

      // Load active skills for this domain
      let activeSkills: any[] = [];
      if (tab.url) {
        const url = new URL(tab.url);
        const domain = url.hostname;
        
        const skillsResponse = await chrome.runtime.sendMessage({ type: 'GET_SKILLS' });
        if (skillsResponse.type === 'SKILLS_RESPONSE') {
          activeSkills = skillsResponse.skills.filter((skill: any) => 
            skillMatchesDomain(skill, domain, tab.url!)
          );
          
          if (activeSkills.length > 0) {
            console.log('[ChatTab] Using active skills:', activeSkills.map(s => s.name).join(', '));
          }
        }
      }

      // Run LLM
      console.log('[ChatTab] Running LLM...');
      const llmResponse = await chrome.runtime.sendMessage({
        type: 'RUN_LLM',
        request: {
          instruction: userMessage,
          context: contextResponse.context,
          fields: fieldsResponse.fields,
          skills: activeSkills,
        },
      });
      console.log('[ChatTab] LLM response:', llmResponse);

      if (llmResponse.type === 'LLM_ERROR') {
        throw new Error(llmResponse.error);
      }

      if (llmResponse.type === 'LLM_COMPLETE') {
        setMessages((prev) => [
          ...prev,
          {
            role: 'assistant',
            content: `I've analyzed the fields and prepared ${llmResponse.response.changes.length} changes. Please review and apply them.`,
            timestamp: Date.now(),
            changes: llmResponse.response,
            fields: fieldsResponse.fields,
          },
        ]);
      }
    } catch (err) {
      console.error('[ChatTab] Error during LLM request:', err);
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: `Error: ${errorMessage}`, timestamp: Date.now() },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleApplyChanges = async (messageIndex: number, changes: LLMResponse) => {
    try {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      if (!tab.id) return;

      // Get fields again
      let fieldsResponse: any;
      try {
        fieldsResponse = await chrome.tabs.sendMessage(tab.id, {
          type: 'SCAN_FIELDS',
        });
      } catch (err: any) {
        if (err.message?.includes('Could not establish connection') || 
            err.message?.includes('Receiving end does not exist')) {
          throw new Error('Content script not loaded. Please refresh the page and try again.');
        }
        throw err;
      }
      
      if (!fieldsResponse) {
        throw new Error('Failed to scan fields');
      }

      // Apply changes
      await chrome.tabs.sendMessage(tab.id, {
        type: 'APPLY_CHANGES',
        changes: changes.changes,
        fields: fieldsResponse.fields,
      });

      await chrome.tabs.sendMessage(tab.id, {
        type: 'APPLY_CHANGES',
        changes: changes.changes,
        fields: fieldsResponse.fields,
      });

      // Mark message as applied
      setMessages((prev) => 
        prev.map((msg, idx) => 
          idx === messageIndex 
            ? { ...msg, appliedChanges: true }
            : msg
        )
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to apply changes');
    }
  };

  const handleRejectChanges = (messageIndex: number) => {
    setMessages((prev) => prev.filter((_, idx) => idx !== messageIndex));
  };

  return (
    <div className="flex flex-col h-full">
      {/* Configuration Box */}
      <div className="mb-4 p-3 bg-gray-50 dark:bg-gray-900/50 rounded-lg border border-gray-200 dark:border-gray-800">
        <div className="flex gap-3 items-end mb-3">
          <div className="flex-1">
            <div className="flex items-center gap-1 mb-1">
              <Label className="text-xs">Context Level</Label>
              <Tooltip
                content={
                  <div className="space-y-1">
                    <p className="font-semibold">Context Level determines what information the AI sees:</p>
                    <p><strong>None:</strong> No context</p>
                    <p><strong>Domain:</strong> Current website domain</p>
                    <p><strong>URL:</strong> Full page URL</p>
                    <p><strong>Selected Fields:</strong> Field labels and values</p>
                    <p><strong>All Page:</strong> Entire page text content</p>
                  </div>
                }
                side="right"
              >
                <Info className="h-3.5 w-3.5 text-gray-400 cursor-help" />
              </Tooltip>
            </div>
            <Select
              options={[
                { value: 'none', label: 'None' },
                { value: 'domain', label: 'Domain' },
                { value: 'url', label: 'URL' },
                { value: 'selected', label: 'Selected Fields' },
                { value: 'allPage', label: 'All Page' },
              ]}
              value={contextLevel}
              onChange={(value) => setContextLevel(value as ContextLevel)}
              disabled={loading}
            />
          </div>
          
          <div className="space-y-1">
            <Label className="text-xs block">Fields</Label>
            <div className="flex gap-2">
              <button
                onClick={() => onNavigate('fields')}
                className="text-sm font-semibold text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-900 px-3 py-2 rounded-md border border-gray-300 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors h-9 flex items-center cursor-pointer"
              >
                {selectedFieldIds.length}/{totalFields}
              </button>
              {activeSkillsCount > 0 && (
                <Tooltip
                  content={
                    <div>
                      <p className="font-semibold">{activeSkillsCount} active skill{activeSkillsCount !== 1 ? 's' : ''} on this page</p>
                      {activeSkillNames.length > 0 && (
                        <ul className="text-xs text-gray-400 dark:text-gray-500 mt-1 space-y-0.5">
                          {activeSkillNames.map((name, i) => (
                            <li key={i}>• {name}</li>
                          ))}
                        </ul>
                      )}
                      <p className="text-xs text-gray-400 dark:text-gray-600 mt-2">Click to view</p>
                    </div>
                  }
                >
                  <button
                    onClick={() => onNavigate('skills')}
                    className="text-sm font-semibold text-green-700 dark:text-green-400 bg-green-50 dark:bg-green-950/30 px-3 py-2 rounded-md border border-green-300 dark:border-green-800 hover:bg-green-100 dark:hover:bg-green-900/30 transition-colors h-9 flex items-center cursor-pointer gap-1"
                    title="Active skills"
                  >
                    <Zap className="h-3.5 w-3.5" />
                    {activeSkillsCount}
                  </button>
                </Tooltip>
              )}
            </div>
          </div>
        </div>
      
      {messages.length > 0 && (
        <Button
          variant="secondary"
          size="sm"
          onClick={handleClearChat}
          className="w-full"
        >
          Clear Chat
        </Button>
      )}
    </div>

    {/* Messages Area */}
    <div className="flex-1 overflow-y-auto mb-4 space-y-3">
      {messages.length === 0 && <EmptyChat />}

      {messages.map((msg, idx) => (
        <div key={idx} className="px-1">
          {msg.role === 'user' ? (
            <UserMessage content={msg.content} />
          ) : (
            <div className="flex justify-start w-full">
              <div className="w-full">
                {msg.changes ? (
                  <FieldChangesMessage
                    response={msg.changes}
                    fields={msg.fields || []}
                    onApply={() => handleApplyChanges(idx, msg.changes!)}
                    onReject={() => handleRejectChanges(idx)}
                    applied={msg.appliedChanges}
                  />
                ) : (
                  <AssistantMessage content={msg.content} />
                )}
              </div>
            </div>
          )}
        </div>
      ))}

      {loading && <ThinkingMessage subtle />}
      {error && <ErrorMessage error={error} />}

      <div ref={messagesEndRef} />
    </div>

    {/* Input Area */}
    <div className="border-t border-gray-200 dark:border-gray-800 pt-3">
      <ChatInput
        ref={chatInputRef}
        value={input}
        onChange={setInput}
        onSubmit={handleSend}
        placeholder="What do you want to do?"
        loading={loading}
      />
    </div>
    </div>
  );
}
