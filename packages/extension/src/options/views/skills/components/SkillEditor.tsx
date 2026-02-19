import { useState, useEffect } from "react";
import { useTranslation } from "../../../../shared/i18n";
import type { Skill } from "../../../../shared/types";
import {
  getSkillDomainMatch,
  getSkillIntentTriggers,
  getSkillSafety,
} from "../../../../shared/skill-utils";
import { Button } from "../../../../shared/components/ui/button";
import { Input } from "../../../../shared/components/ui/input";
import { Label } from "../../../../shared/components/ui/label";
import { Textarea } from "../../../../shared/components/ui/textarea";
import { Select } from "../../../../shared/components";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../../../shared/components/ui/card";
import { Checkbox } from "../../../../shared/components/ui/checkbox";
import { Separator } from "../../../../shared/components/ui/separator";
import { ArrowLeft, AlertCircle, Save, X } from "lucide-react";

interface SkillEditorProps {
  skill: Skill | null;
  onSave: (skill: Skill) => void;
  onCancel: () => void;
}

export default function SkillEditor({ skill, onSave, onCancel }: SkillEditorProps) {
  const { t } = useTranslation();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [domainType, setDomainType] = useState<"exact" | "regex">("exact");
  const [domainPattern, setDomainPattern] = useState("*");
  const [intentTriggers, setIntentTriggers] = useState("");
  const [instructions, setInstructions] = useState("");
  const [neverModifyPasswords, setNeverModifyPasswords] = useState(true);
  const [maxFieldLength, setMaxFieldLength] = useState(1000);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (skill) {
      setName(skill.name);
      setDescription(skill.description || "");
      const domainMatch = getSkillDomainMatch(skill);
      setDomainType(domainMatch.type);
      setDomainPattern(domainMatch.pattern);
      const triggers = getSkillIntentTriggers(skill);
      setIntentTriggers(triggers.join(", "));
      setInstructions(skill.instructions);
      const safety = getSkillSafety(skill);
      setNeverModifyPasswords(safety.neverModifyPasswords ?? true);
      setMaxFieldLength(safety.maxFieldLength || 1000);
    }
  }, [skill]);

  const handleSubmit = () => {
    // Validation
    if (!name.trim()) {
      setError("Skill name is required");
      return;
    }

    if (!description.trim()) {
      setError("Description is required");
      return;
    }

    if (description.trim().length < 1 || description.trim().length > 1024) {
      setError("Description must be between 1 and 1024 characters");
      return;
    }

    if (!domainPattern.trim()) {
      setError("Domain pattern is required");
      return;
    }

    if (domainType === "regex") {
      try {
        new RegExp(domainPattern);
      } catch {
        setError("Invalid regex pattern");
        return;
      }
    }

    if (!instructions.trim()) {
      setError("Instructions are required");
      return;
    }

    const newSkill: Skill = {
      id: skill?.id || `skill-${Date.now()}`,
      name: name.trim(),
      description: description.trim(),
      instructions: instructions.trim(),
      metadata: {
        domainMatch: {
          type: domainType,
          pattern: domainPattern.trim(),
        },
        intentTriggers: intentTriggers
          .split(",")
          .map((t) => t.trim())
          .filter((t) => t.length > 0),
        safety: {
          neverModifyPasswords,
          maxFieldLength,
        },
      },
    };

    onSave(newSkill);
  };

  return (
    <div className="flex flex-col h-full">
      {/* Sticky Header */}
      <div className="flex-shrink-0 pb-3 mb-4 border-b border-gray-200 dark:border-gray-800">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            {skill ? t("skills.editSkill") : t("skills.createNewSkill")}
          </h2>
          <Button variant="ghost" size="sm" onClick={onCancel}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            {t("common.back")}
          </Button>
        </div>
      </div>

      {/* Fixed Error Message */}
      {error && (
        <div className="flex-shrink-0 mb-4">
          <Card className="border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950">
            <CardContent className="flex items-start gap-2 py-3 text-red-600 dark:text-red-400">
              <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <span className="text-sm">{error}</span>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto space-y-4 mb-4">
        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
            <CardDescription>Define the skill name and where it should be active</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="skillName">
                Skill Name <span className="text-red-500">*</span>
              </Label>
              <Input
                id="skillName"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="E.g., Professional LinkedIn Tone"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">
                Description <span className="text-red-500">*</span>
              </Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe what this skill does and when to use it..."
                rows={3}
              />
              <p className="text-xs text-gray-500 dark:text-gray-400">
                This helps the agent decide when to use this skill (1-1024 characters)
              </p>
            </div>

            <Separator />

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="domainType">
                  Domain Match Type <span className="text-red-500">*</span>
                </Label>
                <Select
                  options={[
                    { value: "exact", label: "Exact" },
                    { value: "regex", label: "Regex" },
                  ]}
                  value={domainType}
                  onChange={(value) => setDomainType(value as "exact" | "regex")}
                />
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="domainPattern">
                  Domain Pattern <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="domainPattern"
                  type="text"
                  value={domainPattern}
                  onChange={(e) => setDomainPattern(e.target.value)}
                  placeholder={domainType === "exact" ? "linkedin.com" : "(twitter\\.com|x\\.com)"}
                />
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Use &quot;*&quot; to match all domains, or specify exact domain/regex pattern
                </p>
              </div>
            </div>

            <Separator />

            <div className="space-y-2">
              <Label htmlFor="intentTriggers">Intent Triggers (optional)</Label>
              <Input
                id="intentTriggers"
                type="text"
                value={intentTriggers}
                onChange={(e) => setIntentTriggers(e.target.value)}
                placeholder="professional, formal, business (comma-separated)"
              />
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Keywords that help activate this skill when mentioned in user instructions
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Instructions */}
        <Card>
          <CardHeader>
            <CardTitle>Instructions</CardTitle>
            <CardDescription>Detailed instructions for the AI on how to behave</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <Label htmlFor="instructions">
              AI Instructions <span className="text-red-500">*</span>
            </Label>
            <Textarea
              id="instructions"
              value={instructions}
              onChange={(e) => setInstructions(e.target.value)}
              rows={10}
              placeholder="Detailed instructions for the AI on how to behave when this skill is active..."
              className="font-mono text-xs"
            />
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {instructions.length} characters
            </p>
          </CardContent>
        </Card>

        {/* Safety Settings */}
        <Card>
          <CardHeader>
            <CardTitle>Safety Settings</CardTitle>
            <CardDescription>Configure safety constraints for this skill</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-3">
              <Checkbox
                id="neverModifyPasswords"
                checked={neverModifyPasswords}
                onCheckedChange={(checked) => setNeverModifyPasswords(checked === true)}
              />
              <Label htmlFor="neverModifyPasswords" className="text-sm font-normal cursor-pointer">
                Never modify password fields
              </Label>
            </div>

            <Separator />

            <div className="space-y-2">
              <Label htmlFor="maxFieldLength">Max Field Length</Label>
              <Input
                id="maxFieldLength"
                type="number"
                value={maxFieldLength}
                onChange={(e) => setMaxFieldLength(parseInt(e.target.value) || 1000)}
                min={100}
                max={10000}
                step={100}
              />
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Maximum characters the AI can generate for a single field
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Fixed Action Buttons */}
      <div className="flex-shrink-0 flex gap-2 pt-3 border-t border-gray-200 dark:border-gray-800 justify-end">
        <Button variant="outline" onClick={onCancel} className="gap-2">
          <X className="h-4 w-4" />
          {t("common.cancel")}
        </Button>
        <Button onClick={handleSubmit} className="gap-2">
          <Save className="h-4 w-4" />
          {skill ? t("skills.saveChanges") : t("skills.createSkill")}
        </Button>
      </div>
    </div>
  );
}
