import { processCloudAudioSegment } from './cloudAudioService';
import { getGemmaAudioStatus, processAudioSegment } from './cactusGemmaAudioService';
import { inferIntentFromTranscript } from './voiceCommandRouter';
import type { AudioSegment, VoiceCommandResult, VoiceEngine, VoiceTurnContext, VoiceUnderstandingResult } from './voiceTypes';
import { checkModelStatus } from './whisperModelDownloadService';
import { listenWithWhisperOnce } from '../whisperVoiceService';

type PipelineInput = {
  engine: VoiceEngine;
  segment?: AudioSegment;
  context: VoiceTurnContext;
};

export async function understandVoiceTurn(input: PipelineInput): Promise<VoiceUnderstandingResult> {
  const startedAt = Date.now();

  if (input.engine === 'whisper_transcription') {
    const status = await checkModelStatus();
    if (status !== 'ready') {
      throw new Error('Whisper model is not downloaded.');
    }

    const listen = await listenWithWhisperOnce(9000);
    if (!listen.ok || !listen.transcript?.trim()) {
      throw new Error(listen.message ?? 'Whisper did not hear a usable transcript.');
    }

    return {
      transcript: listen.transcript.trim(),
      source: 'whisper_transcription',
      latencyMs: Date.now() - startedAt,
      language: listen.language
    };
  }

  if (!input.segment) {
    throw new Error('This voice engine needs a captured audio segment, but no audio file was provided.');
  }

  if (input.engine === 'gemma_audio') {
    if (getGemmaAudioStatus() !== 'ready') {
      throw new Error('Local AI audio understanding is not available in this build.');
    }
    const directCommand = await processAudioSegment(input.segment);
    return {
      transcript: directCommand.transcript,
      source: 'gemma_audio',
      confidence: directCommand.confidence,
      latencyMs: Date.now() - startedAt,
      directCommand
    };
  }

  return processCloudAudioSegment(input.segment);
}

export async function resolveVoiceCommand(understanding: VoiceUnderstandingResult, context: VoiceTurnContext): Promise<VoiceCommandResult> {
  if (understanding.directCommand) {
    return understanding.directCommand;
  }

  return inferIntentFromTranscript(
    understanding.transcript,
    context.currentScreen,
    context.currentLessonTitle,
    context.currentPageNumber
  );
}
