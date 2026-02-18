import { useState } from "react";
import { Button } from "../../../../shared/components/ui";
import { Card } from "../../../../shared/components/ui";
import type { LLMResponse, FieldRef } from "../../../../shared/types";
import { Check, X, ChevronDown, ChevronUp } from "lucide-react";

interface FieldChangesMessageProps {
  response: LLMResponse;
  fields: FieldRef[];
  onApply: () => void;
  onReject: () => void;
  applied?: boolean;
}

const INITIAL_VISIBLE_COUNT = 3;

/**
 * Calculate diff between old and new text
 * Returns array of segments with their type (added/removed/unchanged)
 */
function calculateDiff(
  oldText: string,
  newText: string,
): Array<{ type: "added" | "removed" | "unchanged"; text: string }> {
  const result: Array<{ type: "added" | "removed" | "unchanged"; text: string }> = [];

  // Simple diff implementation
  if (oldText === newText) {
    return [{ type: "unchanged", text: newText }];
  }

  // Show old as removed and new as added
  if (oldText && oldText !== newText) {
    result.push({ type: "removed", text: oldText });
  }
  if (newText && oldText !== newText) {
    result.push({ type: "added", text: newText });
  }

  return result;
}

export default function FieldChangesMessage({
  response,
  fields,
  onApply,
  onReject,
  applied = false,
}: FieldChangesMessageProps) {
  const [showAll, setShowAll] = useState(false);

  if (applied) {
    return (
      <Card className="p-3 bg-green-50 dark:bg-green-950/30 border-green-500 dark:border-green-700 w-full">
        <div className="flex items-center gap-2 text-green-700 dark:text-green-400">
          <Check className="h-4 w-4" />
          <span className="font-medium text-sm">Changes Applied!</span>
        </div>
      </Card>
    );
  }

  const totalChanges = response.changes.length;
  const hasMore = totalChanges > INITIAL_VISIBLE_COUNT;
  const visibleChanges = showAll
    ? response.changes
    : response.changes.slice(0, INITIAL_VISIBLE_COUNT);

  return (
    <Card className="p-4 space-y-3 w-full">
      {response.globalNotes && (
        <div className="text-xs text-gray-700 dark:text-gray-300 bg-blue-50 dark:bg-blue-950/30 p-2.5 rounded border border-blue-200 dark:border-blue-800">
          {response.globalNotes}
        </div>
      )}

      <div className="space-y-2">
        {visibleChanges.map((change, idx) => {
          const field = fields[change.fieldIndex];
          const oldValue = field?.value || "";
          const newValue = change.value;
          const diff = calculateDiff(oldValue, newValue);

          return (
            <div
              key={idx}
              className="bg-gray-50 dark:bg-gray-900/50 p-3 rounded border border-gray-200 dark:border-gray-800"
            >
              <div className="flex items-center gap-2 mb-2">
                <span className="text-[11px] font-semibold text-gray-500 dark:text-gray-400">
                  Field #{change.fieldIndex + 1}
                </span>
                {field?.labelHint && (
                  <span className="text-[11px] text-gray-600 dark:text-gray-400 truncate flex-1">
                    {field.labelHint}
                  </span>
                )}
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 font-medium capitalize">
                  {change.action}
                </span>
              </div>

              {/* Diff view */}
              <div className="font-mono text-xs bg-white dark:bg-gray-950 p-2 rounded border border-gray-200 dark:border-gray-700 space-y-1">
                {diff.map((segment, segIdx) => (
                  <div key={segIdx}>
                    {segment.type === "removed" && (
                      <div className="bg-red-50 dark:bg-red-950/30 text-red-700 dark:text-red-400 px-2 py-1 rounded">
                        <span className="select-none mr-1">-</span>
                        <span className="line-through">{segment.text || "(empty)"}</span>
                      </div>
                    )}
                    {segment.type === "added" && (
                      <div className="bg-green-50 dark:bg-green-950/30 text-green-700 dark:text-green-400 px-2 py-1 rounded">
                        <span className="select-none mr-1">+</span>
                        {segment.text || "(empty)"}
                      </div>
                    )}
                    {segment.type === "unchanged" && (
                      <div className="text-gray-700 dark:text-gray-300 px-2 py-1">
                        {segment.text}
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {change.rationale && (
                <div className="text-[11px] text-gray-600 dark:text-gray-400 mt-2 italic">
                  {change.rationale}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {hasMore && (
        <div className="flex justify-center">
          <button
            onClick={() => setShowAll(!showAll)}
            className="text-xs text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 px-3 py-1 rounded hover:bg-blue-50 dark:hover:bg-blue-950/30 transition-colors"
          >
            {showAll ? (
              <>
                Show Less <ChevronUp className="h-3.5 w-3.5" />
              </>
            ) : (
              <>
                View {totalChanges - INITIAL_VISIBLE_COUNT} More{" "}
                {totalChanges - INITIAL_VISIBLE_COUNT === 1 ? "Change" : "Changes"}{" "}
                <ChevronDown className="h-3.5 w-3.5" />
              </>
            )}
          </button>
        </div>
      )}

      <div className="flex gap-2 pt-2">
        <Button onClick={onApply} className="flex-1" size="sm">
          <Check className="h-4 w-4 mr-1.5" />
          Apply All Changes
        </Button>
        <Button onClick={onReject} variant="outline" className="flex-1" size="sm">
          <X className="h-4 w-4 mr-1.5" />
          Reject
        </Button>
      </div>
    </Card>
  );
}
