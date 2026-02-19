import { useState, useEffect, useCallback } from "react";
import type { ExtensionConfig, Provider } from "../../../shared/types";
import type { Theme } from "../../../shared/hooks/useTheme";
import { Button } from "../../../shared/components/ui/button";
import { Input } from "../../../shared/components/ui/input";
import { Label } from "../../../shared/components/ui/label";
import { Select } from "../../../shared/components";
import { Switch } from "@heroui/react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../../shared/components/ui/card";
import { Slider } from "../../../shared/components/ui/slider";
import { Separator } from "../../../shared/components/ui/separator";
import { Checkbox } from "../../../shared/components/ui/checkbox";
import { Loader2, RefreshCw, AlertTriangle, Moon, Sun } from "lucide-react";
import { useTranslation, type SupportedLanguage } from "../../../shared/i18n";
import { createLogger } from "../../../shared/logger";
import toast, { Toaster } from "react-hot-toast";

const logger = createLogger("SettingsView");

// Fallback model lists used when no API key is set or fetch fails
const FALLBACK_MODELS: Record<Provider, { value: string; label: string }[]> = {
  groq: [
    { value: "llama-3.1-8b-instant", label: "Llama 3.1 8B Instant (Fastest)" },
    { value: "llama-3.3-70b-versatile", label: "Llama 3.3 70B Versatile" },
    { value: "gemma2-9b-it", label: "Gemma 2 9B" },
    { value: "deepseek-r1-distill-llama-70b", label: "DeepSeek R1 Distill Llama 70B" },
  ],
  openai: [
    { value: "gpt-4o", label: "GPT-4o" },
    { value: "gpt-4o-mini", label: "GPT-4o Mini" },
    { value: "gpt-4-turbo", label: "GPT-4 Turbo" },
    { value: "o1", label: "o1" },
    { value: "o1-mini", label: "o1 Mini" },
    { value: "o3-mini", label: "o3 Mini" },
  ],
  anthropic: [
    { value: "claude-opus-4-5", label: "Claude Opus 4.5 (Latest)" },
    { value: "claude-sonnet-4-5", label: "Claude Sonnet 4.5" },
    { value: "claude-haiku-4-5", label: "Claude Haiku 4.5" },
  ],
  google: [
    { value: "gemini-2.5-pro", label: "Gemini 2.5 Pro" },
    { value: "gemini-2.5-flash", label: "Gemini 2.5 Flash" },
    { value: "gemini-2.0-flash", label: "Gemini 2.0 Flash" },
    { value: "gemini-1.5-pro", label: "Gemini 1.5 Pro" },
    { value: "gemini-1.5-flash", label: "Gemini 1.5 Flash" },
  ],
};

const PROVIDER_NAMES: Record<Provider, string> = {
  groq: "Groq",
  openai: "OpenAI",
  anthropic: "Anthropic",
  google: "Google (Gemini)",
};

const PROVIDER_INFO: Record<
  Provider,
  { description: string; badge?: string; badgeColor?: string; docsUrl?: string }
> = {
  groq: {
    description: "Ultra-fast inference with Llama models",
    badge: "FREE TIER",
    badgeColor: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
    docsUrl: "https://console.groq.com/keys",
  },
  openai: {
    description: "GPT models from OpenAI",
    docsUrl: "https://platform.openai.com/api-keys",
  },
  anthropic: {
    description: "Claude models from Anthropic",
    docsUrl: "https://console.anthropic.com/settings/keys",
  },
  google: {
    description: "Gemini models from Google",
    badge: "FREE TIER",
    badgeColor: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
    docsUrl: "https://aistudio.google.com/app/apikey",
  },
};

interface SettingsTabProps {
  onNavigate: (view: "chat" | "skills" | "settings" | "fields") => void;
  theme?: Theme;
  setTheme?: (theme: Theme) => void;
}

type ModelEntry = { value: string; label: string; deprecated?: boolean };

type FetchState = "idle" | "fetching" | "success" | "error";

