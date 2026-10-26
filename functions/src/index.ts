/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { onRequest } from 'firebase-functions/v2/https';
import { defineSecret } from 'firebase-functions/params';
import express, { Request, Response } from 'express';
import cors from 'cors';
import { Type } from '@google/genai';
import {
  generateContentWithQuotaResilience,
  attachSiteBrandUrl,
  validateSafeModel
} from './config.js';

// Define Cloud Secret Manager secret for production
export const geminiApiKeySecret = defineSecret('GEMINI_API_KEY');

const app = express();

// Standard middleware
app.use(cors({ origin: true }));
app.use(express.json({ limit: '20mb' }));
app.use(express.urlencoded({ limit: '20mb', extended: true }));

// Health / Status endpoint (Never reveals the API key)
app.get('/health', (req: Request, res: Response) => {
  const hasKey = !!process.env.GEMINI_API_KEY;
  res.json({
    status: 'online',
    service: 'ArabPrompt Gemini Secure Proxy',
    isKeyConfigured: hasKey,
    allowedModels: ['gemini-3.8-flash', 'gemini-flash-latest', 'gemini-3.1-flash-lite'],
    billingProtection: 'Active - Expensive video/veo models are strictly rejected'
  });
});

// 1. Generate Prompt Endpoint
app.post('/generate-prompt', async (req: Request, res: Response) => {
  try {
    const { rawConcept, model, tone, category, language, useClarificationLoop } = req.body;
    if (!rawConcept || typeof rawConcept !== 'string') {
      return res.status(400).json({ error: 'Concept text is required' });
    }

    const safeModel = validateSafeModel(model);

    const systemInstruction = `أنت خبير واستشاري متقدم في هندسة الأوامر (Bilingual Prompt Engineering Genius Specialist).
مهمتك الأساسية هي تلقي فكرة أو دافع بسيط ومبهم من المستخدم باللغتين العربية أو الإنجليزية وصياغته وتطويره بدقة معمارية فائقة إلى لغة برومبتات برمجية واضحة وشديدة الفعالية.

أنت ملزم تماماً بتقديم وتوليد خيارين منفصلين تماماً:

الخيار الأول (خيار أ - تطبيق البرومبت الأصلي المباشر / Faithful Direct Formulation):
---ORIGINAL_PROMPT_VERSION---
[محتوى وتنسيق الخيار الأول - يفضل وضعه في صندوق كود]
---ORIGINAL_PROMPT_VERSION_END---

الخيار الثاني (خيار ب - البرومبت الهندسي المحسن المطور / Deeply Engineered Prompt):
---ENHANCED_PROMPT_VERSION---
[محتوى وتنسيق الخيار الثاني المطور بالكامل مع دور واضح persona، مهمة task، قيود constraints، ونصائح ذهبية]
---ENHANCED_PROMPT_VERSION_END---`;

    const userPrompt = `حول الفكرة التالية إلى أمر برومبت بروتوكولي بالخيارين (أ) و (ب) المحددين ومغلفين تماماً بالملصقات المقررة:
الفكرة/المفهوم: "${rawConcept}"
النموذج المستهدف: "${safeModel}"
نبرة الصوت: "${tone || 'مهني واحترافي'}"
التصنيف: "${category || 'general'}"
لغة الإخراج المطلوبة: "${language || 'en'}"
${useClarificationLoop ? 'مع تفعيل نمط الاستيضاح والأسئلة الاستكشافية التفاعلية.' : ''}`;

    const originalRegex = /---ORIGINAL_PROMPT_VERSION---([\s\S]*?)---ORIGINAL_PROMPT_VERSION_END---/;
    const enhancedRegex = /---ENHANCED_PROMPT_VERSION---([\s\S]*?)---ENHANCED_PROMPT_VERSION_END---/;

    const response = await generateContentWithQuotaResilience({
      model: safeModel,
      contents: userPrompt,
      config: {
        systemInstruction,
        temperature: 0.7,
      },
    });

    const textResult = response.text || '';
    const originalMatch = textResult.match(originalRegex);
    const enhancedMatch = textResult.match(enhancedRegex);

    const originalPrompt = originalMatch ? originalMatch[1].trim() : `\`\`\`\n${rawConcept}\n\`\`\``;
    const enhancedPrompt = enhancedMatch ? enhancedMatch[1].trim() : textResult;

    return res.json({
      optimizedPrompt: attachSiteBrandUrl(enhancedPrompt),
      originalPrompt: attachSiteBrandUrl(originalPrompt),
      enhancedPrompt: attachSiteBrandUrl(enhancedPrompt),
      isBilingualChoice: true
    });
  } catch (error: any) {
    console.error('[Cloud Function] Error in /generate-prompt:', error);
    return res.status(500).json({
      error: error?.message || 'Failed to generate prompt'
    });
  }
});

