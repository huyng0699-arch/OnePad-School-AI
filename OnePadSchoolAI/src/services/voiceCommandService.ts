import { generateAiResponse } from './ai/aiClient';
import { buildVoiceCommandPrompt } from './ai/aiPromptBuilder';
import { buildAiContext } from './aiContextBuilder';
import { VOICE_ACTION_ALLOWLIST, matchVoiceLocalCommand, type VoiceCommandAction, type VoiceCommandResult } from './voiceLocalCommandMatcher';

type InterpretInput = {
  transcript: string;
  currentScreen: string;
  currentLessonTitle?: string;
  currentPageNumber?: number;
};

export async function interpretTranscript(input: InterpretInput): Promise<VoiceCommandResult> {
  const normalized = input.transcript.trim();
  const local = matchVoiceLocalCommand(normalized);
  if (local.matched) {
    return local.command;
  }

  const prompt = buildVoiceCommandPrompt({
    transcript: normalized,
    currentScreen: input.currentScreen,
    lessonTitle: input.currentLessonTitle,
    pageNumber: input.currentPageNumber,
    availableActions: VOICE_ACTION_ALLOWLIST
  });

  const context = buildAiContext({
    action: 'voice_command',
    contextMode: 'intent',
    selectedText: JSON.stringify({
      transcript: normalized,
      currentScreen: input.currentScreen,
      currentLessonTitle: input.currentLessonTitle,
      currentPageNumber: input.currentPageNumber,
      availableActions: VOICE_ACTION_ALLOWLIST
    })
  });

  const result = await generateAiResponse({
    action: 'voice_command',
    contextMode: 'intent',
    prompt,
    contextText: context.contextText,
    userText: normalized,
    metadata: context.metadata
  });

  if (!result.ok) {
    return unknownCommand(normalized, result.error);
  }

  return parseVoiceCommandResult(result.text ?? '', normalized);
}

function parseVoiceCommandResult(rawText: string, spokenText: string): VoiceCommandResult {
  const jsonText = extractJsonObject(unwrapJson(rawText));
  try {
    const parsed = JSON.parse(jsonText) as Partial<VoiceCommandResult>;
    const action = (parsed.action ?? 'unknown') as VoiceCommandAction;
    const confidence = clamp(typeof parsed.confidence === 'number' ? parsed.confidence : 0.3, 0, 1);
    if (!VOICE_ACTION_ALLOWLIST.includes(action)) {
      return unknownCommand(spokenText, 'Unknown action from AI router.');
    }
    return {
      action,
      confidence,
      spokenText: typeof parsed.spokenText === 'string' ? parsed.spokenText : spokenText,
      target: typeof parsed.target === 'string' ? parsed.target : null,
      params: typeof parsed.params === 'object' && parsed.params ? parsed.params as Record<string, unknown> : {},
      confirmation: typeof parsed.confirmation === 'string'
        ? parsed.confirmation
        : 'I am not sure what you want to do. Please try again.',
      source: 'ai'
    };
  } catch {
    return unknownCommand(spokenText, 'Unable to parse voice command.');
  }
}

function unwrapJson(rawText: string): string {
  const trimmed = rawText.trim();
  if (!trimmed.startsWith('```')) {
    return trimmed;
  }
  return trimmed.replace(/^```json\s*/i, '').replace(/^```\s*/i, '').replace(/\s*```$/i, '').trim();
}

function extractJsonObject(rawText: string): string {
  const trimmed = rawText.trim();
  if (trimmed.startsWith('{') && trimmed.endsWith('}')) {
    return trimmed;
  }
  const start = trimmed.indexOf('{');
  const end = trimmed.lastIndexOf('}');
  if (start >= 0 && end > start) {
    return trimmed.slice(start, end + 1).trim();
  }
  return trimmed;
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

function unknownCommand(spokenText: string, error?: string): VoiceCommandResult {
  return {
    action: 'unknown',
    confidence: 0.3,
    spokenText,
    target: null,
    params: {},
    confirmation: error ?? 'I am not sure what you want to do. Please try again.',
    source: 'ai'
  };
}
