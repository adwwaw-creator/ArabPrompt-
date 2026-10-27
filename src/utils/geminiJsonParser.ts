/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Universal safe JSON parser for Gemini AI outputs and fetch responses.
 * Prevents "JSON.parse: unexpected character at line 2 column 1 of the JSON data"
 * by cleaning markdown code fences, handling surrounding conversational text,
 * stripping trailing commas, and providing fallback structure validation.
 */

export interface SafeParseResult<T = any> {
  success: boolean;
  data: T | null;
  error: string | null;
  rawInput?: string;
  isFallback?: boolean;
}

export interface SafeFetchResult<T = any> {
  ok: boolean;
  status: number;
  data: T | null;
  error: string | null;
  rawText?: string;
}

/**
 * Robustly parses JSON from LLM outputs that may contain markdown or commentary.
 */
export function safeParseGeminiJSON<T = any>(
  rawText: string | null | undefined,
  fallbackValue: T | null = null,
  validator?: (data: any) => boolean
): SafeParseResult<T> {
  if (!rawText || typeof rawText !== 'string' || !rawText.trim()) {
    return {
      success: false,
      data: fallbackValue,
      error: 'Empty or undefined input string',
      rawInput: rawText || ''
    };
  }

  let text = rawText.trim();

  // 1. Remove markdown code blocks ```json ... ``` or ``` ... ```
  if (text.includes('```')) {
    // Check for ```json ... ```
    const jsonBlockRegex = /```(?:json)?\s*([\s\S]*?)\s*```/i;
    const match = text.match(jsonBlockRegex);
    if (match && match[1]) {
      text = match[1].trim();
    }
  }

  // 2. If the text has preamble or postscript (e.g. "Here is the JSON:\n[ ... ]"),
  // find the boundary between the first '{' or '[' and the last '}' or ']'.
  const firstCurly = text.indexOf('{');
  const firstSquare = text.indexOf('[');
  let startIndex = -1;

  if (firstCurly !== -1 && firstSquare !== -1) {
    startIndex = Math.min(firstCurly, firstSquare);
  } else if (firstCurly !== -1) {
    startIndex = firstCurly;
  } else if (firstSquare !== -1) {
    startIndex = firstSquare;
  }

  if (startIndex !== -1) {
    const isArray = text[startIndex] === '[';
    const endIndex = isArray ? text.lastIndexOf(']') : text.lastIndexOf('}');
    if (endIndex > startIndex) {
      text = text.substring(startIndex, endIndex + 1).trim();
    }
  }

  // 3. Attempt direct parse
  try {
    const parsed = JSON.parse(text);
    if (validator && !validator(parsed)) {
      return {
        success: false,
        data: fallbackValue,
        error: 'Schema validation failed for parsed JSON',
        rawInput: rawText
      };
    }
    return {
      success: true,
      data: parsed as T,
      error: null,
      rawInput: rawText
    };
  } catch (err: any) {
    // 4. Try lenient fixes: remove trailing commas before } or ]
    try {
      const sanitized = text
        .replace(/,\s*([}\]])/g, '$1') // remove trailing commas
        .replace(/[\u201C\u201D]/g, '"') // replace curly quotes with straight quotes
        .replace(/[\u2018\u2019]/g, "'");

      const parsed = JSON.parse(sanitized);
      if (validator && !validator(parsed)) {
        return {
          success: false,
          data: fallbackValue,
          error: 'Schema validation failed for sanitized JSON',
          rawInput: rawText
        };
      }
      return {
        success: true,
        data: parsed as T,
        error: null,
        rawInput: rawText
      };
    } catch (secondErr: any) {
      return {
        success: false,
        data: fallbackValue,
        error: secondErr?.message || 'JSON parsing failed',
        rawInput: rawText
      };
    }
  }
}

/**
 * Safely parses any fetch Response object without crashing on HTML 500 / 502 / 403 error pages.
 */
export async function safeParseFetchResponse<T = any>(
  response: Response,
  lang: string = 'ar'
): Promise<SafeFetchResult<T>> {
  const isAr = lang === 'ar';
  const status = response.status;

  let rawText = '';
  try {
    rawText = await response.text();
  } catch (e: any) {
    return {
      ok: false,
      status,
      data: null,
      error: isAr ? 'فشلت قراءة رد الخادم.' : 'Failed to read response stream.',
      rawText: ''
    };
  }

  // Attempt to parse JSON safely
  const parseResult = safeParseGeminiJSON<T>(rawText);

  // If HTTP status is not ok (4xx or 5xx)
  if (!response.ok) {
    let friendlyError = '';

    // If backend returned a structured error JSON
    if (parseResult.success && parseResult.data && typeof parseResult.data === 'object' && (parseResult.data as any).error) {
      friendlyError = String((parseResult.data as any).error);
    } else {
      switch (status) {
        case 400:
          friendlyError = isAr ? 'طلب غير صالح، يرجى التحقق من المدخلات.' : 'Bad request, please verify your input.';
          break;
        case 401:
        case 403:
          friendlyError = isAr 
            ? 'خطأ في المصادقة أو صلاحيات مفتاح API. تم تفعيل الوضع التوليدي المحلي الآمن تلقائياً.' 
            : 'Authentication or quota issue. Local resilient generator activated.';
          break;
        case 429:
          friendlyError = isAr 
            ? 'تم تجاوز حد الاستهلاك المسموح حالياً. يمكنك الترقية أو الانتظار قليلاً.' 
            : 'Rate limit exceeded. Please wait or upgrade your plan.';
          break;
        case 500:
        case 502:
        case 503:
        case 504:
          friendlyError = isAr 
            ? 'الخادم السحابي مشغول حالياً. تم الاعتماد على المعالج المحلي لتأمين مخرجاتك فوراً.' 
            : 'Cloud server busy. Local resilient fallback engaged to deliver your output.';
          break;
        default:
          friendlyError = isAr 
            ? `حدث خطأ أثناء المعالجة (رمز: ${status}).` 
            : `Server returned error status (${status}).`;
      }
    }

    return {
      ok: false,
      status,
      data: parseResult.data,
      error: friendlyError,
      rawText
    };
  }

  // Response was 200 OK
  if (!parseResult.success) {
    // If 200 OK but body is not JSON, check if it's raw text
    return {
      ok: true,
      status,
      data: (rawText as unknown) as T,
      error: null,
      rawText
    };
  }

  return {
    ok: true,
    status,
    data: parseResult.data,
    error: null,
    rawText
  };
}
