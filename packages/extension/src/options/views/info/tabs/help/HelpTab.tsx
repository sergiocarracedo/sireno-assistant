import { BookOpen, GraduationCap, Zap } from "lucide-react";
import { useState } from "react";
import { Tabs, Tab } from "@heroui/react";
import { useTranslation } from "../../../../../shared/i18n";
import SearchBar from "./components/SearchBar";
import GettingStartedContent from "./components/GettingStartedContent";
import FeaturesContent from "./components/FeaturesContent";
import AdvancedContent from "./components/AdvancedContent";

export default function HelpTab() {
  const { t } = useTranslation();
  const [activeSubTab, setActiveSubTab] = useState("getting-started");
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <div className="flex flex-col h-full">
      <div className="mb-4">
        <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2 flex items-center gap-2">
          <BookOpen className="h-5 w-5" />
          {t("help.title")}
        </h1>
        <p className="text-sm text-gray-600 dark:text-gray-400">{t("help.subtitle")}</p>
      </div>

      <SearchBar value={searchQuery} onChange={setSearchQuery} />

      <Tabs
        selectedKey={activeSubTab}
        onSelectionChange={(key) => setActiveSubTab(key as string)}
        variant="underlined"
        color="secondary"
        classNames={{
          tabList: "gap-4 w-full border-b border-gray-700 mt-3",
          tab: "pb-2",
        }}
      >
        <Tab
          key="getting-started"
          title={
            <span className="flex items-center gap-1.5 text-xs">
              <BookOpen className="h-3.5 w-3.5" />
              {t("help.gettingStartedTab")}
            </span>
          }
        >
          <div className="mt-4">
            <GettingStartedContent searchQuery={searchQuery} />
          </div>
        </Tab>

        <Tab
          key="features"
          title={
            <span className="flex items-center gap-1.5 text-xs">
              <Zap className="h-3.5 w-3.5" />
              {t("help.featuresTab")}
            </span>
          }
        >
          <div className="mt-4">
            <FeaturesContent searchQuery={searchQuery} />
          </div>
        </Tab>

        <Tab
          key="advanced"
          title={
            <span className="flex items-center gap-1.5 text-xs">
              <GraduationCap className="h-3.5 w-3.5" />
              {t("help.advancedTab")}
            </span>
          }
        >
          <div className="mt-4">
            <AdvancedContent searchQuery={searchQuery} />
          </div>
        </Tab>
      </Tabs>
    </div>
  );
}
