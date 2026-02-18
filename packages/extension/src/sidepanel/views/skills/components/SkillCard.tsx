import { Circle, Download, Pencil, Target, Trash2 } from "lucide-react";
import { useTranslation } from "../../../../shared/i18n";
import { downloadSkillAsMarkdown } from "../../../../shared/skill-markdown";
import { getSkillDomainMatch, getSkillIntentTriggers } from "../../../../shared/skill-utils";
import type { Skill } from "../../../../shared/types";
import { Button } from "../../../../shared/components/ui/button";
import { Card } from "../../../../shared/components/ui/card";
import { Switch } from "../../../../shared/components/ui/switch";

interface SkillCardProps {
  skill: Skill;
  isActive: boolean;
  isDisabled: boolean;
  onEdit: (skill: Skill) => void;
  onDelete: (skillId: string) => void;
  onToggle: (skillId: string, disabled: boolean) => void;
}

export default function SkillCard({
  skill,
  isActive,
  isDisabled,
  onEdit,
  onDelete,
  onToggle,
}: SkillCardProps) {
  const { t } = useTranslation();

  const handleExport = () => {
    downloadSkillAsMarkdown(skill);
  };

  const domainMatch = getSkillDomainMatch(skill);
  const intentTriggers = getSkillIntentTriggers(skill);

  return (
    <Card
      className={`p-4 mb-3 transition-opacity ${isDisabled ? "opacity-50" : ""} ${isActive && !isDisabled ? "bg-green-50 border-green-500 dark:bg-green-950/30 dark:border-green-700" : ""}`}
    >
      <div className="flex justify-between items-start mb-2">
        {/* Toggle Switch - Left Side */}
        <div className="flex items-start gap-3 flex-1">
          <div className="pt-1">
            <Switch
              checked={!isDisabled}
              onCheckedChange={(checked) => onToggle(skill.id, !checked)}
              title={isDisabled ? "Enable this skill" : "Disable this skill"}
            />
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex flex-col items-start gap-1 mb-1 flex-wrap">
              <h3 className="text-base font-semibold m-0 leading-tight">{skill.name}</h3>
              {isActive && !isDisabled && (
                <span className="bg-green-500 text-white px-2 py-0.5 rounded-full text-[11px] font-semibold flex-shrink-0 flex items-center gap-1">
                  <Target className="h-3 w-3" />
                  {t("skillCard.autoActive")}
                </span>
              )}
              {isDisabled && (
                <span className="bg-gray-400 text-white px-2 py-0.5 rounded-full text-[11px] font-semibold flex-shrink-0 flex items-center gap-1">
                  <Circle className="h-3 w-3" />
                  {t("skillCard.disabled")}
                </span>
              )}
              {!isActive && !isDisabled && (
                <span className="bg-gray-300 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-2 py-0.5 rounded-full text-[11px] font-semibold flex-shrink-0">
                  {t("skillCard.inactive")}
                </span>
              )}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">{skill.description}</div>
            <div className="text-xs text-gray-500 dark:text-gray-500">
              Domain:{" "}
              <code className="bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 rounded text-xs">
                {domainMatch.pattern}
              </code>
              {domainMatch.type === "regex" && (
                <span className="ml-1.5 italic text-xs">(regex)</span>
              )}
            </div>
          </div>
        </div>

        {/* Action Buttons - Right Side */}
        <div className="flex gap-1.5 flex-shrink-0 ml-2">
          <Button
            variant="outline"
            size="xs-icon"
            onClick={handleExport}
            title="Export as markdown"
          >
            <Download className="h-3.5 w-3.5" />
          </Button>
          <Button
            variant="secondary"
            size="xs-icon"
            onClick={() => onEdit(skill)}
            title="Edit skill"
          >
            <Pencil className="h-3.5 w-3.5" />
          </Button>
          <Button
            variant="destructive"
            size="xs-icon"
            onClick={() => {
              if (confirm(`Delete skill "${skill.name}"?`)) {
                onDelete(skill.id);
              }
            }}
            title="Delete skill"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>

      <div className="ml-12 text-sm text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-900/50 p-3 rounded-md leading-relaxed max-h-[100px] overflow-auto whitespace-pre-wrap">
        {skill.instructions}
      </div>

      {intentTriggers && intentTriggers.length > 0 && (
        <div className="ml-12 mt-2 text-xs text-gray-600 dark:text-gray-400">
          Triggers:{" "}
          {intentTriggers.map((trigger: string, i: number) => (
            <span key={i} className="bg-gray-200 dark:bg-gray-700 px-1.5 py-0.5 rounded mr-1">
              {trigger}
            </span>
          ))}
        </div>
      )}
    </Card>
  );
}
