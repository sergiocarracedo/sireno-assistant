import { BookOpen, GraduationCap, Zap } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from '../../../../../shared/i18n';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../../../../shared/components/ui/tabs';
import SearchBar from './components/SearchBar';
import GettingStartedContent from './components/GettingStartedContent';
import FeaturesContent from './components/FeaturesContent';
import AdvancedContent from './components/AdvancedContent';

export default function HelpTab() {
  const { t } = useTranslation();
  const [activeSubTab, setActiveSubTab] = useState('getting-started');
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <div className="flex flex-col h-full">
      <div className="mb-4">
        <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2 flex items-center gap-2">
          <BookOpen className="h-5 w-5" />
          {t('help.title')}
        </h1>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          {t('help.subtitle')}
        </p>
      </div>

      <SearchBar value={searchQuery} onChange={setSearchQuery} />

      <div className="flex-1 overflow-hidden">
        <Tabs value={activeSubTab} onValueChange={setActiveSubTab} className="h-full flex flex-col">
          <TabsList className="grid w-full grid-cols-3 mb-4">
            <TabsTrigger value="getting-started" className="text-xs flex items-center gap-1.5">
              <BookOpen className="h-3.5 w-3.5" />
              {t('help.gettingStartedTab')}
            </TabsTrigger>
            <TabsTrigger value="features" className="text-xs flex items-center gap-1.5">
              <Zap className="h-3.5 w-3.5" />
              {t('help.featuresTab')}
            </TabsTrigger>
            <TabsTrigger value="advanced" className="text-xs flex items-center gap-1.5">
              <GraduationCap className="h-3.5 w-3.5" />
              {t('help.advancedTab')}
            </TabsTrigger>
          </TabsList>

          <div className="flex-1 overflow-y-auto">
            <TabsContent value="getting-started" className="mt-0">
              <GettingStartedContent searchQuery={searchQuery} />
            </TabsContent>

            <TabsContent value="features" className="mt-0">
              <FeaturesContent searchQuery={searchQuery} />
            </TabsContent>

            <TabsContent value="advanced" className="mt-0">
              <AdvancedContent searchQuery={searchQuery} />
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </div>
  );
}
