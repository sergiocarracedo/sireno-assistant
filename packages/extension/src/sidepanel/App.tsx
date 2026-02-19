import { Button, Navbar, NavbarBrand, NavbarContent } from "@heroui/react";
import { Settings } from "lucide-react";
import { useEffect, useState } from "react";
import ChatView from "./views/chat";
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

  // Apply theme on mount (reads persisted preference + watches system changes)
  useTheme();

  const checkInitData = async () => {
    try {
      const result = await chrome.storage.local.get("sidebar_init");
      if (result.sidebar_init) {
        const data = result.sidebar_init as SidebarInitData;
        if (Date.now() - data.timestamp < 2000) {
          setInitData(data);
          if (data.view !== "chat") {
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
        <NavbarBrand>
          <img src={chrome.runtime.getURL("icons/logo.svg")} alt="Sireno" className="w-5 h-5" />
          <span className="text-sm font-semibold">Sireno</span>
        </NavbarBrand>

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
        <ChatView
          onNavigate={(view) => {
            if (view !== "chat") openOptionsPage(view);
          }}
          initData={initData}
        />
      </div>
    </div>
  );
}
