import { BookOpen, Info } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from '../../shared/i18n';
import AboutTab from './AboutTab';
import HelpTab from './HelpTab';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';

export default function InfoView() {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState('about');

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-hidden">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full flex flex-col">
          <TabsList className="grid w-full grid-cols-2 mb-4">
            <TabsTrigger value="help" className="text-xs flex items-center gap-1.5">
              <BookOpen className="h-3.5 w-3.5" />
              {t('info.helpTab')}
            </TabsTrigger>
            <TabsTrigger value="about" className="text-xs flex items-center gap-1.5">
              <Info className="h-3.5 w-3.5" />
              {t('info.aboutTab')}
            </TabsTrigger>
          </TabsList>

          <div className="flex-1 overflow-hidden">
            <TabsContent value="help" className="mt-0 h-full overflow-y-auto">
              <HelpTab />
            </TabsContent>

            <TabsContent value="about" className="mt-0 h-full overflow-y-auto">
              <AboutTab />
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </div>
  );
}
