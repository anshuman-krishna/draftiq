import { Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import OpenAI from "openai";
import { buildRecommendationPrompt } from "./prompts/recommendation.prompt";
import { buildExplanationPrompt } from "./prompts/explanation.prompt";
import { buildUpsellPrompt } from "./prompts/upsell.prompt";

interface PriceBreakdown {
  items: { label: string; price: number }[];
  total: number;
}

export interface RecommendationResult {
  tier: "good" | "better" | "best";
  title: string;
  reasoning: string;
  confidence: number;
}

export interface ExplanationResult {
  summary: string;
  items: { label: string; explanation: string }[];
  valueNote: string;
}

export interface UpsellResult {
  suggestions: {
    addonId: string;
    label: string;
    price: number;
    reason: string;
  }[];
  note: string | null;
}

// simple in-memory cache
interface CacheEntry<T> {
  data: T;
  expiresAt: number;
}

const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

@Injectable()
export class AiService {
  private readonly logger = new Logger(AiService.name);
  private readonly client: OpenAI | null;
  private readonly model = "gpt-4o-mini";
  private readonly cache = new Map<string, CacheEntry<unknown>>();

  constructor(private readonly config: ConfigService) {
    const apiKey = this.config.get<string>("OPENAI_API_KEY");
    this.client = apiKey ? new OpenAI({ apiKey }) : null;

    if (!this.client) {
      this.logger.warn("OPENAI_API_KEY not set — ai features disabled");
    }
  }

  async recommendPackage(
    answers: Record<string, string | string[]>,
    breakdown: PriceBreakdown,
  ): Promise<RecommendationResult | null> {
    const cacheKey = `recommend:${this.hash(answers)}`;
    const cached = this.getFromCache<RecommendationResult>(cacheKey);
    if (cached) return cached;

    const prompt = buildRecommendationPrompt(answers, breakdown);
    const result = await this.complete<RecommendationResult>(prompt);
    if (result) this.setCache(cacheKey, result);
    return result;
  }

  async explainPricing(
    breakdown: PriceBreakdown,
  ): Promise<ExplanationResult | null> {
    const cacheKey = `explain:${this.hash(breakdown)}`;
    const cached = this.getFromCache<ExplanationResult>(cacheKey);
    if (cached) return cached;

    const prompt = buildExplanationPrompt(breakdown);
    const result = await this.complete<ExplanationResult>(prompt);
    if (result) this.setCache(cacheKey, result);
    return result;
  }

  async suggestUpsells(
    answers: Record<string, string | string[]>,
    breakdown: PriceBreakdown,
  ): Promise<UpsellResult | null> {
    const cacheKey = `upsell:${this.hash(answers)}`;
    const cached = this.getFromCache<UpsellResult>(cacheKey);
    if (cached) return cached;

    const prompt = buildUpsellPrompt(answers, breakdown);
    const result = await this.complete<UpsellResult>(prompt);
    if (result) this.setCache(cacheKey, result);
    return result;
  }

  private async complete<T>(prompt: string): Promise<T | null> {
    if (!this.client) return null;

    try {
      const response = await this.client.chat.completions.create({
        model: this.model,
        messages: [
          { role: "system", content: "you are a helpful hvac advisor. respond only in valid JSON. no markdown, no code fences." },
          { role: "user", content: prompt },
        ],
        temperature: 0.3,
        max_tokens: 500,
        response_format: { type: "json_object" },
      });

      const content = response.choices[0]?.message?.content;
      if (!content) return null;

      return JSON.parse(content) as T;
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      this.logger.error(`ai completion failed: ${message}`);
      return null;
    }
  }

  private hash(data: unknown): string {
    return Buffer.from(JSON.stringify(data)).toString("base64url").slice(0, 32);
  }

  private getFromCache<T>(key: string): T | null {
    const entry = this.cache.get(key) as CacheEntry<T> | undefined;
    if (!entry) return null;
    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key);
      return null;
    }
    return entry.data;
  }

  private setCache<T>(key: string, data: T): void {
    // evict stale entries periodically
    if (this.cache.size > 100) {
      const now = Date.now();
      for (const [k, v] of this.cache) {
        if (now > (v as CacheEntry<unknown>).expiresAt) this.cache.delete(k);
      }
    }
    this.cache.set(key, { data, expiresAt: Date.now() + CACHE_TTL_MS });
  }
}