// 2. Refine Prompt Endpoint
app.post('/refine-prompt', async (req: Request, res: Response) => {
  try {
    const { draftPrompt, refinementGoal } = req.body;
    if (!draftPrompt || typeof draftPrompt !== 'string') {
      return res.status(400).json({ error: 'Draft prompt is required' });
    }

    const systemInstruction = `You are a high-performance prompt engineering refinement specialist.
Analyze the user's draft prompt, enforce logical structure, persona, clear system rules, and negative constraints.
Provide the improved prompt in English in a clean markdown code block, followed by an explanation in Arabic of what was upgraded and why.`;

    const userPrompt = `Draft prompt to refine:\n\`\`\`\n${draftPrompt}\n\`\`\`\nRefinement goal: "${refinementGoal || 'Upgrade structure and output precision.'}"`;

    const response = await generateContentWithQuotaResilience({
      model: 'gemini-3.8-flash',
      contents: userPrompt,
      config: {
        systemInstruction,
        temperature: 0.6,
      },
    });

    return res.json({
      refinedPrompt: attachSiteBrandUrl(response.text || 'Error in refinement.')
    });
  } catch (error: any) {
    console.error('[Cloud Function] Error in /refine-prompt:', error);
    return res.status(500).json({
      error: error?.message || 'Failed to refine prompt'
    });
  }
});

// 3. Translate Prompt Endpoint
app.post('/translate-prompt', async (req: Request, res: Response) => {
  try {
    const { arabicPrompt } = req.body;
    if (!arabicPrompt || typeof arabicPrompt !== 'string') {
      return res.status(400).json({ error: 'Arabic prompt is required' });
    }

    const systemInstruction = `You are a specialized bilingual prompt engineering translator.
Translate Arabic concepts and prompts into top-tier, highly structured English prompts using prompt engineering best practices (e.g., Act as..., Objectives, Constraints, Output Format).`;

    const response = await generateContentWithQuotaResilience({
      model: 'gemini-3.8-flash',
      contents: `Translate and engineer this Arabic prompt into English prompt standards:\n\n${arabicPrompt}`,
      config: {
        systemInstruction,
        temperature: 0.5,
      },
    });

    return res.json({
      translatedPrompt: attachSiteBrandUrl(response.text || 'Error in translation.')
    });
  } catch (error: any) {
    console.error('[Cloud Function] Error in /translate-prompt:', error);
    return res.status(500).json({
      error: error?.message || 'Failed to translate prompt'
    });
  }
});

