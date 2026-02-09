import { useState, useEffect } from 'react';
import type { ExtensionConfig, Provider } from '../../../shared/types';
import { Button } from '../../../shared/components/ui/button';
import { Input } from '../../../shared/components/ui/input';
import { Label } from '../../../shared/components/ui/label';
import { Select } from '../../../shared/components';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../shared/components/ui/card';
import { Slider } from '../../../shared/components/ui/slider';
import { Separator } from '../../../shared/components/ui/separator';
import { Checkbox } from '../../../shared/components/ui/checkbox';
import { CheckCircle2, Loader2 } from 'lucide-react';
import { useTranslation, type SupportedLanguage } from '../../../shared/i18n';
import { createLogger } from '../../../shared/logger';

const logger = createLogger('SettingsView');

// Model lists for each provider (as of Feb 2026)
const PROVIDER_MODELS: Record<Provider, { value: string; label: string }[]> = {
  openai: [
    { value: 'gpt-5.2', label: 'GPT-5.2 (Latest)' },
    { value: 'gpt-5-mini', label: 'GPT-5 Mini' },
    { value: 'gpt-5-nano', label: 'GPT-5 Nano' },
    { value: 'gpt-5', label: 'GPT-5' },
    { value: 'gpt-4.1', label: 'GPT-4.1' },
    { value: 'gpt-4.1-mini', label: 'GPT-4.1 Mini' },
    { value: 'gpt-4o', label: 'GPT-4o' },
    { value: 'gpt-4o-mini', label: 'GPT-4o Mini' },
  ],
  anthropic: [
    { value: 'claude-opus-4-6', label: 'Claude Opus 4.6 (Latest)' },
    { value: 'claude-sonnet-4-5', label: 'Claude Sonnet 4.5' },
    { value: 'claude-haiku-4-5', label: 'Claude Haiku 4.5' },
    { value: 'claude-opus-4-5', label: 'Claude Opus 4.5' },
  ],
  google: [
    { value: 'gemini-3-pro-preview', label: 'Gemini 3 Pro (Preview)' },
    { value: 'gemini-3-flash-preview', label: 'Gemini 3 Flash (Preview)' },
    { value: 'gemini-2.5-pro', label: 'Gemini 2.5 Pro' },
    { value: 'gemini-2.5-flash', label: 'Gemini 2.5 Flash' },
    { value: 'gemini-2.5-flash-lite', label: 'Gemini 2.5 Flash-Lite' },
    { value: 'gemini-2.0-flash', label: 'Gemini 2.0 Flash' },
    { value: 'gemini-1.5-pro', label: 'Gemini 1.5 Pro' },
    { value: 'gemini-1.5-flash', label: 'Gemini 1.5 Flash' },
  ],
};

const PROVIDER_NAMES: Record<Provider, string> = {
  openai: 'OpenAI',
  anthropic: 'Anthropic',
  google: 'Google (Gemini)',
};

interface SettingsTabProps {
  onNavigate: (view: 'chat' | 'skills' | 'settings' | 'fields') => void;
}

