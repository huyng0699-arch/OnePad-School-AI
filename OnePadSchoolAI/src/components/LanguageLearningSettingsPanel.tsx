import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { getLanguageSettings, setLanguageSettings, type LanguageSettings } from '../services/settings/languageSettings';

export default function LanguageLearningSettingsPanel() {
  const [settings, setSettings] = React.useState<LanguageSettings | null>(null);

  React.useEffect(() => {
    void getLanguageSettings().then(setSettings);
  }, []);

  const update = async (patch: Partial<LanguageSettings>) => {
    if (!settings) return;
    const next = { ...settings, ...patch };
    setSettings(next);
    await setLanguageSettings(next);
  };

  if (!settings) return null;

  return (
    <View style={styles.card}>
      <Text style={styles.title}>Language & Learning Settings</Text>
      <Text style={styles.meta}>Speech Understanding Preference is a hint for app behavior and prompts. It is not a model package.</Text>

      <Text style={styles.label}>App UI Language</Text>
      <View style={styles.row}>
        <Choice label="English" active={settings.appUiLanguage === 'english'} onPress={() => void update({ appUiLanguage: 'english' })} />
        <Choice label="Vietnamese" active={settings.appUiLanguage === 'vietnamese'} onPress={() => void update({ appUiLanguage: 'vietnamese' })} />
        <Choice label="System default" active={settings.appUiLanguage === 'system_default'} onPress={() => void update({ appUiLanguage: 'system_default' })} />
      </View>

      <Text style={styles.label}>Learning Content Language</Text>
      <View style={styles.row}>
        <Choice label="English" active={settings.learningContentLanguage === 'english'} onPress={() => void update({ learningContentLanguage: 'english' })} />
        <Choice label="Vietnamese" active={settings.learningContentLanguage === 'vietnamese'} onPress={() => void update({ learningContentLanguage: 'vietnamese' })} />
        <Choice label="Same as lesson" active={settings.learningContentLanguage === 'same_as_lesson'} onPress={() => void update({ learningContentLanguage: 'same_as_lesson' })} />
      </View>

      <Text style={styles.label}>AI Tutor Response Language</Text>
      <View style={styles.row}>
        <Choice label="English" active={settings.aiTutorResponseLanguage === 'english'} onPress={() => void update({ aiTutorResponseLanguage: 'english' })} />
        <Choice label="Vietnamese" active={settings.aiTutorResponseLanguage === 'vietnamese'} onPress={() => void update({ aiTutorResponseLanguage: 'vietnamese' })} />
        <Choice label="Same as student question" active={settings.aiTutorResponseLanguage === 'same_as_student_question'} onPress={() => void update({ aiTutorResponseLanguage: 'same_as_student_question' })} />
      </View>

      <Text style={styles.label}>Speech Understanding Preference</Text>
      <View style={styles.row}>
        <Choice label="Auto" active={settings.speechUnderstandingPreference === 'auto'} onPress={() => void update({ speechUnderstandingPreference: 'auto' })} />
        <Choice label="Same as AI Tutor Response Language" active={settings.speechUnderstandingPreference === 'same_as_ai_tutor_response'} onPress={() => void update({ speechUnderstandingPreference: 'same_as_ai_tutor_response' })} />
        <Choice label="Same as Learning Content Language" active={settings.speechUnderstandingPreference === 'same_as_learning_content'} onPress={() => void update({ speechUnderstandingPreference: 'same_as_learning_content' })} />
      </View>
    </View>
  );
}

function Choice({ label, active, onPress }: { label: string; active: boolean; onPress: () => void }) {
  return (
    <Pressable style={[styles.choice, active ? styles.choiceActive : null]} onPress={onPress}>
      <Text style={styles.choiceText}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: { marginTop: 8, borderRadius: 12, backgroundColor: '#fff', padding: 12 },
  title: { color: '#0f172a', fontWeight: '700', fontSize: 16 },
  meta: { marginTop: 6, color: '#475569' },
  label: { marginTop: 10, color: '#334155', fontWeight: '700' },
  row: { flexDirection: 'row', gap: 8, flexWrap: 'wrap', marginTop: 6 },
  choice: { borderWidth: 1, borderColor: '#cbd5e1', borderRadius: 10, paddingVertical: 8, paddingHorizontal: 10 },
  choiceActive: { borderColor: '#2563eb', backgroundColor: '#eff6ff' },
  choiceText: { color: '#0f172a', fontSize: 12 }
});
