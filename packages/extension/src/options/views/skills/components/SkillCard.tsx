import { Download, Pencil, Trash2 } from "lucide-react";
import { downloadSkillAsMarkdown } from "../../../../shared/skill-markdown";
import { getSkillDomainMatch } from "../../../../shared/skill-utils";
import type { Skill } from "../../../../shared/types";
import { Button } from "../../../../shared/components/ui/button";
import { Card } from "../../../../shared/components/ui/card";
import { Switch } from "../../../../shared/components/ui/switch";

interface SkillCardProps {
  skill: Skill;
  isDisabled: boolean;
  onEdit: (skill: Skill) => void;
  onDelete: (skillId: string) => void;
  onToggle: (skillId: string, disabled: boolean) => void;
}

export default function SkillCard({
  skill,
  isDisabled,
  onEdit,
  onDelete,
  onToggle,
}: SkillCardProps) {
  const handleExport = () => {
    downloadSkillAsMarkdown(skill);
  };

  const domainMatch = getSkillDomainMatch(skill);

  return (
    <Card className={`p-4 mb-3 transition-opacity ${isDisabled ? "opacity-50" : ""}`}>
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
            <h3 className="text-base font-semibold m-0 leading-tight mb-1">{skill.name}</h3>
            <div className="text-sm text-gray-700 dark:text-gray-200 mb-2">{skill.description}</div>
            <div className="text-xs text-gray-700 dark:text-gray-200">
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

      <div className="ml-12 text-sm text-gray-900 dark:text-gray-100 bg-gray-50 dark:bg-[#1d1821] p-3 rounded-md leading-relaxed max-h-[100px] overflow-auto whitespace-pre-wrap border border-gray-200 dark:border-gray-700">
        {skill.instructions}
      </div>
    </Card>
  );
}