export default function SettingsTab({ onNavigate }: SettingsTabProps) {
  const { t, language, setLanguage } = useTranslation();
  const [config, setConfig] = useState<ExtensionConfig>({
    provider: 'openai',
    model: 'gpt-5.2',
    apiKey: '',
    temperature: 0.7,
    maxTokens: 2000,
    allPageTextLimit: 10000,
    showSparkOnHover: true,
  });
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadConfig();
  }, []);

  const loadConfig = async () => {
    try {
      const response = await chrome.runtime.sendMessage({ type: 'GET_CONFIG' });
      if (response.type === 'CONFIG_RESPONSE') {
        setConfig(response.config);
      }
    } catch (error) {
      logger.error('Failed to load config:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveConfig = async () => {
    try {
      await chrome.runtime.sendMessage({
        type: 'SET_CONFIG',
        config,
      });
      setSaved(true);
      setTimeout(() => {
        setSaved(false);
        // Navigate back to chat after showing success message
        onNavigate('chat');
      }, 1500);
    } catch (error) {
      logger.error('Failed to save config:', error);
    }
  };

  const handleProviderChange = (newProvider: Provider) => {
    // Reset to first model for the new provider
    const firstModel = PROVIDER_MODELS[newProvider][0]?.value || '';
    setConfig({ ...config, provider: newProvider, model: firstModel });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
      </div>
    );
  }

  const availableModels = PROVIDER_MODELS[config.provider] || [];

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto space-y-4 pb-4">
        <Card>
          <CardHeader>
            <CardTitle>Provider Settings</CardTitle>
            <CardDescription>
              Configure your LLM provider and authentication
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="provider">Provider</Label>
            <Select
              options={(Object.keys(PROVIDER_NAMES) as Provider[]).map((provider) => ({
                value: provider,
                label: PROVIDER_NAMES[provider],
              }))}
              value={config.provider}
              onChange={(value) => handleProviderChange(value as Provider)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="model">Model</Label>
            <Select
              options={availableModels}
              value={config.model}
              onChange={(value) => setConfig({ ...config, model: value })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="apiKey">API Key</Label>
            <Input
              id="apiKey"
              type="password"
              value={config.apiKey}
              onChange={(e) => setConfig({ ...config, apiKey: e.target.value })}
              placeholder="Enter your API key"
            />
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Your API key is stored locally and never shared
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Generation Settings</CardTitle>
          <CardDescription>
            Fine-tune the model's behavior and output
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label htmlFor="temperature">Temperature</Label>
              <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                {(config.temperature ?? 0.7).toFixed(1)}
              </span>
            </div>
            <Slider
              id="temperature"
              min={0}
              max={1}
              step={0.1}
              value={[config.temperature ?? 0.7]}
              onValueChange={(value) => setConfig({ ...config, temperature: value[0] ?? 0.7 })}
            />
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Lower values make output more focused and deterministic
            </p>
          </div>

          <Separator />

          <div className="space-y-2">
            <Label htmlFor="maxTokens">Max Tokens</Label>
            <Input
              id="maxTokens"
              type="number"
              value={config.maxTokens}
              onChange={(e) => setConfig({ ...config, maxTokens: parseInt(e.target.value) || 0 })}
              min={1}
              max={10000}
            />
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Maximum length of the generated response
            </p>
          </div>

          <Separator />

          <div className="space-y-2">
            <Label htmlFor="allPageTextLimit">Page Text Limit (characters)</Label>
            <Input
              id="allPageTextLimit"
              type="number"
              value={config.allPageTextLimit}
              onChange={(e) => setConfig({ ...config, allPageTextLimit: parseInt(e.target.value) || 0 })}
              min={1000}
              max={100000}
            />
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Maximum page context to send when using "all page text" mode
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Language Settings</CardTitle>
          <CardDescription>
            Choose your preferred language for the interface
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="language">{t('settings.language')}</Label>
            <Select
              options={[
                { value: 'en', label: t('languages.en') },
                { value: 'es', label: t('languages.es') },
              ]}
              value={language}
              onChange={async (value) => {
                await setLanguage(value as SupportedLanguage);
                // Reload page to ensure all components update
                window.location.reload();
              }}
            />
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {t('settings.languageHelp')}
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Interface Settings</CardTitle>
          <CardDescription>
            Customize how the assistant interacts with form fields
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-start space-x-3">
            <Checkbox
              id="showSparkOnHover"
              checked={config.showSparkOnHover !== false}
              onCheckedChange={(checked) => 
                setConfig({ ...config, showSparkOnHover: checked === true })
              }
            />
            <div className="space-y-1 leading-none">
              <Label 
                htmlFor="showSparkOnHover"
                className="cursor-pointer font-medium"
              >
                Show assistant button on hover
              </Label>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Display the assistant button when hovering over fields. If disabled, buttons only appear when a field is focused.
              </p>
            </div>
          </div>

          <Separator />

          <div className="flex items-start space-x-3">
            <Checkbox
              id="enableLogging"
              checked={config.enableLogging === true}
              onCheckedChange={(checked) => 
                setConfig({ ...config, enableLogging: checked === true })
              }
            />
            <div className="space-y-1 leading-none">
              <Label 
                htmlFor="enableLogging"
                className="cursor-pointer font-medium"
              >
                Enable LLM logging
              </Label>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Store all LLM requests and responses for transparency. 
                Logs are kept locally and limited to the last 100 entries.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
      </div>

      {/* Sticky footer with save button and success message */}
      <div className="border-t bg-white dark:bg-gray-900 p-4 space-y-3">
        <Button onClick={saveConfig} className="w-full" size="lg">
          Save Settings
        </Button>

        {saved && (
          <Card className="border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950">
            <CardContent className="flex items-center gap-2 py-3 text-green-600 dark:text-green-400">
              <CheckCircle2 className="w-5 h-5" />
              <span className="font-medium">Settings saved successfully!</span>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
