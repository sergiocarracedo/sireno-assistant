import type {
  SidePanelToServiceWorkerMessage,
  ServiceWorkerToSidePanelMessage,
} from "../shared/messages";
import {
  getConfig,
  setConfig,
  getSkills,
  saveSkill,
  deleteSkill,
  getChatMessages,
  saveChatMessages,
  clearChatMessages,
  getLLMLogs,
  clearLLMLogs,
  addLLMLog,
  getExcludedFields,
  addExcludedField,
  removeExcludedField,
} from "./storage";
import { LLMClient } from "./llm-client";
import { skillMatchesDomain } from "../shared/skill-utils";
import { createLogger } from "../shared/logger";
import { getCurrentDateTime, getBrowserLanguage } from "../shared/i18n";

const logger = createLogger("MessageHandler");

/**
 * Handle messages from the side panel
 */
export async function handleMessage(
  message: SidePanelToServiceWorkerMessage,
  sender: chrome.runtime.MessageSender,
  sendResponse: (response: ServiceWorkerToSidePanelMessage) => void,
): Promise<void> {
  try {
    switch (message.type) {
      case "GET_CONFIG": {
        const config = await getConfig();
        sendResponse({ type: "CONFIG_RESPONSE", config });
        break;
      }

      case "SET_CONFIG": {
        await setConfig(message.config);
        const config = await getConfig();
        sendResponse({ type: "CONFIG_RESPONSE", config });

        // Notify all content scripts that config was updated
        chrome.tabs.query({}).then((tabs) => {
          tabs.forEach((tab) => {
            if (tab.id) {
              chrome.tabs.sendMessage(tab.id, { type: "CONFIG_UPDATED" }).catch(() => {
                // Ignore errors (tab might not have content script)
              });
            }
          });
        });
        break;
      }

      case "GET_SKILLS": {
        const skills = await getSkills();

        // If URL is provided, filter to only active skills for that domain
        if (message.url) {
          try {
            const url = new URL(message.url);
            const domain = url.hostname;
            const activeSkills = skills.filter((skill: any) =>
              skillMatchesDomain(skill, domain, message.url!),
            );
            sendResponse({ type: "SKILLS_RESPONSE", skills: activeSkills });
          } catch {
            // Invalid URL, return all skills
            sendResponse({ type: "SKILLS_RESPONSE", skills });
          }
        } else {
          // No URL provided, return all skills
          sendResponse({ type: "SKILLS_RESPONSE", skills });
        }
        break;
      }

      case "SAVE_SKILL": {
        await saveSkill(message.skill);
        const skills = await getSkills();
        sendResponse({ type: "SKILLS_RESPONSE", skills });
        break;
      }

      case "DELETE_SKILL": {
        await deleteSkill(message.skillId);
        const skills = await getSkills();
        sendResponse({ type: "SKILLS_RESPONSE", skills });
        break;
      }

      case "RUN_LLM": {
        const config = await getConfig();

        // Validate API key for current provider
        const { apiKey } = config.providerConfigs[config.provider];
        if (!apiKey) {
          sendResponse({ type: "LLM_ERROR", error: "API key not configured" });
          return;
        }

        const client = new LLMClient(config);

        try {
          const response = await client.run(message.request);

          // Log if enabled
          if (config.enableLogging) {
            const systemPrompt = buildSystemPromptForLogging(message.request);
            const userPrompt = buildUserPromptForLogging(message.request);
            const { model } = config.providerConfigs[config.provider];

            await addLLMLog({
              type: "chat",
              request: {
                model: model,
                messages: [
                  { role: "system", content: systemPrompt },
                  { role: "user", content: userPrompt },
                ],
                temperature: config.temperature,
              },
              response: {
                text: JSON.stringify(response, null, 2),
              },
            });
          }

          sendResponse({ type: "LLM_COMPLETE", response });
        } catch (error) {
          // Log errors too if enabled
          if (config.enableLogging) {
            const systemPrompt = buildSystemPromptForLogging(message.request);
            const userPrompt = buildUserPromptForLogging(message.request);
            const { model } = config.providerConfigs[config.provider];

            await addLLMLog({
              type: "chat",
              request: {
                model: model,
                messages: [
                  { role: "system", content: systemPrompt },
                  { role: "user", content: userPrompt },
                ],
                temperature: config.temperature,
              },
              response: {
                text: "",
              },
              error: error instanceof Error ? error.message : "Unknown error",
            });
          }

          sendResponse({
            type: "LLM_ERROR",
            error: error instanceof Error ? error.message : "Unknown error",
          });
        }
        break;
      }

      case "VALIDATE_CONFIG": {
        const config = await getConfig();
        const { apiKey } = config.providerConfigs[config.provider];
        if (!apiKey) {
          sendResponse({ type: "LLM_ERROR", error: "API key not set" });
        } else {
          sendResponse({ type: "CONFIG_RESPONSE", config });
        }
        break;
      }

      case "GET_CHAT_MESSAGES": {
        const messages = await getChatMessages(message.tabId);
        sendResponse({ type: "CHAT_MESSAGES_RESPONSE", messages });
        break;
      }

      case "SAVE_CHAT_MESSAGES": {
        await saveChatMessages(message.tabId, message.messages);
        sendResponse({ type: "CHAT_MESSAGES_SAVED" });
        break;
      }

      case "CLEAR_CHAT_MESSAGES": {
        await clearChatMessages(message.tabId);
        sendResponse({ type: "CHAT_MESSAGES_CLEARED" });
        break;
      }

      case "RUN_INLINE_LLM": {
        const config = await getConfig();
        const { apiKey } = config.providerConfigs[config.provider];

        if (!apiKey) {
          sendResponse({ type: "LLM_ERROR", error: "API key not configured" });
          return;
        }

        try {
          // Get the active tab to determine domain
          const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
          const activeTab = tabs[0];

          // Load active skills for this domain
          let activeSkills: any[] = [];
          if (activeTab?.url) {
            const url = new URL(activeTab.url);
            const domain = url.hostname;

            const allSkills = await getSkills();
            activeSkills = allSkills.filter((skill: any) =>
              skillMatchesDomain(skill, domain, activeTab.url!),
            );
            logger.debug("Loaded", activeSkills.length, "active skills for", domain);
          }

          // For inline LLM, we use the AI to transform the current value
          const client = new LLMClient(config);

          // Build field context
          let fieldContext = "";
          if (message.fieldLabel) {
            fieldContext += `Field label: "${message.fieldLabel}"\n`;
          }
          if (message.fieldPlaceholder) {
            fieldContext += `Field placeholder: "${message.fieldPlaceholder}"\n`;
          }
          if (fieldContext) {
            fieldContext += "\n";
          }

          // Add date/time and language context
          const dateTime = getCurrentDateTime();
          const language = getBrowserLanguage();
          const contextInfo = `Current date and time: ${dateTime}\nBrowser language: ${language}\n\n`;

          // Create a prompt with context about the current value
          const currentValueContext = message.currentValue
            ? `Current field value: "${message.currentValue}"\n\n`
            : "The field is currently empty.\n\n";

          // Build system prompt with skills
          let systemPrompt = `You are a helpful assistant that transforms field values based on user instructions.

IMPORTANT: Provide ONLY the new/transformed text value for the field. Do not include any explanations, quotes, or markdown. Just output the raw result text.`;

          // Add active skills to system prompt
          if (activeSkills.length > 0) {
            systemPrompt += `\n\nACTIVE SKILLS (${activeSkills.length}):\n`;
            activeSkills.forEach((skill, index) => {
              systemPrompt += `\n${index + 1}. "${skill.name}"\n${skill.instructions}\n`;
            });
            systemPrompt += `\nApply all active skill instructions when transforming the field value.`;
          }

          const userPrompt = `${contextInfo}${fieldContext}${currentValueContext}User instruction: "${message.instruction}"`;

          // Use the AI SDK's generateText for simple text generation
          const { generateText } = await import("ai");
          const modelInstance = client.getModelInstance();

          const result = await generateText({
            model: modelInstance,
            messages: [
              { role: "system", content: systemPrompt },
              { role: "user", content: userPrompt },
            ],
            temperature: config.temperature || 0.7,
          });

          // Log if enabled
          if (config.enableLogging) {
            const { model } = config.providerConfigs[config.provider];
            await addLLMLog({
              type: "inline",
              request: {
                model: model,
                messages: [
                  { role: "system", content: systemPrompt },
                  { role: "user", content: userPrompt },
                ],
                temperature: config.temperature,
              },
              response: {
                text: result.text.trim(),
                usage: result.usage
                  ? {
                      totalTokens: result.usage.totalTokens || 0,
                    }
                  : undefined,
              },
            });
          }

          sendResponse({ type: "INLINE_LLM_COMPLETE", newValue: result.text.trim() });
        } catch (error) {
          sendResponse({
            type: "LLM_ERROR",
            error: error instanceof Error ? error.message : "Unknown error",
          });
        }
        break;
      }

      case "GET_LLM_LOGS": {
        const logs = await getLLMLogs();
        sendResponse({ type: "LLM_LOGS_RESPONSE", logs });
        break;
      }

      case "CLEAR_LLM_LOGS": {
        await clearLLMLogs();
        sendResponse({ type: "LLM_LOGS_CLEARED" });
        break;
      }

      case "OPEN_SIDEBAR_CHAT": {
        logger.debug("Opening sidebar for chat with field:", message.fieldId);

        try {
          // Store init data for sidebar to pick up
          await chrome.storage.local.set({
            sidebar_init: {
              view: "chat",
              fieldId: message.fieldId,
              inputText: message.inputText,
              timestamp: Date.now(),
            },
          });
          logger.debug("Stored sidebar init data:", {
            fieldId: message.fieldId,
            inputText: message.inputText,
          });

          // Open sidebar for current tab (use tabId, not windowId)
          const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
          logger.debug("Current active tab:", { id: tab?.id, windowId: tab?.windowId });

          if (!tab || !tab.id) {
            throw new Error("No active tab found");
          }

          await chrome.sidePanel.open({ tabId: tab.id });
          logger.debug("Sidebar opened successfully");

          sendResponse({ type: "SIDEBAR_OPENED", view: "chat" });
        } catch (error) {
          logger.error("Failed to open sidebar:", error);
          sendResponse({
            type: "LLM_ERROR",
            error: error instanceof Error ? error.message : "Failed to open sidebar",
          });
        }
        break;
      }

      case "OPEN_SIDEBAR_SKILLS": {
        logger.debug("Opening sidebar for skills");

        try {
          // Store init data for sidebar to pick up
          await chrome.storage.local.set({
            sidebar_init: {
              view: "skills",
              timestamp: Date.now(),
            },
          });

          // Open sidebar for current tab (use tabId, not windowId)
          const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
          logger.debug("Current active tab:", { id: tab?.id, windowId: tab?.windowId });

          if (!tab || !tab.id) {
            throw new Error("No active tab found");
          }

          await chrome.sidePanel.open({ tabId: tab.id });
          logger.debug("Sidebar opened successfully");

          sendResponse({ type: "SIDEBAR_OPENED", view: "skills" });
        } catch (error) {
          logger.error("Failed to open sidebar:", error);
          sendResponse({
            type: "LLM_ERROR",
            error: error instanceof Error ? error.message : "Failed to open sidebar",
          });
        }
        break;
      }

      case "GET_EXCLUDED_FIELDS": {
        logger.debug("GET_EXCLUDED_FIELDS for URL:", message.url);
        const fields = await getExcludedFields(message.url);
        logger.debug("Returning excluded fields:", fields);
        sendResponse({ type: "EXCLUDED_FIELDS_RESPONSE", fields });
        break;
      }

      case "ADD_EXCLUDED_FIELD": {
        await addExcludedField({
          fieldId: message.fieldId,
          fieldLabel: message.fieldLabel,
          url: message.url,
        });
        sendResponse({ type: "EXCLUDED_FIELD_ADDED" });
        break;
      }

      case "REMOVE_EXCLUDED_FIELD": {
        await removeExcludedField(message.url, message.fieldId);
        sendResponse({ type: "EXCLUDED_FIELD_REMOVED" });
        break;
      }

      case "EXCLUDE_FIELD": {
        logger.debug("EXCLUDE_FIELD message received:", message);
        logger.debug("Message sender:", sender);

        // Get URL from sender (content script context)
        const url = sender.tab?.url;
        logger.debug("Sender tab URL:", url);

        if (!url) {
          // Fallback: try to get current tab URL
          const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
          logger.debug("Fallback tab:", tab);

          if (!tab?.url) {
            logger.error("No URL available from sender or active tab");
            sendResponse({ type: "LLM_ERROR", error: "No active tab URL" });
            return;
          }

          await addExcludedField({
            fieldId: message.fieldId,
            fieldLabel: message.fieldLabel,
            url: tab.url,
          });

          logger.debug(`Excluded field ${message.fieldId} on ${tab.url}`);
          sendResponse({ type: "FIELD_EXCLUDED" });
          break;
        }

        await addExcludedField({
          fieldId: message.fieldId,
          fieldLabel: message.fieldLabel,
          url,
        });

        logger.debug(`Excluded field ${message.fieldId} on ${url}`);
        sendResponse({ type: "FIELD_EXCLUDED" });
        break;
      }

      case "IS_FIELD_EXCLUDED": {
        const fields = await getExcludedFields(message.url);
        const isExcluded = fields.some((field) => field.fieldId === message.fieldId);
        sendResponse({ type: "FIELD_EXCLUDED_RESPONSE", isExcluded });
        break;
      }

      case "DEBUG_DUMP_STORAGE": {
        logger.debug("DEBUG_DUMP_STORAGE requested");
        const allData = await chrome.storage.local.get(null);
        logger.debug("Full storage dump:", allData);
        const excludedKeys = Object.keys(allData).filter((k) => k.startsWith("excluded_fields_"));
        logger.debug("Excluded field keys:", excludedKeys);
        excludedKeys.forEach((key) => {
          logger.debug(`  ${key}:`, allData[key]);
        });
        sendResponse({ type: "DEBUG_STORAGE_DUMP", data: allData });
        break;
      }

      default: {
        const exhaustive: never = message;
        logger.warn("Unknown message type:", exhaustive);
      }
    }
  } catch (error) {
    logger.error("Message handler error:", error);
    sendResponse({
      type: "LLM_ERROR",
      error: error instanceof Error ? error.message : "Internal error",
    });
  }
}