// 4. Reverse Prompt (Vision Analysis) Endpoint
app.post('/reverse-prompt', async (req: Request, res: Response) => {
  try {
    const { image, mimeType, targetStyle, notes } = req.body;
    if (!image || typeof image !== 'string') {
      return res.status(400).json({ error: 'Image base64 data is required' });
    }

    let base64Data = image;
    if (image.includes(';base64,')) {
      base64Data = image.split(';base64,')[1];
    }
    const cleanMimeType = mimeType || 'image/jpeg';

    const systemInstruction = `You are a Visual DNA & Reverse Prompt Engineering Specialist.
Analyze the provided image and extract:
1. Exact Color Palette (4-5 Hex codes)
2. Artistic medium, camera lenses, lighting physics, composition, mood, and textures.
3. Master English Generation Prompt (for Midjourney / FLUX) in a code block.
4. Arabic architectural breakdown.`;

    const parts = [
      {
        inlineData: {
          mimeType: cleanMimeType,
          data: base64Data,
        },
      },
      {
        text: `Analyze this image and extract its complete visual DNA. ${notes ? `Guidance: ${notes}` : ''} ${targetStyle ? `Target Style: ${targetStyle}` : ''}`
      }
    ];

    const response = await generateContentWithQuotaResilience({
      model: 'gemini-3.8-flash',
      contents: { parts },
      config: {
        systemInstruction,
        temperature: 0.6,
      },
    });

    const rawText = response.text || '';
    const hexMatches = rawText.match(/#[0-9A-Fa-f]{6}\b/g);
    const uniqueHexColors = hexMatches ? Array.from(new Set(hexMatches)).slice(0, 5) : [];

    const codeBlockMatch = rawText.match(/```(?:[a-zA-Z]*)\n([\s\S]*?)```/);
    const masterPrompt = codeBlockMatch ? codeBlockMatch[1].trim() : '';

    return res.json({
      reversePrompt: attachSiteBrandUrl(rawText),
      learnedDna: {
        palette: uniqueHexColors.length > 0 ? uniqueHexColors : ['#1E293B', '#D97706', '#3B82F6', '#F8FAFC'],
        medium: targetStyle || 'Cinematic High-Fidelity Render',
        hasLearned: true,
        masterPrompt
      }
    });
  } catch (error: any) {
    console.error('[Cloud Function] Error in /reverse-prompt:', error);
    return res.status(500).json({
      error: error?.message || 'Failed to analyze image'
    });
  }
});

// 5. Suggest Tags Endpoint
app.post('/suggest-tags', async (req: Request, res: Response) => {
  try {
    const { promptText, category, model } = req.body;
    if (!promptText || typeof promptText !== 'string') {
      return res.status(400).json({ error: 'Prompt text is required' });
    }

    const cleanPrompt = promptText.trim().substring(0, 2000);
    const response = await generateContentWithQuotaResilience({
      model: 'gemini-3.8-flash',
      contents: `Analyze this prompt and suggest 4-6 relevant tags:\nCategory: ${category || 'general'}\nModel: ${model || 'all'}\n\nPrompt:\n"${cleanPrompt}"`,
      config: {
        systemInstruction: 'Return strictly a JSON array of 4-6 strings without hash symbol: ["tag1", "tag2", "tag3"]',
        temperature: 0.3,
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.STRING,
          },
        },
      },
    });

    let tags: string[] = [];
    try {
      const parsed = JSON.parse(response.text || '[]');
      if (Array.isArray(parsed)) {
        tags = parsed.map((t: any) => String(t).trim().replace(/^#+/, '')).filter(Boolean);
      }
    } catch {
      tags = ['برومبت_احترافي', 'هندسة_الأوامر', 'توليد_ذكي'];
    }

    return res.json({ tags });
  } catch (error: any) {
    console.error('[Cloud Function] Error in /suggest-tags:', error);
    return res.status(500).json({
      error: error?.message || 'Failed to suggest tags'
    });
  }
});

// 6. Cinema Storyboard Generator (Scene Breakdown & Consistency Anchor)
app.post('/cinema-generate-story', async (req: Request, res: Response) => {
  try {
    const {
      concept,
      genre = 'خيال علمي وإثارة',
      visualStyle = 'Cinematic 35mm Film',
      targetAiModel = 'Kling 1.5',
      sceneCount = 4,
      characterName,
      characterFeature
    } = req.body;

    if (!concept || typeof concept !== 'string') {
      return res.status(400).json({ error: 'Movie concept is required' });
    }

    const cleanConcept = concept.trim();
    const count = Math.max(3, Math.min(8, Number(sceneCount) || 4));

    const systemInstruction = `You are an AI Film Screenwriter.
Convert the given concept into a cinematic screenplay with ${count} sequential 10-second scenes.
Return JSON with titleAr, titleEn, loglineAr, characterAnchor (with consistencyPromptToken), and scenes array.`;

    const response = await generateContentWithQuotaResilience({
      model: 'gemini-3.8-flash',
      contents: `Movie Concept: "${cleanConcept}"\nGenre: "${genre}"\nVisual Style: "${visualStyle}"\nTarget Platform: "${targetAiModel}"\nCharacter: ${characterName || 'Hero'} (${characterFeature || 'cinematic facial symmetry'})`,
      config: {
        systemInstruction,
        temperature: 0.7,
        responseMimeType: 'application/json'
      }
    });

    const parsed = JSON.parse(response.text || '{}');
    return res.json({
      success: true,
      ...parsed
    });
  } catch (error: any) {
    console.error('[Cloud Function] Error in /cinema-generate-story:', error);
    return res.status(500).json({
      error: error?.message || 'Failed to generate cinematic story'
    });
  }
});

// Export unified Express Cloud Function (v2)
export const api = onRequest(
  {
    cors: true,
    secrets: [geminiApiKeySecret],
    memory: '512MiB',
    timeoutSeconds: 60,
  },
  app
);

// Also export standalone micro-function endpoints for granular deployment if desired
export const generatePrompt = onRequest(
  { cors: true, secrets: [geminiApiKeySecret], timeoutSeconds: 60 },
  (req, res) => app(req, res)
);

export const refinePrompt = onRequest(
  { cors: true, secrets: [geminiApiKeySecret], timeoutSeconds: 60 },
  (req, res) => app(req, res)
);

export const translatePrompt = onRequest(
  { cors: true, secrets: [geminiApiKeySecret], timeoutSeconds: 60 },
  (req, res) => app(req, res)
);

export const reversePrompt = onRequest(
  { cors: true, secrets: [geminiApiKeySecret], memory: '1GiB', timeoutSeconds: 60 },
  (req, res) => app(req, res)
);

export const suggestTags = onRequest(
  { cors: true, secrets: [geminiApiKeySecret], timeoutSeconds: 30 },
  (req, res) => app(req, res)
);

export const cinemaGenerateStory = onRequest(
  { cors: true, secrets: [geminiApiKeySecret], memory: '512MiB', timeoutSeconds: 60 },
  (req, res) => app(req, res)
);
