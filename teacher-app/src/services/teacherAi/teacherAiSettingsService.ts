export type TeacherAiProvider = "school_default" | "personal_gemini" | "local_cactus";

export type TeacherAiSettings = {
  provider: TeacherAiProvider;
  modelId: string;
  personalApiKeyMasked?: string;
  hasPersonalApiKey: boolean;
};

const KEY = "onepad_teacher_ai_settings_v1";
const KEY_RAW = "onepad_teacher_ai_personal_key_v1";

const DEFAULT_SETTINGS: TeacherAiSettings = {
  provider: "school_default",
  modelId: "gemini-2.5-flash",
  hasPersonalApiKey: false,
};

function mask(key: string): string {
  if (key.length < 8) return "****";
  return `${key.slice(0, 4)}...${key.slice(-4)}`;
}

export const teacherAiSettingsService = {
  load(): TeacherAiSettings {
    if (typeof window === "undefined") return DEFAULT_SETTINGS;
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return DEFAULT_SETTINGS;
    try {
      const parsed = JSON.parse(raw) as TeacherAiSettings;
      return { ...DEFAULT_SETTINGS, ...parsed };
    } catch {
      return DEFAULT_SETTINGS;
    }
  },

  save(settings: Omit<TeacherAiSettings, "hasPersonalApiKey" | "personalApiKeyMasked">, personalApiKey?: string) {
    if (typeof window === "undefined") return DEFAULT_SETTINGS;
    if (personalApiKey && personalApiKey.trim()) {
      window.localStorage.setItem(KEY_RAW, personalApiKey.trim());
    }
    const storedKey = window.localStorage.getItem(KEY_RAW) || "";
    const merged: TeacherAiSettings = {
      ...settings,
      hasPersonalApiKey: Boolean(storedKey),
      personalApiKeyMasked: storedKey ? mask(storedKey) : undefined,
    };
    window.localStorage.setItem(KEY, JSON.stringify(merged));
    return merged;
  },

  getPersonalApiKey() {
    if (typeof window === "undefined") return "";
    return window.localStorage.getItem(KEY_RAW) || "";
  },

  reset() {
    if (typeof window === "undefined") return DEFAULT_SETTINGS;
    window.localStorage.removeItem(KEY);
    window.localStorage.removeItem(KEY_RAW);
    return DEFAULT_SETTINGS;
  },
};
