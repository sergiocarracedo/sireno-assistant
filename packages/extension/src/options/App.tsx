import { Navbar, NavbarBrand, NavbarContent, Tab, Tabs } from "@heroui/react";
import { useEffect, useState } from "react";
import { ThemeToggle } from "../shared/components/ThemeToggle";
import { useTheme } from "../shared/hooks/useTheme";
import { createLogger } from "../shared/logger";
import type { ExtensionConfig } from "../shared/types";
import FieldsView from "./views/fields/FieldsView";
import InfoView from "./views/info/InfoView";
import LogsView from "./views/logs/LogsView";
import SettingsView from "./views/settings/SettingsView";
import SkillsView from "./views/skills/SkillsView";

const logger = createLogger("OptionsApp");

type TabKey = "settings" | "skills" | "fields" | "logs" | "info";

function getInitialTab(): TabKey {
  const params = new URLSearchParams(window.location.search);
  const tab = params.get("tab") as TabKey | null;
  const valid: TabKey[] = ["settings", "skills", "fields", "logs", "info"];
  return tab && valid.includes(tab) ? tab : "settings";
}

export default function OptionsApp() {
  const [activeTab, setActiveTab] = useState<TabKey>(getInitialTab);
  const [config, setConfig] = useState<ExtensionConfig | null>(null);
  const [isOnboarding, setIsOnboarding] = useState(false);

  // Apply theme on mount (reads persisted preference + watches system changes)
  useTheme();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setIsOnboarding(params.get("onboarding") === "true");
    loadConfig();
  }, []);

  const loadConfig = async () => {
    try {
      const response = await chrome.runtime.sendMessage({ type: "GET_CONFIG" });
      if (response?.type === "CONFIG_RESPONSE") {
        setConfig(response.config);
      }
    } catch (error) {
      logger.error("Failed to load config:", error);
    }
  };

  const handleTabChange = (key: TabKey) => {
    setActiveTab(key);
    if (key === "settings") loadConfig();
  };

  const showLogs = config?.enableLogging === true;

  return (
    /*
     * Layout: fixed-height viewport column
     *   - Navbar (fixed height, never scrolls)
     *   - Onboarding banner (fixed, only when present)
     *   - Tabs header row (fixed, never scrolls)
     *   - Scrollable content area (flex-1 overflow-y-auto)
     */
    <div className="h-screen flex flex-col bg-gray-50 dark:bg-gray-950 overflow-hidden">
      {/* ── Navbar ── */}
      <Navbar isBordered maxWidth="full">
        <NavbarBrand>
          <img src={chrome.runtime.getURL("icons/logo.svg")} alt="Sireno" className="w-6 h-6" />
          <span className="font-semibold">Sireno Assistant</span>
        </NavbarBrand>
        <NavbarContent justify="end">
          <span className="text-xs">v{chrome.runtime.getManifest().version}</span>
          <ThemeToggle />
        </NavbarContent>
      </Navbar>

      {/* ── Onboarding banner ── */}
      {isOnboarding && (
        <div className="bg-gradient-to-r from-violet-600 to-purple-600 text-white px-6 py-4 shrink-0">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-lg font-semibold mb-1">Welcome to Sireno Assistant!</h2>
            <p className="text-sm text-violet-100">
              To get started, configure your AI provider below. We recommend <strong>Groq</strong> —
              it has a generous free tier and is very fast. Just grab your API key from{" "}
              <a
                href="https://console.groq.com/keys"
                target="_blank"
                rel="noopener noreferrer"
                className="underline hover:no-underline font-medium"
              >
                console.groq.com/keys
              </a>{" "}
              and paste it below.
            </p>
          </div>
        </div>
      )}

      {/* ── Tabs ── */}
      <Tabs
        selectedKey={activeTab}
        onSelectionChange={(key) => handleTabChange(key as TabKey)}
        variant="solid"
        color="secondary"
      >
        <Tab key="settings" title="Settings">
          <SettingsView onNavigate={() => {}} />
        </Tab>

        <Tab key="skills" title="Skills">
          <SkillsView />
        </Tab>

        <Tab key="fields" title="Fields">
          <FieldsView />
        </Tab>

        {showLogs ? (
          <Tab key="logs" title="Logs">
            <LogsView />
          </Tab>
        ) : null}

        <Tab key="info" title="Help & About">
          <InfoView />
        </Tab>
      </Tabs>
    </div>
  );
}
