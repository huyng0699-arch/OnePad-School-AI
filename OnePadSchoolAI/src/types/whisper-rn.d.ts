declare module 'whisper.rn' {
  export type TranscribeResult = {
    result: string;
    language: string;
    segments: Array<{ text: string; t0: number; t1: number }>;
    isAborted: boolean;
  };

  export type TranscribeRealtimeEvent = {
    isCapturing: boolean;
    isStoppedByAction?: boolean;
    code: number;
    data?: TranscribeResult;
    slices?: Array<{
      data?: TranscribeResult;
      code?: number;
      error?: string;
      processTime?: number;
      recordingTime?: number;
    }>;
    error?: string;
    processTime: number;
    recordingTime: number;
  };

  export type TranscribeRealtimeOptions = {
    language?: string;
    translate?: boolean;
    maxThreads?: number;
    maxLen?: number;
    realtimeAudioSec?: number;
    realtimeAudioSliceSec?: number;
    realtimeAudioMinSec?: number;
  };

  export type WhisperContext = {
    transcribe: (filePathOrBase64: string, options?: Record<string, unknown>) => Promise<TranscribeResult>;
    transcribeRealtime: (options?: TranscribeRealtimeOptions) => Promise<{
      stop: () => Promise<void>;
      subscribe: (callback: (event: TranscribeRealtimeEvent) => void) => void;
    }>;
    release: () => Promise<void>;
  };

  export function initWhisper(options: { filePath: string | number; isBundleAsset?: boolean }): Promise<WhisperContext>;
}
