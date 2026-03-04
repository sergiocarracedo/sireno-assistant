import { Button, Navbar, NavbarContent, Tab, Tabs } from "@heroui/react";
import { Settings } from "lucide-react";
import { useEffect, useState } from "react";
import ChatView from "./views/chat";
import FieldsView from "./views/fields";
import SkillsView from "./views/skills/SkillsView";
import { ThemeToggle } from "../shared/components/ThemeToggle";
import { useTheme } from "../shared/hooks/useTheme";
import { createLogger } from "../shared/logger";

const logger = createLogger("App");

interface SidebarInitData {
  view: string;
  fieldId?: string;
  inputText?: string;
  timestamp: number;
}

type ViewType = "chat" | "fields" | "skills";

function openOptionsPage(tab = "settings") {
  if (chrome.runtime.openOptionsPage) {
    chrome.runtime.openOptionsPage();
  } else {
    chrome.tabs.create({
      url: `${chrome.runtime.getURL("src/options/index.html")}?tab=${tab}`,
    });
  }
}

export default function App() {
  const [initData, setInitData] = useState<SidebarInitData | null>(null);
  const [activeView, setActiveView] = useState<ViewType>("chat");

  // Apply theme on mount (reads persisted preference + watches system changes)
  useTheme();

  const checkInitData = async () => {
    try {
      const result = await chrome.storage.local.get("sidebar_init");
      if (result.sidebar_init) {
        const data = result.sidebar_init as SidebarInitData;
        if (Date.now() - data.timestamp < 2000) {
          setInitData(data);
          if (data.view === "chat") {
            setActiveView("chat");
          } else if (data.view === "fields") {
            setActiveView("fields");
          } else if (data.view === "skills") {
            setActiveView("skills");
          } else {
            openOptionsPage(data.view);
          }
          await chrome.storage.local.remove("sidebar_init");
        }
      }
    } catch (error) {
      logger.error("Failed to check init data:", error);
    }
  };

  useEffect(() => {
    checkInitData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="app">
      <Navbar isBordered maxWidth="full">
        <NavbarContent justify="center">
          <Tabs
            selectedKey={activeView}
            onSelectionChange={(key) => setActiveView(key as ViewType)}
            variant="solid"
            color="primary"
            size="sm"
          >
            <Tab key="chat" title="Chat" />
            <Tab key="skills" title="Skills" />
            <Tab key="fields" title="Fields" />
          </Tabs>
        </NavbarContent>

        <NavbarContent justify="end">
          <ThemeToggle />
          <Button
            isIconOnly
            variant="light"
            size="sm"
            onPress={() => openOptionsPage("settings")}
            title="Settings"
          >
            <Settings className="h-4 w-4" />
          </Button>
        </NavbarContent>
      </Navbar>

      <div className="tab-content">
        {activeView === "chat" ? (
          <ChatView
            onNavigate={(view) => {
              if (view === "fields") {
                setActiveView("fields");
              } else if (view === "skills") {
                setActiveView("skills");
              } else if (view !== "chat") {
                openOptionsPage(view);
              }
            }}
            initData={initData}
          />
        ) : activeView === "skills" ? (
          <SkillsView />
        ) : (
          <FieldsView />
        )}
      </div>
    </div>
  );
}