/**
 * Helper function to build system prompt for logging (mirrors LLMClient logic)
 */
function buildSystemPromptForLogging(request: import("../shared/messages").RunLLMRequest): string {
  let prompt = `You are a helpful assistant that proposes changes to form fields on a web page.

Your output must be a JSON object with:
- changes: array of { fieldIndex, action, value, rationale? }
  - fieldIndex: integer index into the selected fields array (0-based)
  - action: "replace" | "append" | "clear" | "skip"
  - value: string (empty if action is "skip")
  - rationale: optional explanation
- globalNotes: optional general message for the user

IMPORTANT: You must return valid JSON matching this schema. Field indices must reference the fields provided.`;

  const skills = request.skills || (request.skill ? [request.skill] : []);

  if (skills.length > 0) {
    prompt += `\n\nACTIVE SKILLS (${skills.length}):\n`;
    skills.forEach((skill, index) => {
      prompt += `\n${index + 1}. "${skill.name}"\n${skill.instructions}\n`;
    });
    prompt += `\nApply all active skill instructions when generating field changes.`;
  }

  return prompt;
}

/**
 * Helper function to build user prompt for logging (mirrors LLMClient logic)
 */
function buildUserPromptForLogging(request: import("../shared/messages").RunLLMRequest): string {
  const { instruction, context, fields } = request;

  let prompt = `User instruction: ${instruction}\n\n`;

  if (context.level !== "none") {
    prompt += `Context:\n`;

    // Add date/time and language
    if (context.dateTime) {
      prompt += `- Current date and time: ${context.dateTime}\n`;
    }
    if (context.language) {
      prompt += `- Browser language: ${context.language}\n`;
    }

    if (context.domain) {
      prompt += `- Domain: ${context.domain}\n`;
    }
    if (context.url) {
      prompt += `- URL: ${context.url}\n`;
    }
    if (context.pageText) {
      prompt += `- Page excerpt: ${context.pageText.slice(0, 500)}...\n`;
    }
  }

  prompt += `\nSelected fields (${fields.length}):\n`;
  fields.forEach((field, index) => {
    prompt += `[${index}] ${field.labelHint} (${field.kind}`;
    if (field.inputType) prompt += `, type=${field.inputType}`;
    prompt += `)`;
    if (context.level === "selected" || context.level === "allPage") {
      prompt += ` = "${field.value}"`;
    }
    prompt += `\n`;
  });

  return prompt;
}
