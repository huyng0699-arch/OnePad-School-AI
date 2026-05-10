import AsyncStorage from '@react-native-async-storage/async-storage';
import type { VoiceEngine } from './voiceTypes';

const KEY = 'onepad.voice.engine';

export async function getSelectedVoiceEngine(): Promise<VoiceEngine> {
  try {
    const raw = await AsyncStorage.getItem(KEY);
    if (raw === 'gemma_audio' || raw === 'whisper_transcription') return raw;
  } catch {
    // ignore
  }
  return 'gemma_audio';
}

export async function setSelectedVoiceEngine(engine: VoiceEngine): Promise<void> {
  await AsyncStorage.setItem(KEY, engine);
}
