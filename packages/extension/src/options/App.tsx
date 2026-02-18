import { Chip, Navbar, NavbarBrand, NavbarContent, Tab, Tabs } from "@heroui/react";
import { FileText, HelpCircle, ListChecks, Settings, Zap } from "lucide-react";
import { useEffect, useState } from "react";
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

  // Apply theme on mount
  const { theme, setTheme } = useTheme();

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
      <Navbar
        isBordered
        maxWidth="full"
        classNames={{
          wrapper: "max-w-4xl mx-auto px-6",
          base: "bg-white dark:bg-gray-900 shrink-0",
        }}
      >
        <NavbarBrand className="gap-2">
          <img src={chrome.runtime.getURL("icons/logo.svg")} alt="Sireno" className="w-6 h-6" />
          <span className="font-semibold text-gray-900 dark:text-white">Sireno Assistant</span>
          <Chip size="sm" variant="flat" color="secondary">
            Settings
          </Chip>
        </NavbarBrand>
        <NavbarContent justify="end" className="gap-2">
          <span className="text-xs text-gray-400 dark:text-gray-500">
            v{chrome.runtime.getManifest().version}
          </span>
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

      {/* ── Tabs: tab list is fixed, content scrolls ── */}
      <div className="flex-1 flex flex-col overflow-hidden max-w-4xl mx-auto w-full px-6">
        <Tabs
          selectedKey={activeTab}
          onSelectionChange={(key) => handleTabChange(key as TabKey)}
          variant="underlined"
          color="secondary"
          classNames={{
            // Tab list: don't scroll, sits just below the navbar
            base: "shrink-0",
            tabList:
              "gap-6 w-full border-b border-gray-200 dark:border-gray-800 pt-4 rounded-none bg-transparent",
            tab: "pb-3",
            // Panel wrapper: fill remaining space and scroll
            panel: "flex-1 overflow-y-auto py-6 px-0",
          }}
        >
          <Tab
            key="settings"
            title={
              <span className="flex items-center gap-1.5">
                <Settings className="h-4 w-4" />
                Settings
              </span>
            }
          >
            <SettingsView onNavigate={() => {}} theme={theme} setTheme={setTheme} />
          </Tab>

          <Tab
            key="skills"
            title={
              <span className="flex items-center gap-1.5">
                <Zap className="h-4 w-4" />
                Skills
              </span>
            }
          >
            <SkillsView />
          </Tab>

          <Tab
            key="fields"
            title={
              <span className="flex items-center gap-1.5">
                <ListChecks className="h-4 w-4" />
                Fields
              </span>
            }
          >
            <FieldsView />
          </Tab>

          {showLogs ? (
            <Tab
              key="logs"
              title={
                <span className="flex items-center gap-1.5">
                  <FileText className="h-4 w-4" />
                  Logs
                </span>
              }
            >
              <LogsView />
            </Tab>
          ) : null}

          <Tab
            key="info"
            title={
              <span className="flex items-center gap-1.5">
                <HelpCircle className="h-4 w-4" />
                Help &amp; About
              </span>
            }
          >
            <InfoView />
          </Tab>
        </Tabs>
      </div>
    </div>
  );
}
