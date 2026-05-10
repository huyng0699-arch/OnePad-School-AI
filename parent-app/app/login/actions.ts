"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

function setCookie(name: string, value: string) {
  cookies().set(name, value || "", {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });
}

export async function selectParentLogin(formData: FormData) {
  setCookie("onepad_parent_id", String(formData.get("parentId") || ""));
  setCookie("onepad_parent_name", String(formData.get("parentName") || ""));
  setCookie("onepad_student_id", String(formData.get("studentId") || ""));
  setCookie("onepad_student_name", String(formData.get("studentName") || ""));
  setCookie("onepad_class_name", String(formData.get("className") || ""));
  setCookie("onepad_school_name", String(formData.get("schoolName") || ""));
  redirect("/");
}

export async function signOutParent() {
  for (const name of ["onepad_parent_id", "onepad_parent_name", "onepad_student_id", "onepad_student_name", "onepad_class_name", "onepad_school_name"]) {
    cookies().delete(name);
  }
  redirect("/login");
}
