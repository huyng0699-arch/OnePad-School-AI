export type NormalizedAiOutput = {
  title?: string;
  paragraphs: string[];
  bullets: string[];
  numbered: string[];
  warning?: string;
  raw: string;
};

const MAX_PARAGRAPH_LENGTH = 420;
const MAX_ITEMS = 8;

export function normalizeAiOutput(rawText: string): NormalizedAiOutput {
  const raw = rawText.trim();
  if (!raw) {
    return { paragraphs: [], bullets: [], numbered: [], raw: '' };
  }

  const withoutFallback = raw.replace(/^Cloud fallback used because Local AI failed\.\s*/i, '').trim();
  const warning = withoutFallback.length === raw.length ? undefined : 'Cloud fallback used because Local AI failed.';
  const cleaned = withoutFallback
    .replace(/\*\*(.*?)\*\*/g, '$1')
    .replace(/__(.*?)__/g, '$1')
    .replace(/`([^`]+)`/g, '$1')
    .replace(/\r/g, '')
    .replace(/[ \t]+\n/g, '\n')
    .trim();

  const lines = cleaned.split('\n').map((line) => line.trim()).filter(Boolean);
  const title = inferTitle(lines);
  const bodyLines = title ? lines.slice(1) : lines;
  const bullets: string[] = [];
  const numbered: string[] = [];
  const paragraphParts: string[] = [];

  for (const line of bodyLines) {
    const bullet = line.match(/^[-*•]\s+(.+)/);
    const number = line.match(/^\d+[.)]\s+(.+)/);
    if (bullet) {
      bullets.push(cleanSentence(bullet[1]));
    } else if (number) {
      numbered.push(cleanSentence(number[1]));
    } else {
      paragraphParts.push(cleanSentence(line));
    }
  }

  return {
    title,
    paragraphs: compactParagraphs(paragraphParts).slice(0, 4),
    bullets: bullets.slice(0, MAX_ITEMS),
    numbered: numbered.slice(0, MAX_ITEMS),
    warning,
    raw
  };
}

export function normalizeAiOutputForSpeech(rawText: string): string {
  const normalized = normalizeAiOutput(rawText);
  const parts = [
    normalized.title,
    ...normalized.paragraphs.slice(0, 2),
    ...normalized.bullets.slice(0, 3),
    ...normalized.numbered.slice(0, 3)
  ].filter(Boolean);
  return parts.join('. ').slice(0, 700);
}

function inferTitle(lines: string[]): string | undefined {
  const first = lines[0];
  if (!first) {
    return undefined;
  }
  if (first.length <= 80 && /summary|breakdown|plan|feedback|lesson|review|tóm tắt|kế hoạch/i.test(first)) {
    return cleanSentence(first.replace(/:$/, ''));
  }
  return undefined;
}

function cleanSentence(text: string): string {
  return text
    .replace(/^\s*[-*•]\s*/, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function compactParagraphs(lines: string[]): string[] {
  const paragraphs: string[] = [];
  let current = '';

  for (const line of lines) {
    const next = current ? `${current} ${line}` : line;
    if (next.length > MAX_PARAGRAPH_LENGTH) {
      if (current) {
        paragraphs.push(current);
      }
      current = line;
    } else {
      current = next;
    }
  }

  if (current) {
    paragraphs.push(current);
  }
  return paragraphs;
}
