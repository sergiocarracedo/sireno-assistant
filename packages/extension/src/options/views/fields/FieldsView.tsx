import { useState } from "react";
import { Tabs, Tab } from "@heroui/react";
import { useTranslation } from "../../../shared/i18n";
import AllFieldsTab from "./tabs/all-fields/AllFieldsTab";
import ExcludedFieldsTab from "./tabs/excluded/ExcludedFieldsTab";

export default function FieldsView() {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState("fields");

  return (
    <div className="max-w-4xl mx-auto w-full px-6 py-6 flex flex-col h-full">
      <div className="mb-4">
        <h1 className="text-xl font-bold mb-2">{t("fieldsView.title")}</h1>
        <p className="text-sm">{t("fieldsView.subtitle")}</p>
      </div>

      <Tabs
        selectedKey={activeTab}
        onSelectionChange={(key) => setActiveTab(key as string)}
        variant="underlined"
        color="secondary"
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
