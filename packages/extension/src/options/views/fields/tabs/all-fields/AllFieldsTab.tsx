import { useState, useEffect } from "react";
import { useTranslation } from "../../../../../shared/i18n";
import type { FieldRef } from "../../../../../shared/types";
import type { ExcludedField } from "../../../../../background/storage";
import { Button } from "../../../../../shared/components/ui/button";
import { RotateCw, Focus, EyeOff } from "lucide-react";
import { createLogger } from "../../../../../shared/logger";

const logger = createLogger("AllFieldsTab");

export default function AllFieldsTab() {
  const { t } = useTranslation();
  const [fields, setFields] = useState<FieldRef[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentTabId, setCurrentTabId] = useState<number | null>(null);
  const [excludedFieldIds, setExcludedFieldIds] = useState<Set<string>>(new Set());

  // Track the current active tab
  useEffect(() => {
    const updateCurrentTab = async () => {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      if (tab.id && tab.id !== currentTabId) {
        logger.debug("[FieldSelector] Tab changed from", currentTabId, "to", tab.id);
        setCurrentTabId(tab.id);
      }
    };

    // Initial tab detection
    updateCurrentTab();

    // Listen for tab activation (user switches tabs)
    const handleTabActivated = (activeInfo: chrome.tabs.TabActiveInfo) => {
      logger.debug("[FieldSelector] Tab activated:", activeInfo.tabId);
      setCurrentTabId(activeInfo.tabId);
    };

    // Listen for tab updates (URL changes, page loads)
    const handleTabUpdated = (
      tabId: number,
      changeInfo: chrome.tabs.TabChangeInfo,
      tab: chrome.tabs.Tab,
    ) => {
      if (changeInfo.status === "complete" && tab.active) {
        logger.debug("[FieldSelector] Tab updated and complete:", tabId);
        setCurrentTabId(tabId);
      }
    };

    // Auto-rescan when tab becomes visible
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        logger.debug("[FieldSelector] Tab visible, updating current tab...");
        updateCurrentTab();
      }
    };

    chrome.tabs.onActivated.addListener(handleTabActivated);
    chrome.tabs.onUpdated.addListener(handleTabUpdated);
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      chrome.tabs.onActivated.removeListener(handleTabActivated);
      chrome.tabs.onUpdated.removeListener(handleTabUpdated);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [currentTabId]);

  // Reload fields and selections whenever currentTabId changes
  useEffect(() => {
    if (currentTabId) {
      logger.debug(
        "[FieldSelector] Current tab changed to",
        currentTabId,
        "- reloading fields and selections",
      );
      scanFields();
      loadSelectedIds();
      loadExcludedFields();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentTabId]);

  // Load excluded fields for the current URL
  const loadExcludedFields = async () => {
    try {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      if (!tab.url) return;

      const key = `excluded_fields_${tab.url}`;
      const result = await chrome.storage.local.get(key);
      const excludedFields: ExcludedField[] = result[key] || [];

      // Create a set of excluded field IDs
      const excludedIds = new Set(excludedFields.map((f) => f.fieldId));
      setExcludedFieldIds(excludedIds);

      logger.debug("[FieldSelector] Loaded", excludedIds.size, "excluded fields for", tab.url);
    } catch (error) {
      logger.error("Failed to load excluded fields:", error);
    }
  };

  // Load selected IDs from storage
  const loadSelectedIds = async () => {
    try {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      if (!tab.id) return;

      const result = await chrome.storage.local.get(`selectedFields_${tab.id}`);
      if (result[`selectedFields_${tab.id}`]) {
        setSelectedIds(result[`selectedFields_${tab.id}`]);
      }
    } catch (error) {
      logger.error("Failed to load selected IDs:", error);
    }
  };

  // Save selected IDs to storage
  const saveSelectedIds = async (ids: string[]) => {
    try {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      if (!tab.id) return;

      await chrome.storage.local.set({
        [`selectedFields_${tab.id}`]: ids,
      });
    } catch (error) {
      logger.error("Failed to save selected IDs:", error);
    }
  };

  const scanFields = async () => {
    setLoading(true);
    // Clear old data immediately when scanning new tab
    setFields([]);

    try {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      if (!tab.id) {
        logger.error("[FieldSelector] No active tab found");
        setLoading(false);
        return;
      }

      logger.debug("[FieldSelector] Scanning fields for tab", tab.id);

      const response = await chrome.tabs.sendMessage(tab.id, {
        type: "SCAN_FIELDS",
      });

      logger.debug("[FieldSelector] Scan response:", response);

      if (response?.fields) {
        logger.debug("[FieldSelector] Found", response.fields.length, "fields");
        setFields(response.fields);

        // Load saved selection for THIS tab
        const result = await chrome.storage.local.get(`selectedFields_${tab.id}`);
        if (result[`selectedFields_${tab.id}`] && result[`selectedFields_${tab.id}`].length > 0) {
          // Use saved selection
          logger.debug("[FieldSelector] Using saved selection for tab", tab.id);
          setSelectedIds(result[`selectedFields_${tab.id}`]);
        } else if (response.fields.length > 0) {
          // No saved selection, select all by default
          logger.debug("[FieldSelector] No saved selection, selecting all fields for tab", tab.id);
          const allIds = response.fields.map((f: FieldRef) => f.id);
          setSelectedIds(allIds);
          saveSelectedIds(allIds);
        } else {
          setSelectedIds([]);
        }
      } else {
        logger.warn("[FieldSelector] No fields in response");
        setSelectedIds([]);
      }
    } catch (error) {
      logger.error("[FieldSelector] Failed to scan fields:", error);
      // Try to inject content script if it's not loaded
      try {
        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
        if (tab.id) {
          logger.debug("[FieldSelector] Attempting to inject content script...");
          await chrome.scripting.executeScript({
            target: { tabId: tab.id },
            files: ["content_script.js"],
          });
          logger.debug("[FieldSelector] Content script injected, retrying scan...");
          // Wait a bit for content script to initialize
          setTimeout(() => scanFields(), 500);
        }
      } catch (injectError) {
        logger.error("[FieldSelector] Failed to inject content script:", injectError);
      }
    } finally {
      setLoading(false);
    }
  };

  const toggleField = (fieldId: string) => {
    const newSelection = selectedIds.includes(fieldId)
      ? selectedIds.filter((id) => id !== fieldId)
      : [...selectedIds, fieldId];
    setSelectedIds(newSelection);
    saveSelectedIds(newSelection);
  };

  const selectAll = () => {
    const allIds = fields.map((f) => f.id);
    setSelectedIds(allIds);
    saveSelectedIds(allIds);
  };

  const selectNone = () => {
    setSelectedIds([]);
    saveSelectedIds([]);
  };

  const focusField = async (fieldId: string) => {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (!tab.id) return;

    // Focus the field
    await chrome.tabs.sendMessage(tab.id, {
      type: "FOCUS_FIELD",
      fieldId,
    });

    // Also highlight it for 10 seconds
    await chrome.tabs.sendMessage(tab.id, {
      type: "HIGHLIGHT_FIELD",
      fieldId,
      duration: 10000,
    });
  };

  return (
    <div className="flex flex-col h-full">
      <div className="mb-4 flex gap-2 items-center">
        <Button onClick={scanFields} disabled={loading}>
          <RotateCw className={`h-4 w-4 mr-1 ${loading ? "animate-spin" : ""}`} />
          {loading ? t("fields.scanning") : t("fields.rescan")}
        </Button>
        <Button variant="secondary" onClick={selectAll}>
          {t("fields.selectAll")}
        </Button>
        <Button variant="secondary" onClick={selectNone}>
          {t("fields.selectNone")}
        </Button>
      </div>

      <div className="mb-3 text-sm text-gray-500">
        {t("fields.fieldsSelected", { count: selectedIds.length, total: fields.length })}
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="field-list">
          {fields.map((field) => {
            const isExcluded = excludedFieldIds.has(field.id);

            return (
              <div key={field.id} className="field-item">
                <input
                  type="checkbox"
                  checked={selectedIds.includes(field.id)}
                  onChange={() => toggleField(field.id)}
                />
                <div className="field-info">
                  <div className="field-label">
                    {field.labelHint}
                    {isExcluded && (
                      <span
                        className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-200 text-gray-700"
                        title="This field is excluded from assistant buttons"
                      >
                        <EyeOff className="h-3 w-3 mr-1" />
                        {t("fields.excluded")}
                      </span>
                    )}
                  </div>
                  <div className="field-meta">
                    {field.kind}
                    {field.inputType && ` · ${field.inputType}`}
                    {field.value &&
                      ` · "${field.value.slice(0, 30)}${field.value.length > 30 ? "..." : ""}"`}
                  </div>
                </div>
                <Button variant="secondary" size="sm" onClick={() => focusField(field.id)}>
                  <Focus className="h-4 w-4 mr-1" />
                  {t("fields.focus")}
                </Button>
              </div>
            );
          })}
        </div>

        {fields.length === 0 && !loading && (
          <div className="text-center py-8 text-gray-400">{t("fields.noFieldsFound")}</div>
        )}
      </div>
    </div>
  );
}
