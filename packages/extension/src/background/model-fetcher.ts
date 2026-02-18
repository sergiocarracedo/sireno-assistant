/**
 * Fetches available models from provider APIs using the user's API key.
 * Results are cached in chrome.storage.local with a 24-hour TTL.
 */

import type { Provider } from "../shared/types";
import { createLogger } from "../shared/logger";

const logger = createLogger("ModelFetcher");

const CACHE_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours

interface ModelCache {
  models: string[];
  fetchedAt: number;
}

type ModelCacheStore = Partial<Record<Provider, ModelCache>>;

const CACHE_KEY = "model_cache";

// ─── Cache helpers ────────────────────────────────────────────────────────────

async function readCache(): Promise<ModelCacheStore> {
  const result = await chrome.storage.local.get(CACHE_KEY);
  return (result[CACHE_KEY] as ModelCacheStore) ?? {};
}

async function writeCache(store: ModelCacheStore): Promise<void> {
  await chrome.storage.local.set({ [CACHE_KEY]: store });
}

export async function getCachedModels(provider: Provider): Promise<string[] | null> {
  const store = await readCache();
  const entry = store[provider];
  if (!entry) return null;
  if (Date.now() - entry.fetchedAt > CACHE_TTL_MS) return null; // stale
  return entry.models;
}

async function setCachedModels(provider: Provider, models: string[]): Promise<void> {
  const store = await readCache();
  store[provider] = { models, fetchedAt: Date.now() };
  await writeCache(store);
}

// ─── Fetch logic per provider ─────────────────────────────────────────────────

async function fetchGroqModels(apiKey: string): Promise<string[]> {
  const res = await fetch("https://api.groq.com/openai/v1/models", {
    headers: { Authorization: `Bearer ${apiKey}` },
  });
  if (!res.ok) throw new Error(`Groq API error: ${res.status}`);
  const data = await res.json();
  return (data.data as { id: string }[]).map((m) => m.id).sort();
}

async function fetchOpenAIModels(apiKey: string): Promise<string[]> {
  const res = await fetch("https://api.openai.com/v1/models", {
    headers: { Authorization: `Bearer ${apiKey}` },
  });
  if (!res.ok) throw new Error(`OpenAI API error: ${res.status}`);
  const data = await res.json();
  // Only include chat/gpt models, filter out embeddings/audio/image models
  const models: string[] = (data.data as { id: string }[])
    .map((m) => m.id)
    .filter(
      (id) =>
        id.startsWith("gpt-") ||
        id.startsWith("o1") ||
        id.startsWith("o3") ||
        id.startsWith("chatgpt-"),
    )
    .sort();
  return models;
}

async function fetchAnthropicModels(apiKey: string): Promise<string[]> {
  const res = await fetch("https://api.anthropic.com/v1/models", {
    headers: {
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
    },
  });
  if (!res.ok) throw new Error(`Anthropic API error: ${res.status}`);
  const data = await res.json();
  return (data.data as { id: string }[]).map((m) => m.id).sort();
}

async function fetchGoogleModels(apiKey: string): Promise<string[]> {
  const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
  if (!res.ok) throw new Error(`Google API error: ${res.status}`);
  const data = await res.json();
  // Filter only generative models that support generateContent
  const models: string[] = (
    data.models as { name: string; supportedGenerationMethods?: string[] }[]
  )
    .filter((m) => m.supportedGenerationMethods?.includes("generateContent"))
    .map((m) => m.name.replace("models/", ""))
    .sort();
  return models;
}

// ─── Public API ───────────────────────────────────────────────────────────────

/**
 * Fetch models from a provider API. Returns cached results if fresh.
 * Throws if the API key is missing or the request fails.
 */
export async function fetchModels(provider: Provider, apiKey: string): Promise<string[]> {
  if (!apiKey?.trim()) {
    throw new Error("API key is required to fetch models");
  }

  // Check cache first
  const cached = await getCachedModels(provider);
  if (cached) {
    logger.debug(`Using cached models for ${provider}: ${cached.length} models`);
    return cached;
  }

  logger.info(`Fetching models from ${provider} API...`);

  let models: string[];

  switch (provider) {
    case "groq":
      models = await fetchGroqModels(apiKey);
      break;
    case "openai":
      models = await fetchOpenAIModels(apiKey);
      break;
    case "anthropic":
      models = await fetchAnthropicModels(apiKey);
      break;
    case "google":
      models = await fetchGoogleModels(apiKey);
      break;
    default: {
      const _exhaustive: never = provider;
      throw new Error(`Unknown provider: ${_exhaustive}`);
    }
  }

  logger.info(`Fetched ${models.length} models from ${provider}`);
  await setCachedModels(provider, models);
  return models;
}

/**
 * Force-refresh models from the provider API (bypasses cache).
 */
export async function refreshModels(provider: Provider, apiKey: string): Promise<string[]> {
  if (!apiKey?.trim()) {
    throw new Error("API key is required to fetch models");
  }

  // Clear cache for this provider
  const store = await readCache();
  delete store[provider];
  await writeCache(store);

  return fetchModels(provider, apiKey);
}
