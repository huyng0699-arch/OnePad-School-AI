import { class8AStudents } from "./demoData";

export function average(values: number[]) {
  return Math.round(values.reduce((sum, value) => sum + value, 0) / Math.max(values.length, 1));
}

export function masteryTone(value: number) {
  if (value >= 78) return "teal";
  if (value >= 65) return "";
  if (value >= 55) return "amber";
  return "red";
}

export function teacherSnapshot() {
  return {
    masteryAverage: average(class8AStudents.map((s) => s.biologyMastery)),
    needsReview: class8AStudents.filter((s) => s.biologyMastery < 65 || s.missingAssignments > 2).length,
    supportOpen: class8AStudents.filter((s) => s.supportSignals > 0).length,
    presentToday: class8AStudents.filter((s) => s.attendance === "Present").length,
  };
}

