import * as assert from "node:assert/strict";
import { PrismaClient } from "../node_modules/.prisma/client";
import { PermissionService } from "../src/modules/authz/permission.service";
import { StudentTrendsService } from "../src/modules/student-trends/student-trends.service";

async function run() {
  const prisma = new PrismaClient();
  await prisma.$connect();
  const authz = new PermissionService(prisma as any);
  const trends = new StudentTrendsService(
    prisma as any,
    authz,
    { generateText: async () => ({ ok: false, text: "" }) } as any,
  );

  const students = await prisma.student.findMany({ take: 3, orderBy: { id: "asc" } });
  assert.equal(students.length >= 3, true);

  const evalResult = await trends.evaluateAndSave(students[0].id, "live_backend");
  assert.equal(evalResult.ok, true);

  const latest = await trends.getLatest(students[0].id);
  assert.equal(latest.ok, true);
  assert.equal(!!latest.packet, true);

  const parentActor = { userId: "parent_001", role: "parent" };
  const report: any = await trends.getParentTrendReport("stu_003", parentActor);
  assert.equal(report.ok, true);
  assert.equal(typeof report.source, "string");
  assert.equal(typeof report.provider, "string");
  assert.equal(!!report.categoryBreakdown?.physical, true);
  assert.equal(!!report.categoryBreakdown?.wellbeing, true);
  assert.equal(!!report.categoryBreakdown?.learning, true);
  assert.equal(!!report.categoryBreakdown?.conversation, true);
  assert.equal(!!report.categoryBreakdown?.teacherParent, true);
  assert.equal(Array.isArray(report.chart), true);

  const chart: any = await trends.getParentTrendChart("stu_003", parentActor, 14);
  assert.equal(chart.ok, true);
  assert.equal(Array.isArray(chart.points), true);
  assert.equal(chart.points.length >= 1, true);

  const teacherActor = { userId: "teacher_001", role: "subject_teacher" };
  const queue: any = await trends.getTeacherSupportQueue(teacherActor);
  assert.equal(queue.ok, true);
  assert.equal(Array.isArray(queue.queue), true);

  const adminActor = { userId: "admin_001", role: "school_admin" };
  const overview: any = await trends.getAdminTrendOverview("school_001", adminActor);
  assert.equal(overview.ok, true);
  assert.equal(typeof overview.countsByLevel, "object");
  assert.equal(typeof overview.countsByLevel.red, "number");

  const beforeAudit = await prisma.accessAuditLog.count();
  const detail: any = await trends.getAdminTrendDetail("stu_003", adminActor);
  assert.equal(detail.ok, true);
  const afterAudit = await prisma.accessAuditLog.count();
  assert.equal(afterAudit > beforeAudit, true);

  const seedStudents = await prisma.student.findMany({
    where: { id: { in: ["stu_001", "stu_002", "stu_003"] } },
  });
  assert.equal(seedStudents.length, 3);

  await prisma.$disconnect();
  console.log("student-trends test passed");
}

run().catch(async (error) => {
  console.error("test-trends failed:", error);
  process.exit(1);
});
