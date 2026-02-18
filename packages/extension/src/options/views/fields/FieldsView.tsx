import { EyeOff, List } from "lucide-react";
import { useState } from "react";
import { Tabs, Tab } from "@heroui/react";
import { useTranslation } from "../../../shared/i18n";
import AllFieldsTab from "./tabs/all-fields/AllFieldsTab";
import ExcludedFieldsTab from "./tabs/excluded/ExcludedFieldsTab";

export default function FieldsView() {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState("fields");

  return (
    <div className="flex flex-col h-full">
      <div className="mb-4">
        <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2 flex items-center gap-2">
          <List className="h-5 w-5" />
          {t("fieldsView.title")}
        </h1>
        <p className="text-sm text-gray-600 dark:text-gray-400">{t("fieldsView.subtitle")}</p>
      </div>

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
          key="fields"
          title={
            <span className="flex items-center gap-1.5 text-xs">
              <List className="h-3.5 w-3.5" />
              {t("fieldsView.allFieldsTab")}
            </span>
          }
        >
          <div className="mt-4">
            <AllFieldsTab />
          </div>
        </Tab>

        <Tab
          key="excluded"
          title={
            <span className="flex items-center gap-1.5 text-xs">
              <EyeOff className="h-3.5 w-3.5" />
              {t("fieldsView.excludedTab")}
            </span>
          }
        >
          <div className="mt-4">
            <ExcludedFieldsTab />
          </div>
        </Tab>
      </Tabs>
    </div>
  );
}
