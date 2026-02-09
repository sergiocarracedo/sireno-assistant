import { EyeOff, List } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from '../../shared/i18n';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import FieldSelector from './FieldSelector';
import ExcludedFieldsTab from './ExcludedFieldsTab';

export default function FieldsView() {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState('fields');

  return (
    <div className="flex flex-col h-full">
      <div className="mb-4">
        <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2 flex items-center gap-2">
          <List className="h-5 w-5" />
          {t('fieldsView.title')}
        </h1>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          {t('fieldsView.subtitle')}
        </p>
      </div>

      <div className="flex-1 overflow-hidden">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full flex flex-col">
          <TabsList className="grid w-full grid-cols-2 mb-4">
            <TabsTrigger value="fields" className="text-xs flex items-center gap-1.5">
              <List className="h-3.5 w-3.5" />
              {t('fieldsView.allFieldsTab')}
            </TabsTrigger>
            <TabsTrigger value="excluded" className="text-xs flex items-center gap-1.5">
              <EyeOff className="h-3.5 w-3.5" />
              {t('fieldsView.excludedTab')}
            </TabsTrigger>
          </TabsList>

          <div className="flex-1 overflow-hidden">
            <TabsContent value="fields" className="mt-0 h-full">
              <FieldSelector />
            </TabsContent>

            <TabsContent value="excluded" className="mt-0 h-full">
              <ExcludedFieldsTab />
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </div>
  );
}
