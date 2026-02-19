import { Navbar, NavbarBrand, NavbarContent, Tab, Tabs } from "@heroui/react";
import { FileText, HelpCircle, ListChecks, Settings, Zap } from "lucide-react";
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
        </NavbarBrand>
        <NavbarContent justify="end" className="gap-2">
          <span className="text-xs text-gray-400 dark:text-gray-500">
            v{chrome.runtime.getManifest().version}
          </span>
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

      {/* ── Tabs: tab list is fixed, content scrolls full-width so scrollbar is at window edge ── */}
      <div className="flex-1 flex flex-col overflow-hidden w-full">
        <Tabs
          selectedKey={activeTab}
          onSelectionChange={(key) => handleTabChange(key as TabKey)}
          variant="underlined"
          color="secondary"
          classNames={{
            // Tab list: shrink-0 so it never scrolls; content constrained to max-w-4xl
            base: "flex-1 flex flex-col overflow-hidden",
            tabList:
              "gap-6 max-w-4xl mx-auto w-full px-6 border-b border-gray-200 dark:border-gray-800 pt-4 rounded-none bg-transparent shrink-0",
            tab: "pb-3",
            // Panel: fill remaining space, no padding (views handle their own layout)
            panel: "flex-1 overflow-hidden",
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
            <div className="max-w-4xl mx-auto w-full px-6 h-full flex flex-col py-6">
              <SettingsView onNavigate={() => {}} />
            </div>
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
            <div className="max-w-4xl mx-auto w-full px-6 h-full flex flex-col py-6">
              <SkillsView />
            </div>
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
            <div className="max-w-4xl mx-auto w-full px-6 h-full flex flex-col py-6">
              <FieldsView />
            </div>
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
              <div className="max-w-4xl mx-auto w-full px-6 h-full flex flex-col py-6">
                <LogsView />
              </div>
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
            <div className="max-w-4xl mx-auto w-full px-6 h-full flex flex-col py-6">
              <InfoView />
            </div>
          </Tab>
        </Tabs>
      </div>
    </div>
  );
}
