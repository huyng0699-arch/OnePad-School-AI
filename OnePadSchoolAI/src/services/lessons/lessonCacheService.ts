import AsyncStorage from "@react-native-async-storage/async-storage";

const key = (lessonId: string) => `published_lesson_${lessonId}`;

export async function saveLesson(lesson: any) {
  if (!lesson?.id) return;
  await AsyncStorage.setItem(key(lesson.id), JSON.stringify(lesson));
}

export async function getLesson(lessonId: string) {
  const raw = await AsyncStorage.getItem(key(lessonId));
  return raw ? JSON.parse(raw) : null;
}
