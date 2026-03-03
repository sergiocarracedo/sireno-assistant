import { useState, useEffect } from "react";
import { Eye, ExternalLink, Target } from "lucide-react";
import { createLogger } from "../../../shared/logger";
import type { Skill } from "../../../shared/types";
import { getSkillDomainMatch } from "../../../shared/skill-utils";
import { Card } from "../../../shared/components/ui/card";
import { Button } from "../../../shared/components/ui/button";

const logger = createLogger("SkillsView");

function openSkillDetails(skillId: string) {
  const url = `${chrome.runtime.getURL("src/options/index.html")}?tab=skills&skillId=${skillId}`;
  chrome.tabs.create({ url });
}

function openOptionsPage(tab = "skills") {
  if (chrome.runtime.openOptionsPage) {
    chrome.runtime.openOptionsPage();
  } else {
    chrome.tabs.create({
      url: `${chrome.runtime.getURL("src/options/index.html")}?tab=${tab}`,
    });
  }
}

export default function SkillsView() {
  const [skills, setSkills] = useState<Skill[]>([]);
  const [disabledSkills, setDisabledSkills] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSkills();
    loadDisabledSkills();

    // Listen for tab changes
    const handleTabActivated = (_activeInfo: chrome.tabs.TabActiveInfo) => {
      loadSkills();
      loadDisabledSkills();
    };

    const handleTabUpdated = (
      _tabId: number,
      changeInfo: chrome.tabs.TabChangeInfo,
      _tab: chrome.tabs.Tab,
    ) => {
      if (changeInfo.url) {
        loadSkills();
        loadDisabledSkills();
      }
    };

    chrome.tabs.onActivated.addListener(handleTabActivated);
    chrome.tabs.onUpdated.addListener(handleTabUpdated);

    return () => {
      chrome.tabs.onActivated.removeListener(handleTabActivated);
      chrome.tabs.onUpdated.removeListener(handleTabUpdated);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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

  // Only show enabled skills
  const enabledSkills = skills.filter((skill) => !disabledSkills.includes(skill.id));

  if (loading) {
    return <div className="py-8 text-center text-gray-600 dark:text-gray-300">Loading...</div>;
  }

  return (
    <div className="flex flex-col h-full p-4">
      {/* Header */}
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Active Skills</h2>
          <p className="text-xs text-gray-600 dark:text-gray-300">
            {enabledSkills.length} skill{enabledSkills.length !== 1 ? "s" : ""} enabled
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => openOptionsPage("skills")}
          className="gap-1.5"
        >
          <ExternalLink className="h-3.5 w-3.5" />
          Manage
        </Button>
      </div>

      {/* Skills List */}
      <div className="flex-1 overflow-y-auto space-y-3">
        {enabledSkills.length === 0 && (
          <div className="text-center py-12 px-4 text-gray-600 dark:text-gray-300">
            <Target className="h-16 w-16 mb-3 mx-auto" />
            <div className="text-sm mb-2">No skills enabled</div>
            <Button onClick={() => openOptionsPage("skills")} variant="outline" size="sm">
              <ExternalLink className="h-3.5 w-3.5 mr-1" />
              Go to Skills
            </Button>
          </div>
        )}

        {enabledSkills.map((skill) => {
          const domainMatch = getSkillDomainMatch(skill);

          return (
            <Card key={skill.id} className="p-3">
              <div className="flex items-start gap-2">
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-1">
                    {skill.name}
                  </h3>
                  <p className="text-xs text-gray-700 dark:text-gray-200 mb-1.5">
                    {skill.description}
                  </p>
                  <div className="text-xs text-gray-600 dark:text-gray-300">
                    Domain:{" "}
                    <code className="bg-gray-100 dark:bg-gray-800 px-1 py-0.5 rounded text-xs">
                      {domainMatch.pattern}
                    </code>
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="xs-icon"
                  onClick={() => openSkillDetails(skill.id)}
                  title="View details"
                >
                  <Eye className="h-3.5 w-3.5" />
                </Button>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
