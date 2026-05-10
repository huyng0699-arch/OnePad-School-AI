export type DemoRole =
  | "school_admin"
  | "subject_teacher"
  | "homeroom_teacher"
  | "education_guardian"
  | "parent"
  | "student";

export type DemoActor = {
  userId: string;
  role: DemoRole;
};

