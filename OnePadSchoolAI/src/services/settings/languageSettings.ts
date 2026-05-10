import AsyncStorage from '@react-native-async-storage/async-storage';

export type LanguageSettings = {
  appUiLanguage: 'english' | 'vietnamese' | 'system_default';
  learningContentLanguage: 'english' | 'vietnamese' | 'same_as_lesson';
  aiTutorResponseLanguage: 'english' | 'vietnamese' | 'same_as_student_question';
  speechUnderstandingPreference: 'auto' | 'same_as_ai_tutor_response' | 'same_as_learning_content';
};

const KEY = 'onepad.language.learning.settings';

const DEFAULT_SETTINGS: LanguageSettings = {
  appUiLanguage: 'english',
  learningContentLanguage: 'same_as_lesson',
  aiTutorResponseLanguage: 'same_as_student_question',
  speechUnderstandingPreference: 'auto'
};

export async function getLanguageSettings(): Promise<LanguageSettings> {
  try {
    const raw = await AsyncStorage.getItem(KEY);
    if (!raw) return DEFAULT_SETTINGS;
    return { ...DEFAULT_SETTINGS, ...(JSON.parse(raw) as Partial<LanguageSettings>) };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export async function setLanguageSettings(next: LanguageSettings): Promise<void> {
  await AsyncStorage.setItem(KEY, JSON.stringify(next));
}
