import { useState } from "react";
import { Tabs, Tab } from "@heroui/react";
import { useTranslation } from "../../../shared/i18n";
import AllFieldsTab from "./tabs/all-fields/AllFieldsTab";
import ExcludedFieldsTab from "./tabs/excluded/ExcludedFieldsTab";

export default function FieldsView() {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState("fields");

  return (
    <div className="w-full px-4 py-4 flex flex-col h-full">
      <div className="mb-4">
        <h1 className="text-lg font-bold mb-2">{t("fieldsView.title")}</h1>
        <p className="text-sm text-gray-600 dark:text-gray-300">{t("fieldsView.subtitle")}</p>
      </div>

      <Tabs
        selectedKey={activeTab}
        onSelectionChange={(key) => setActiveTab(key as string)}
        variant="solid"
        color="primary"
      >
        <Tab key="fields" title={t("fieldsView.allFieldsTab")}>
          <div className="mt-4">
            <AllFieldsTab />
          </div>
        </Tab>

        <Tab key="excluded" title={t("fieldsView.excludedTab")}>
          <div className="mt-4">
            <ExcludedFieldsTab />
          </div>
        </Tab>
      </Tabs>
    </div>
  );
}
