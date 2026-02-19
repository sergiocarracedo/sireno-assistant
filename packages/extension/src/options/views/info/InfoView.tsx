import { useState } from "react";
import { Tabs, Tab } from "@heroui/react";
import { useTranslation } from "../../../shared/i18n";
import AboutTab from "./tabs/about/AboutTab";
import HelpTab from "./tabs/help/HelpTab";

export default function InfoView() {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState("about");

  return (
    <div className="max-w-4xl mx-auto w-full px-6 py-6 flex flex-col h-full">
      <Tabs
        selectedKey={activeTab}
        onSelectionChange={(key) => setActiveTab(key as string)}
        variant="underlined"
        color="secondary"
      >
        <Tab key="help" title={t("info.helpTab")}>
          <div className="mt-4 overflow-y-auto">
            <HelpTab />
          </div>
        </Tab>

        <Tab key="about" title={t("info.aboutTab")}>
          <div className="mt-4 overflow-y-auto">
            <AboutTab />
          </div>
        </Tab>
      </Tabs>
    </div>
  );
}
