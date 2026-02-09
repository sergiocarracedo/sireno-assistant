import { generateObject } from 'ai';
import { createOpenAI } from '@ai-sdk/openai';
import { createAnthropic } from '@ai-sdk/anthropic';
import { createGoogleGenerativeAI } from '@ai-sdk/google';
import type { ExtensionConfig, LLMResponse } from '../shared/types';
import type { RunLLMRequest } from '../shared/messages';
import { LLMResponseSchema } from '../shared/schemas';
import { createLogger } from '../shared/logger';

const logger = createLogger('LLMClient');

/**
 * LLM client wrapper using AI SDK
 */
export class LLMClient {
  constructor(private config: ExtensionConfig) {}

  /**
   * Run a structured LLM generation based on the request
   */
  async run(request: RunLLMRequest): Promise<LLMResponse> {
    const model = this.getModel();
    
    // Build the prompt
    const systemPrompt = this.buildSystemPrompt(request);
    const userPrompt = this.buildUserPrompt(request);

    try {
      const result = await generateObject({
        model,
        schema: LLMResponseSchema,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        temperature: this.config.temperature,
        maxOutputTokens: this.config.maxTokens,
      });

      return result.object;
    } catch (error) {
      logger.error('LLM generation failed:', error);
      throw new Error(`LLM generation failed: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  private getModel() {
    const { provider, model, apiKey } = this.config;
    
    switch (provider) {
      case 'openai': {
        const openai = createOpenAI({ apiKey });
        return openai(model);
      }
      case 'anthropic': {
        const anthropic = createAnthropic({ apiKey });
        return anthropic(model);
      }
      case 'google': {
        const google = createGoogleGenerativeAI({ apiKey });
        return google(model);
      }
      default:
        throw new Error(`Unknown provider: ${provider}`);
    }
  }

  /**
   * Get the model instance (public method for inline chat)
   */
  public getModelInstance() {
    return this.getModel();
  }

  private buildSystemPrompt(request: RunLLMRequest): string {
    let prompt = `You are a helpful assistant that proposes changes to form fields on a web page.

Your output must be a JSON object with:
- changes: array of { fieldIndex, action, value, rationale? }
  - fieldIndex: integer index into the selected fields array (0-based)
  - action: "replace" | "append" | "clear" | "skip"
  - value: string (empty if action is "skip")
  - rationale: optional explanation
- globalNotes: optional general message for the user

IMPORTANT: You must return valid JSON matching this schema. Field indices must reference the fields provided.`;

    // Inject skill instructions if present (support both single and multiple skills)
    const skills = request.skills || (request.skill ? [request.skill] : []);
    
    if (skills.length > 0) {
      prompt += `\n\nACTIVE SKILLS (${skills.length}):\n`;
      skills.forEach((skill, index) => {
        prompt += `\n${index + 1}. "${skill.name}"\n${skill.instructions}\n`;
      });
      prompt += `\nApply all active skill instructions when generating field changes.`;
    }

    return prompt;
  }

  private buildUserPrompt(request: RunLLMRequest): string {
    const { instruction, context, fields } = request;
    
    let prompt = `User instruction: ${instruction}\n\n`;

    // Add context based on level
    if (context.level !== 'none') {
      prompt += `Context:\n`;
      
      // Add date/time and language (always included unless level is 'none')
      if (context.dateTime) {
        prompt += `- Current date and time: ${context.dateTime}\n`;
      }
      if (context.language) {
        prompt += `- Browser language: ${context.language}\n`;
      }
      
      if (context.domain) {
        prompt += `- Domain: ${context.domain}\n`;
      }
      if (context.url) {
        prompt += `- URL: ${context.url}\n`;
      }
      if (context.pageText) {
        prompt += `- Page excerpt: ${context.pageText.slice(0, 500)}...\n`;
      }
    }

    // Add field metadata
    prompt += `\nSelected fields (${fields.length}):\n`;
    fields.forEach((field, index) => {
      prompt += `[${index}] ${field.labelHint} (${field.kind}`;
      if (field.inputType) prompt += `, type=${field.inputType}`;
      prompt += `)`;
      if (context.level === 'selected' || context.level === 'allPage') {
        prompt += ` = "${field.value}"`;
      }
      prompt += `\n`;
    });

    return prompt;
  }
}