export default function SettingsTab({ onNavigate, theme, setTheme }: SettingsTabProps) {
  const { t, language, setLanguage } = useTranslation();
  const [config, setConfig] = useState<ExtensionConfig>({
    provider: "groq",
    providerConfigs: {
      groq: { model: "llama-3.1-8b-instant", apiKey: "" },
      openai: { model: "gpt-4o", apiKey: "" },
      anthropic: { model: "claude-opus-4-5", apiKey: "" },
      google: { model: "gemini-2.5-pro", apiKey: "" },
    },
    temperature: 0.7,
    maxTokens: 2000,
    allPageTextLimit: 10000,
    showSparkOnHover: true,
  });
  const [loading, setLoading] = useState(true);

  // Per-provider model lists (fetched from API or fallback)
  const [fetchedModels, setFetchedModels] = useState<Partial<Record<Provider, string[]>>>({});
  const [fetchState, setFetchState] = useState<FetchState>("idle");
  const [fetchError, setFetchError] = useState<string | null>(null);

  useEffect(() => {
    loadConfig();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadConfig = async () => {
    try {
      const response = await chrome.runtime.sendMessage({ type: "GET_CONFIG" });
      if (response?.type === "CONFIG_RESPONSE") {
        setConfig(response.config);
        // Try loading cached models for the active provider
        loadCachedModels(response.config.provider);
      }
    } catch (error) {
      logger.error("Failed to load config:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadCachedModels = async (provider: Provider) => {
    try {
      const response = await chrome.runtime.sendMessage({
        type: "GET_CACHED_MODELS",
        provider,
      });
      if (response?.type === "MODELS_RESPONSE") {
        setFetchedModels((prev) => ({ ...prev, [provider]: response.models }));
      }
    } catch {
      // Ignore — we'll just use fallback list
    }
  };

  const fetchLiveModels = useCallback(async (provider: Provider, apiKey: string) => {
    if (!apiKey?.trim()) return;
    setFetchState("fetching");
    setFetchError(null);
    try {
      const response = await chrome.runtime.sendMessage({
        type: "FETCH_MODELS",
        provider,
      });
      if (response?.type === "MODELS_RESPONSE") {
        setFetchedModels((prev) => ({ ...prev, [provider]: response.models }));
        setFetchState("success");
      } else if (response?.type === "MODELS_ERROR") {
        setFetchError(response.error);
        setFetchState("error");
      }
    } catch (err) {
      setFetchError(err instanceof Error ? err.message : "Unknown error");
      setFetchState("error");
    }
  }, []);

  const saveConfig = async () => {
    try {
      await chrome.runtime.sendMessage({ type: "SET_CONFIG", config });
      toast.success("Settings saved successfully!", {
        duration: 2000,
        position: "bottom-center",
      });
      // Trigger model fetch for the active provider after save
      const apiKey = config.providerConfigs[config.provider]?.apiKey;
      if (apiKey) {
        fetchLiveModels(config.provider, apiKey);
      }
      setTimeout(() => {
        onNavigate("chat");
      }, 1500);
    } catch (error) {
      logger.error("Failed to save config:", error);
      toast.error("Failed to save settings");
    }
  };

  const handleProviderChange = (newProvider: Provider) => {
    setConfig({ ...config, provider: newProvider });
    setFetchState("idle");
    setFetchError(null);
    loadCachedModels(newProvider);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
      </div>
    );
  }

  // Build model options for the current provider
  const buildModelOptions = (): ModelEntry[] => {
    const live = fetchedModels[config.provider];
    const currentModel = config.providerConfigs[config.provider]?.model ?? "";

    if (live && live.length > 0) {
      const options: ModelEntry[] = live.map((id) => ({ value: id, label: id }));

      // Check if currently configured model is deprecated (not in live list)
      if (currentModel && !live.includes(currentModel)) {
        options.unshift({
          value: currentModel,
          label: `⚠ ${currentModel} (Deprecated)`,
          deprecated: true,
        });
      }
      return options;
    }

    // Fallback: use static list, still check for deprecated model
    const fallback = FALLBACK_MODELS[config.provider] ?? [];
    const inFallback = fallback.some((m) => m.value === currentModel);
    if (currentModel && !inFallback) {
      return [
        { value: currentModel, label: `⚠ ${currentModel} (Deprecated)`, deprecated: true },
        ...fallback,
      ];
    }
    return fallback;
  };

  const modelOptions = buildModelOptions();
  const currentModel = config.providerConfigs[config.provider]?.model ?? "";
  const currentModelDeprecated = modelOptions.find((m) => m.value === currentModel)?.deprecated;

  const hasApiKey = !!config.providerConfigs[config.provider]?.apiKey?.trim();

  return (
    <div className="flex flex-col h-full">
      <Toaster />
      <div className="flex-1 overflow-y-auto space-y-4 pb-4">
        {theme !== undefined && setTheme && (
          <Card>
            <CardHeader>
              <CardTitle>Appearance</CardTitle>
              <CardDescription>Customize the visual theme of the extension</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="theme-switch">Dark Mode</Label>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Switch between light and dark theme
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Sun className="h-4 w-4 text-gray-500" />
                  <Switch
                    id="theme-switch"
                    isSelected={
                      theme === "dark" ||
                      (theme === "system" &&
                        window.matchMedia("(prefers-color-scheme: dark)").matches)
                    }
                    onValueChange={(checked: boolean) => setTheme(checked ? "dark" : "light")}
                    color="secondary"
                  />
                  <Moon className="h-4 w-4 text-gray-500" />
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle>Provider Settings</CardTitle>
            <CardDescription>Configure your LLM provider and authentication</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="provider">Provider</Label>
              <Select
                options={(Object.keys(PROVIDER_NAMES) as Provider[]).map((provider) => ({
                  value: provider,
                  label: PROVIDER_NAMES[provider],
                  badge: PROVIDER_INFO[provider]?.badge,
                  badgeColor: PROVIDER_INFO[provider]?.badgeColor,
                }))}
                value={config.provider}
                onChange={(value) => handleProviderChange(value as Provider)}
              />
              {PROVIDER_INFO[config.provider]?.description && (
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {PROVIDER_INFO[config.provider].description}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="model">Model</Label>
                {hasApiKey && (
                  <button
                    onClick={() =>
                      fetchLiveModels(
                        config.provider,
                        config.providerConfigs[config.provider]?.apiKey ?? "",
                      )
                    }
                    disabled={fetchState === "fetching"}
                    className="flex items-center gap-1 text-xs text-violet-600 dark:text-violet-400 hover:underline disabled:opacity-50"
                    title="Refresh model list from provider API"
                  >
                    <RefreshCw
                      className={`h-3 w-3 ${fetchState === "fetching" ? "animate-spin" : ""}`}
                    />
                    {fetchState === "fetching" ? "Fetching…" : "Refresh models"}
                  </button>
                )}
              </div>

              {currentModelDeprecated && (
                <div className="flex items-start gap-2 p-2.5 bg-amber-50 dark:bg-amber-950 border border-amber-200 dark:border-amber-800 rounded-md">
                  <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                  <p className="text-xs text-amber-700 dark:text-amber-300">
                    The model <strong>{currentModel}</strong> is no longer available from this
                    provider. Please select a different model.
                  </p>
                </div>
              )}

              <Select
                options={modelOptions.map((m) => ({
                  value: m.value,
                  label: m.label,
                }))}
                value={currentModel}
                onChange={(value) =>
                  setConfig({
                    ...config,
                    providerConfigs: {
                      ...config.providerConfigs,
                      [config.provider]: {
                        ...config.providerConfigs[config.provider],
                        model: value,
                      },
                    },
                  })
                }
              />

              {fetchState === "error" && fetchError && (
                <p className="text-xs text-red-600 dark:text-red-400">
                  Failed to fetch models: {fetchError}. Using fallback list.
                </p>
              )}
              {fetchState === "success" && (
                <p className="text-xs text-green-600 dark:text-green-400">
                  Model list updated from {PROVIDER_NAMES[config.provider]} API.
                </p>
              )}
              {!hasApiKey && (
                <p className="text-xs text-gray-400 dark:text-gray-500">
                  Add an API key to fetch the latest models from {PROVIDER_NAMES[config.provider]}.
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="apiKey">API Key</Label>
              <Input
                id="apiKey"
                type="password"
                value={config.providerConfigs[config.provider]?.apiKey ?? ""}
                onChange={(e) =>
                  setConfig({
                    ...config,
                    providerConfigs: {
                      ...config.providerConfigs,
                      [config.provider]: {
                        ...config.providerConfigs[config.provider],
                        apiKey: e.target.value,
                      },
                    },
                  })
                }
                placeholder="Enter your API key"
              />
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Your API key is stored locally and never shared.{" "}
                {PROVIDER_INFO[config.provider]?.docsUrl && (
                  <a
                    href={PROVIDER_INFO[config.provider].docsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-violet-600 dark:text-violet-400 underline hover:no-underline"
                  >
                    Get your API key →
                  </a>
                )}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Generation Settings</CardTitle>
            <CardDescription>Fine-tune the model&apos;s behavior and output</CardDescription>
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
                onChange={(e) =>
                  setConfig({ ...config, allPageTextLimit: parseInt(e.target.value) || 0 })
                }
                min={1000}
                max={100000}
              />
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Maximum page context to send when using &quot;all page text&quot; mode
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Language Settings</CardTitle>
            <CardDescription>Choose your preferred language for the interface</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="language">{t("settings.language")}</Label>
              <Select
                options={[
                  { value: "en", label: t("languages.en") },
                  { value: "es", label: t("languages.es") },
                ]}
                value={language}
                onChange={async (value) => {
                  await setLanguage(value as SupportedLanguage);
                  window.location.reload();
                }}
              />
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {t("settings.languageHelp")}
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
                <Label htmlFor="showSparkOnHover" className="cursor-pointer font-medium">
                  Show assistant button on hover
                </Label>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Display the assistant button when hovering over fields. If disabled, buttons only
                  appear when a field is focused.
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
                <Label htmlFor="enableLogging" className="cursor-pointer font-medium">
                  Enable LLM logging
                </Label>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Store all LLM requests and responses for transparency. Logs are kept locally and
                  limited to the last 100 entries.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Footer with save button */}
      <div className="border-t border-gray-200 dark:border-gray-800 pt-4 flex justify-end">
        <Button onClick={saveConfig} size="lg">
          Save Settings
        </Button>
      </div>
    </div>
  );
}
