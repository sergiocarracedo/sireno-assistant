import { useState, useEffect, useMemo, useRef } from "react";
import { useTranslation } from "../../../shared/i18n";
import type { Skill } from "../../../shared/types";
import { getSkillDomainMatch } from "../../../shared/skill-utils";
import SkillCard from "./components/SkillCard";
import SkillEditor from "./components/SkillEditor";
import { Button } from "../../../shared/components/ui/button";
import { Input } from "../../../shared/components/ui/input";
import { Plus, Search, Filter, Upload, Target } from "lucide-react";
import { readMarkdownFile } from "../../../shared/skill-markdown";
import { createLogger } from "../../../shared/logger";

const logger = createLogger("SkillsView");

type FilterType = "all" | "enabled" | "disabled";

export default function SkillsTab() {
  const { t } = useTranslation();
  const [skills, setSkills] = useState<Skill[]>([]);
  const [disabledSkills, setDisabledSkills] = useState<string[]>([]);
  const [editingSkill, setEditingSkill] = useState<Skill | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState<FilterType>("all");
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    loadSkills();
    loadDisabledSkills();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Handle skillId URL parameter to auto-open skill editor
  useEffect(() => {
    if (skills.length === 0) return;

    const params = new URLSearchParams(window.location.search);
    const skillId = params.get("skillId");

    if (skillId) {
      const skill = skills.find((s) => s.id === skillId);
      if (skill) {
        setEditingSkill(skill);
        // Clear URL parameter after opening
        window.history.replaceState({}, "", window.location.pathname + "?tab=skills");
      }
    }
  }, [skills]);

  const loadSkills = async () => {
    try {
      const response = await chrome.runtime.sendMessage({ type: "GET_SKILLS" });
      if (response.type === "SKILLS_RESPONSE") {
        setSkills(response.skills);
      }
    } catch (error) {
      logger.error("Failed to load skills:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadDisabledSkills = async () => {
    try {
      const allItems = await chrome.storage.local.get(null);
      const disabledIds: string[] = [];

      for (const key in allItems) {
        if (key.startsWith("skill_disabled_") && allItems[key] === true) {
          const skillId = key.replace("skill_disabled_", "");
          disabledIds.push(skillId);
        }
      }

      setDisabledSkills(disabledIds);
    } catch (error) {
      logger.error("Failed to load disabled skills:", error);
    }
  };

  const handleSave = async (skill: Skill) => {
    try {
      await chrome.runtime.sendMessage({ type: "SAVE_SKILL", skill });
      await loadSkills();
      setEditingSkill(null);
      setIsCreating(false);
    } catch (error) {
      alert(`Failed to save skill: ${error instanceof Error ? error.message : "Unknown error"}`);
    }
  };

  const handleDelete = async (skillId: string) => {
    try {
      await chrome.runtime.sendMessage({ type: "DELETE_SKILL", skillId });
      await loadSkills();
    } catch (error) {
      alert(`Failed to delete skill: ${error instanceof Error ? error.message : "Unknown error"}`);
    }
  };

  const handleToggle = async (skillId: string, disabled: boolean) => {
    try {
      const key = `skill_disabled_${skillId}`;
      if (disabled) {
        await chrome.storage.local.set({ [key]: true });
      } else {
        await chrome.storage.local.remove(key);
      }
      await loadDisabledSkills();
    } catch (error) {
      logger.error("Failed to toggle skill:", error);
      alert(`Failed to ${disabled ? "disable" : "enable"} skill`);
    }
  };

  const handleImportMarkdown = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const skill = await readMarkdownFile(file);
      // Generate new ID to avoid conflicts
      skill.id = `skill-${Date.now()}`;
      await handleSave(skill);
    } catch (error) {
      alert(`Failed to import skill: ${error instanceof Error ? error.message : "Unknown error"}`);
    }

    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // Filter and search skills
  const filteredSkills = useMemo(() => {
    return skills.filter((skill) => {
      // Apply enabled/disabled filter
      const isDisabled = disabledSkills.includes(skill.id);
      if (filterType === "enabled" && isDisabled) return false;
      if (filterType === "disabled" && !isDisabled) return false;

      // Apply search
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const domainMatch = getSkillDomainMatch(skill);
        return (
          skill.name.toLowerCase().includes(query) ||
          skill.description.toLowerCase().includes(query) ||
          domainMatch.pattern.toLowerCase().includes(query) ||
          skill.instructions.toLowerCase().includes(query)
        );
      }

      return true;
    });
  }, [skills, disabledSkills, filterType, searchQuery]);

  if (loading) {
    return <div className="py-8 text-center text-gray-600 dark:text-gray-300">Loading...</div>;
  }

  if (editingSkill || isCreating) {
    return (
      <SkillEditor
        skill={editingSkill}
        onSave={handleSave}
        onCancel={() => {
          setEditingSkill(null);
          setIsCreating(false);
        }}
      />
    );
  }

  return (
    <div className="max-w-4xl mx-auto w-full px-6 py-6 flex flex-col h-full">
      {/* Action Buttons */}
      <div className="mb-4 flex gap-2">
        <Button onClick={() => setIsCreating(true)} className="gap-2">
          <Plus className="h-4 w-4" />
          Create New
        </Button>

        <Button variant="secondary" onClick={() => fileInputRef.current?.click()} className="gap-2">
          <Upload className="h-4 w-4" />
          {t("skills.import")}
        </Button>
        <input
          ref={fileInputRef}
          type="file"
          accept=".md,.markdown"
          onChange={handleImportMarkdown}
          className="hidden"
        />
      </div>

      {/* Search and Filter Bar */}
      <div className="mb-4 space-y-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-600 dark:text-gray-300" />
          <Input
            type="text"
            placeholder="Search skills..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>

        <div className="flex gap-2">
          <Button
            variant={filterType === "all" ? "default" : "outline"}
            size="xs"
            onClick={() => setFilterType("all")}
            className="flex-1"
          >
            <Filter className="h-3.5 w-3.5 mr-1" />
            {t("skills.allCount", { count: skills.length })}
          </Button>
          <Button
            variant={filterType === "enabled" ? "default" : "outline"}
            size="xs"
            onClick={() => setFilterType("enabled")}
            className="flex-1"
          >
            Enabled ({skills.length - disabledSkills.length})
          </Button>
          <Button
            variant={filterType === "disabled" ? "default" : "outline"}
            size="xs"
            onClick={() => setFilterType("disabled")}
            className="flex-1"
          >
            Disabled ({disabledSkills.length})
          </Button>
        </div>
      </div>

      {/* Skills List */}
      <div className="flex-1 overflow-y-auto">
        {filteredSkills.length === 0 && skills.length > 0 && (
          <div className="text-center py-12 px-4 text-gray-600 dark:text-gray-300">
            <Search className="h-16 w-16 mb-3 mx-auto" />
            <div className="text-sm">{t("skills.noSkillsMatch")}</div>
          </div>
        )}

        {skills.length === 0 && (
          <div className="text-center py-12 px-4 text-gray-600 dark:text-gray-300">
            <Target className="h-20 w-20 mb-4 mx-auto" />
            <div className="text-base mb-2">{t("skills.noSkillsYet")}</div>
            <div className="text-sm mb-4">{t("skills.createFirstDescription")}</div>
            <Button onClick={() => setIsCreating(true)} className="gap-2">
              <Plus className="h-4 w-4" />
              {t("skills.createYourFirstSkill")}
            </Button>
          </div>
        )}

        {filteredSkills.map((skill) => (
          <SkillCard
            key={skill.id}
            skill={skill}
            isDisabled={disabledSkills.includes(skill.id)}
            onEdit={setEditingSkill}
            onDelete={handleDelete}
            onToggle={handleToggle}
          />
        ))}
      </div>
    </div>
  );
}
