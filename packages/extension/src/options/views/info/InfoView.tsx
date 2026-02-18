import { BookOpen, Info } from "lucide-react";
import { useState } from "react";
import { Tabs, Tab } from "@heroui/react";
import { useTranslation } from "../../../shared/i18n";
import AboutTab from "./tabs/about/AboutTab";
import HelpTab from "./tabs/help/HelpTab";

export default function InfoView() {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState("about");

  return (
    <div className="flex flex-col h-full">
      <Tabs
        selectedKey={activeTab}
        onSelectionChange={(key) => setActiveTab(key as string)}
        variant="underlined"
        color="secondary"
        classNames={{
          tabList: "gap-4 w-full border-b border-gray-700",
          tab: "pb-2",
        }}
      >
        <Tab
          key="help"
          title={
            <span className="flex items-center gap-1.5 text-xs">
              <BookOpen className="h-3.5 w-3.5" />
              {t("info.helpTab")}
            </span>
          }
        >
          <div className="mt-4 overflow-y-auto">
            <HelpTab />
          </div>
        </Tab>

        <Tab
          key="about"
          title={
            <span className="flex items-center gap-1.5 text-xs">
              <Info className="h-3.5 w-3.5" />
              {t("info.aboutTab")}
            </span>
          }
        >
          <div className="mt-4 overflow-y-auto">
            <AboutTab />
          </div>
        </Tab>
      </Tabs>
    </div>
  );
}
