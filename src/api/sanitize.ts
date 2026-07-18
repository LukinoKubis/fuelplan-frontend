// Prompt-injection-safe sanitization for free-text survey inputs (diet prefs,
// disliked foods, cuisines) before they're interpolated into the Claude
// prompt. Ported as-is from the old app.js — same patterns, same behavior.
const INJECTION_PATTERNS: RegExp[] = [
  /ignore\s+(all\s+)?(previous|above|prior|earlier)\s+instructions?/gi,
  /forget\s+(all\s+)?(previous|above|prior|earlier)/gi,
  /disregard\s+(all\s+)?(previous|above|prior|earlier)/gi,
  /you\s+are\s+now/gi,
  /act\s+as\s+(a\s+)?(?!meal|nutritionist|chef)/gi,
  /pretend\s+(you\s+are|to\s+be)/gi,
  /system\s*prompt/gi,
  /reveal\s+(your|the)\s+(system|prompt|instructions?|key|code)/gi,
  /print\s+(your|the)\s+(system|prompt|instructions?)/gi,
  /what\s+(are|is)\s+your\s+instructions?/gi,
  /return\s+(your|the)\s+(system|prompt|api)/gi,
  /\bjailbreak\b/gi,
  /\bdan\b.*\bmode\b/gi,
  /activation\s*code/gi,
  /api\s*key/gi,
]

export function sanitizeInput(str: string | null | undefined): string {
  if (!str) return ''
  let s = str.slice(0, 200)
  for (const pattern of INJECTION_PATTERNS) {
    s = s.replace(pattern, '[removed]')
  }
  // Only allow food-relevant characters: letters, numbers, spaces, commas, hyphens, slashes, parentheses
  s = s.replace(/[^\w\s,\-/().&']/g, '')
  return s.trim()
}
