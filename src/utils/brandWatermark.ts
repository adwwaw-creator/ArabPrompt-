/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export const ARAB_PROMPT_SITE_URL = 'https://arabiprompt.ai.studio';

/**
 * Embeds and injects the platform site link (https://arabiprompt.ai.studio)
 * directly into every generated prompt, including inside markdown code blocks and as a signature.
 */
export function appendSiteUrlToPrompt(promptText: string): string {
  if (!promptText || typeof promptText !== 'string') return promptText;
  
  let result = promptText.trim();
  const siteUrl = ARAB_PROMPT_SITE_URL;

  // 1. Embed inside any code blocks ``` ... ```
  if (result.includes('```')) {
    result = result.replace(/```([a-zA-Z0-9_-]*)\n([\s\S]*?)```/g, (match, codeLang, codeBody) => {
      if (!codeBody.includes('arabiprompt.ai.studio')) {
        const cleanBody = codeBody.trimEnd();
        return `\`\`\`${codeLang}\n${cleanBody}\n\n# Source & Engineered via: ${siteUrl}\n\`\`\``;
      }
      return match;
    });
  }

  // 2. Ensure bottom signature is present
  if (!result.includes('https://arabiprompt.ai.studio')) {
    result += `\n\n---\n🔗 تم التوليد عبر منصة عرب برومبت: ${siteUrl}\nGenerated with ArabPrompt: ${siteUrl}`;
  } else if (!result.includes('🔗 تم التوليد عبر منصة عرب برومبت')) {
    result += `\n\n---\n🔗 تم التوليد عبر منصة عرب برومبت: ${siteUrl}\nGenerated with ArabPrompt: ${siteUrl}`;
  }

  return result;
}
