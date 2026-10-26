/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { GoogleGenAI } from '@google/genai';

export const SITE_BRAND_URL = 'https://arabiprompt.ai.studio';

/**
 * STRICT SAFETY POLICY:
 * Prevents unauthorized or unexpected invocation of expensive video or experimental billing models.
 * The Veo Lite model incident ($12.44) occurred when keys were exposed or video models were triggered.
 * This proxy strictly prohibits video generation / omni video calls.
 */
const BANNED_EXPENSIVE_MODELS = [
  'veo',
  'veo-lite',
  'veo-2',
  'gemini-omni-1.1-flash',
  'lyria',
  'imagen-3'
];

export const SAFE_ALLOWED_MODELS = [
  'gemini-3.8-flash',
  'gemini-flash-latest',
  'gemini-3.1-flash-lite',
  'gemini-4-argon'
];

let aiClient: GoogleGenAI | null = null;

export function getGeminiClient(): GoogleGenAI {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === 'MY_GEMINI_API_KEY') {
    throw new Error('GEMINI_API_KEY is not configured on the Cloud Function. Please set it via Cloud Secret Manager or environment variables.');
  }

  if (!aiClient) {
    aiClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'arabprompt-cloud-functions',
        },
      },
    });
  }
  return aiClient;
}

export function validateSafeModel(requestedModel?: string): string {
  if (!requestedModel) return 'gemini-3.8-flash';
  const lower = requestedModel.toLowerCase();

  for (const banned of BANNED_EXPENSIVE_MODELS) {
    if (lower.includes(banned)) {
      throw new Error(`Access Denied: The requested model '${requestedModel}' is blocked by security policy to prevent unexpected billing. Only text and vision analysis models are authorized.`);
    }
  }

  if (SAFE_ALLOWED_MODELS.includes(requestedModel)) {
    return requestedModel;
  }

  // Default safely to gemini-3.8-flash
  return 'gemini-3.8-flash';
}

export function attachSiteBrandUrl(text: string): string {
  if (!text || typeof text !== 'string') return text;
  let result = text.trim();
  const siteUrl = SITE_BRAND_URL;

  if (result.includes('```')) {
    result = result.replace(/```([a-zA-Z0-9_-]*)\n([\s\S]*?)```/g, (match, codeLang, codeBody) => {
      if (!codeBody.includes('arabiprompt.ai.studio')) {
        const cleanBody = codeBody.trimEnd();
        return `\`\`\`${codeLang}\n${cleanBody}\n\n# Source & Engineered via: ${siteUrl}\n\`\`\``;
      }
      return match;
    });
  }

  if (!result.includes('https://arabiprompt.ai.studio')) {
    result += `\n\n---\n🔗 تم التوليد عبر منصة عرب برومبت: ${siteUrl}\nGenerated with ArabPrompt: ${siteUrl}`;
  } else if (!result.includes('🔗 تم التوليد عبر منصة عرب برومبت')) {
    result += `\n\n---\n🔗 تم التوليد عبر منصة عرب برومبت: ${siteUrl}\nGenerated with ArabPrompt: ${siteUrl}`;
  }

  return result;
}

export interface GenerateParams {
  contents: any;
  config?: any;
  model?: string;
}

export async function generateContentWithQuotaResilience(params: GenerateParams) {
  const ai = getGeminiClient();
  const primaryModel = validateSafeModel(params.model);

  const modelsToTry = [primaryModel];
  if (primaryModel === 'gemini-3.8-flash') {
    modelsToTry.push('gemini-flash-latest');
    modelsToTry.push('gemini-3.1-flash-lite');
  }

  let lastError: any = null;

  for (const model of modelsToTry) {
    try {
      const response = await ai.models.generateContent({
        ...params,
        model,
      });
      return response;
    } catch (error: any) {
      lastError = error;
      const errMsg = error?.message || String(error);
      const isQuotaOrTransientError =
        errMsg.includes('429') ||
        errMsg.includes('503') ||
        errMsg.includes('500') ||
        errMsg.includes('RESOURCE_EXHAUSTED') ||
        errMsg.includes('UNAVAILABLE') ||
        errMsg.includes('quota') ||
        error?.status === 'RESOURCE_EXHAUSTED' ||
        error?.status === 429;

      if (isQuotaOrTransientError) {
        console.warn(`[Functions Proxy] Model ${model} is throttled. Trying fallback model...`);
        continue;
      } else {
        throw error;
      }
    }
  }

  throw lastError;
}
