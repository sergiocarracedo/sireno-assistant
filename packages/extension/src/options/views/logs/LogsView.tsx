import { useState, useEffect } from "react";
import type { LLMLogEntry } from "../../../shared/types";
import { Button } from "../../../shared/components/ui/button";
import { Input } from "../../../shared/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../../shared/components/ui/card";
import { Trash2, Search, ChevronDown, ChevronRight, MessageSquare, Sparkles } from "lucide-react";
import { Separator } from "../../../shared/components/ui/separator";
import { createLogger } from "../../../shared/logger";

const logger = createLogger("LogsView");

export default function LogsTab() {
  const [logs, setLogs] = useState<LLMLogEntry[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [expandedLogIds, setExpandedLogIds] = useState<Set<string>>(new Set());

  // Load logs on mount
  useEffect(() => {
    loadLogs();

    // Listen for storage changes to update logs in real-time
    const handleStorageChange = (
      changes: { [key: string]: chrome.storage.StorageChange },
      areaName: string,
    ) => {
      if (areaName === "local" && changes.llmLogs) {
        // Logs were updated, reload them
        loadLogs();
      }
    };

    chrome.storage.onChanged.addListener(handleStorageChange);

    return () => {
      chrome.storage.onChanged.removeListener(handleStorageChange);
    };
  }, []);

  const loadLogs = async () => {
    setLoading(true);
    try {
      const response = await chrome.runtime.sendMessage({ type: "GET_LLM_LOGS" });
      if (response.type === "LLM_LOGS_RESPONSE") {
        setLogs(response.logs);
      }
    } catch (error) {
      logger.error("Failed to load logs:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleClearLogs = async () => {
    if (!confirm("Are you sure you want to clear all logs? This cannot be undone.")) {
      return;
    }

    try {
      await chrome.runtime.sendMessage({ type: "CLEAR_LLM_LOGS" });
      setLogs([]);
      setExpandedLogIds(new Set());
    } catch (error) {
      logger.error("Failed to clear logs:", error);
    }
  };

  const toggleLogExpanded = (logId: string) => {
    const newExpanded = new Set(expandedLogIds);
    if (newExpanded.has(logId)) {
      newExpanded.delete(logId);
    } else {
      newExpanded.add(logId);
    }
    setExpandedLogIds(newExpanded);
  };

  // Filter logs by search term
  const filteredLogs = logs.filter((log) => {
    if (!searchTerm) return true;
    const searchLower = searchTerm.toLowerCase();
    return (
      log.request.model.toLowerCase().includes(searchLower) ||
      log.request.messages.some((msg) => msg.content.toLowerCase().includes(searchLower)) ||
      log.response.text.toLowerCase().includes(searchLower) ||
      (log.error && log.error.toLowerCase().includes(searchLower))
    );
  });

  const formatTimestamp = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleString();
  };

  const formatTokens = (usage?: {
    promptTokens?: number;
    completionTokens?: number;
    totalTokens?: number;
  }) => {
    if (!usage) return null;
    const parts = [];
    if (usage.promptTokens) parts.push(`${usage.promptTokens} prompt`);
    if (usage.completionTokens) parts.push(`${usage.completionTokens} completion`);
    if (usage.totalTokens) parts.push(`${usage.totalTokens} total`);
    return parts.join(" • ");
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-gray-500">Loading logs...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto w-full px-6 py-6 flex flex-col h-full">
      {/* Header with search and clear */}
      <div className="p-4 border-b space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">LLM Request Logs</h2>
          <Button
            variant="destructive"
            size="sm"
            onClick={handleClearLogs}
            disabled={logs.length === 0}
          >
            <Trash2 className="h-4 w-4 mr-1" />
            Clear All
          </Button>
        </div>
        <div className="relative">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
          <Input
            type="text"
            placeholder="Search logs..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-8"
          />
        </div>
      </div>

      {/* Logs list */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {filteredLogs.length === 0 ? (
          <Card>
            <CardContent className="pt-6">
              <div className="text-center text-gray-500">
                {logs.length === 0 ? (
                  <>
                    <p className="mb-2">No logs yet.</p>
                    <p className="text-sm">Make an LLM request to see logs here.</p>
                  </>
                ) : (
                  <p>No logs match your search.</p>
                )}
              </div>
            </CardContent>
          </Card>
        ) : (
          filteredLogs.map((log) => {
            const isExpanded = expandedLogIds.has(log.id);
            const hasError = !!log.error;

            return (
              <Card key={log.id} className={hasError ? "border-red-300" : ""}>
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-2 flex-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0 mt-0.5"
                        onClick={() => toggleLogExpanded(log.id)}
                      >
                        {isExpanded ? (
                          <ChevronDown className="h-4 w-4" />
                        ) : (
                          <ChevronRight className="h-4 w-4" />
                        )}
                      </Button>
                      <div className="flex-1">
                        <div className="flex items-center space-x-2">
                          {log.type === "chat" ? (
                            <MessageSquare className="h-4 w-4 text-blue-500" />
                          ) : (
                            <Sparkles className="h-4 w-4 text-purple-500" />
                          )}
                          <CardTitle className="text-sm font-medium">
                            {log.type === "chat" ? "Chat Request" : "Inline Request"}
                          </CardTitle>
                          {hasError && (
                            <span className="text-xs font-semibold text-red-600 bg-red-100 px-2 py-0.5 rounded">
                              ERROR
                            </span>
                          )}
                        </div>
                        <CardDescription className="text-xs mt-1">
                          {formatTimestamp(log.timestamp)} • {log.request.model}
                          {log.response.usage && <> • {formatTokens(log.response.usage)}</>}
                        </CardDescription>
                      </div>
                    </div>
                  </div>
                </CardHeader>

                {isExpanded && (
                  <CardContent className="space-y-3 pt-0">
                    <Separator />

                    {/* Request */}
                    <div>
                      <h4 className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2">
                        Request
                      </h4>
                      {log.request.messages.map((msg, idx) => (
                        <div key={idx} className="mb-2">
                          <div className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                            {msg.role}:
                          </div>
                          <pre className="text-xs bg-gray-50 dark:bg-gray-800 p-2 rounded overflow-x-auto whitespace-pre-wrap break-words">
                            {msg.content}
                          </pre>
                        </div>
                      ))}
                      {log.request.temperature !== undefined && (
                        <div className="text-xs text-gray-500 mt-1">
                          Temperature: {log.request.temperature}
                        </div>
                      )}
                    </div>

                    <Separator />

                    {/* Response or Error */}
                    <div>
                      <h4 className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2">
                        {hasError ? "Error" : "Response"}
                      </h4>
                      {hasError ? (
                        <div className="text-xs text-red-600 bg-red-50 dark:bg-red-900/20 p-2 rounded">
                          {log.error}
                        </div>
                      ) : (
                        <pre className="text-xs bg-gray-50 dark:bg-gray-800 p-2 rounded overflow-x-auto whitespace-pre-wrap break-words">
                          {log.response.text}
                        </pre>
                      )}
                    </div>
                  </CardContent>
                )}
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
}
