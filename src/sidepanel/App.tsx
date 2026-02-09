import { ArrowLeft, FileText, HelpCircle, ListChecks, Settings, Zap } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { Button } from '../shared/components/ui/button';
import { useTranslation } from '../shared/i18n';
import type { ExtensionConfig } from '../shared/types';
import ChatView from './views/chat';
import FieldsView from './views/fields';
import InfoView from './views/info';
import LogsView from './views/logs';
import SettingsView from './views/settings';
import SkillsView from './views/skills';

type View = 'chat' | 'skills' | 'settings' | 'fields' | 'logs' | 'info';

interface SidebarInitData {
  view: View;
  fieldId?: string;
  inputText?: string;
  timestamp: number;
}

export default function App() {
  const { t } = useTranslation();
  const [activeView, setActiveView] = useState<View>('chat');
  const [config, setConfig] = useState<ExtensionConfig | null>(null);
  const [initData, setInitData] = useState<SidebarInitData | null>(null);
  const [excludedFieldsCount, setExcludedFieldsCount] = useState(0);

  // Load config function
  const loadConfig = async () => {
    try {
      const response = await chrome.runtime.sendMessage({ type: 'GET_CONFIG' });
      if (response.type === 'CONFIG_RESPONSE') {
        setConfig(response.config);
      }
    } catch (error) {
      console.error('Failed to load config:', error);
    }
  };

  // Load excluded fields count for current page
  const loadExcludedFieldsCount = async () => {
    try {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      if (!tab?.url) {
        setExcludedFieldsCount(0);
        return;
      }

      const response = await chrome.runtime.sendMessage({
        type: 'GET_EXCLUDED_FIELDS',
        url: tab.url,
      });

      if (response.fields && Array.isArray(response.fields)) {
        setExcludedFieldsCount(response.fields.length);
      } else {
        setExcludedFieldsCount(0);
      }
    } catch (error) {
      console.error('Failed to load excluded fields count:', error);
      setExcludedFieldsCount(0);
    }
  };

  // Check for init data from inline chat
  const checkInitData = async () => {
    try {
      const result = await chrome.storage.local.get('sidebar_init');
      if (result.sidebar_init) {
        const data = result.sidebar_init as SidebarInitData;
        // Only use if recent (< 2 seconds old)
        if (Date.now() - data.timestamp < 2000) {
          setInitData(data);
          setActiveView(data.view);
          // Clear the init data
          await chrome.storage.local.remove('sidebar_init');
        }
      }
    } catch (error) {
      console.error('Failed to check init data:', error);
    }
  };

  // Load config and check init data on mount
  useEffect(() => {
    loadConfig();
    checkInitData();
    loadExcludedFieldsCount();

    // Listen for tab changes
    const handleTabChange = () => {
      loadExcludedFieldsCount();
    };

    chrome.tabs.onActivated.addListener(handleTabChange);
    chrome.tabs.onUpdated.addListener(handleTabChange);

    return () => {
      chrome.tabs.onActivated.removeListener(handleTabChange);
      chrome.tabs.onUpdated.removeListener(handleTabChange);
    };
  }, []);

  // Reload config when view changes (especially when leaving settings)
  // Also reload excluded fields count when changing views
  useEffect(() => {
    loadConfig();
    loadExcludedFieldsCount();
  }, [activeView]);

  const views: Record<string, { title: string; icon: React.ReactNode; render: React.ReactNode; bubble?: React.ReactNode }> = useMemo(() => ({
    chat: {
      title: 'Chat',
      icon: <Zap className="h-4 w-4" />,
      render: <ChatView onNavigate={setActiveView} initData={initData} />,
    },
    fields: {
      title: 'Fields',
      icon: <ListChecks className="h-4 w-4" />,
      render: <FieldsView />,
      bubble: excludedFieldsCount > 0 && (
          <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-600 text-[10px] font-bold text-white">
            {excludedFieldsCount > 9 ? '9+' : excludedFieldsCount}
          </span>
        )
    },
    skills: {
      title: 'Skills',
      icon: <Zap className="h-4 w-4" />,
      render: <SkillsView />,
    },
    ...(config?.enableLogging ?{
      logs: {
        title: 'Logs',
        icon: <FileText className="h-4 w-4" />,
        render: <LogsView />,
      } } : {}),
    settings: {
      title: 'Settings',
      icon: <Settings className="h-4 w-4" />,
      render: <SettingsView onNavigate={setActiveView} />,
    },
    info: {
      title: 'Info',
      icon: <HelpCircle className="h-4 w-4" />,
      render: <InfoView />,
    },
  }), [initData, setActiveView, excludedFieldsCount]);

  return (
    <div className="app">
      <header className="header">
        {/* Left side: Back button or empty space */}
        <div className="flex flex-1 items-center">
          {activeView !== 'chat' && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setActiveView('chat')}
            >
              <ArrowLeft className="h-4 w-4 mr-1" />
              {t('common.back')}
            </Button>
          )}
        </div>
        
        {/* Right side: Action icons */}
        <div className="flex flex-1 min-w-0 gap-1 overflow-auto justify-end">
          {Object.entries(views).map(([key, view]) => (
            <Button
              key={key}
              variant={activeView === key ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setActiveView(key as View)}
              title={view.title}
            >
              {view.icon}
              {view?.bubble ?? null}
            </Button>
          ))}
        </div>
      </header>

      <div className="tab-content">
        {views[activeView] ? views[activeView].render : <p>No active view</p>}
      </div>
    </div>
  );
}
