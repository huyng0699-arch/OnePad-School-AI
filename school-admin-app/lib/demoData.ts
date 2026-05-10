export type TeacherRole = "subject_teacher" | "homeroom_teacher" | "education_guardian";
export type Student = {
  studentId:string; fullName:string; classId:"class_8a"|"class_8b"|"class_8c"; className:string;
  grade:"8"; currentSubject:"Biology"|"Math"|"Literature"; masteryOverall:number; growthScore:number;
  assignmentResponsibility:number; collaborationScore:number; supportRecoveryScore:number;
  weakestSkill:string; strongestSkill:string; lastActivityAt:string; localAiEvents:number; cloudAiEvents:number;
  supportSignal:"none"|"learning_support"|"wellbeing_support"|"social_support";
  supportSeverityForTeacher:"none"|"low"|"medium"|"high"; safeSummary:string; recommendedAction:string;
  isHomeroomStudent:boolean; educationGuardianAccess:boolean; guardianConsentStatus?:"family_and_school_approved"|"not_granted";
  sensitiveSupportProfile?:{
    medicalSummarySafe:string; psychologicalSupportSummarySafe:string; socialContextSafe:string; supportPlan:string;
    trustedAdultNotes:string[]; accessAuditLog:{actorRole:TeacherRole;actorName:string;reason:string;at:string}[];
  };
};
export type ClassSummary = {classId:"class_8a"|"class_8b"|"class_8c";className:string;grade:"8";homeroomTeacherName:string;studentCount:number;assignmentCompletionRate:number;supportSignalCount:number;localAiReadyRate:number;averageMastery:number};
export type ApiUsageByPerson = {userId:string;displayName:string;role:"student"|"teacher"|"parent"|"admin"|"system";classId?:string;requestCount:number;localAiEvents:number;cloudAiEvents:number;tokenEstimate:number;costEstimate:number;successCount:number;errorCount:number;lastUsedAt:string;keyId:string;modelId:string;quantization?:string;deviceId?:string};
export type RankingItem = {rank:number;studentId:string;fullName:string;className:string;score:number;trend:"up"|"stable"|"down";reason:string};
export type RoleVisibilityPolicy = {role:TeacherRole|"parent"|"school_admin";label:string;canViewClassDashboard:boolean;canViewStudentAcademicReport:boolean;canViewCrossSubjectSummary:boolean;canViewSafeSupportSignal:boolean;canViewSensitiveSupportProfile:boolean;canViewRawPrivateText:boolean;canManageAssignments:boolean;canManageUsers:boolean;canManageAiPolicy:boolean;scope:string};

const firstNames=["Minh","An","Khoa","Linh","Vy","Nam","Huy","Trang","Phuc","Nhi","Bao","Han","Duc","Mai","Long","Tien","Thao","Quan","Ngoc","Tuan"];
const lastNames=["Nguyen","Tran","Le","Pham","Hoang","Phan","Vo","Dang","Bui","Do"];
const weakSkills=["cell function","organelle role","linear equation steps","reading inference","evidence-based explanation","fraction transformation","scientific vocabulary"];
const strongSkills=["lesson recall","visual reasoning","group explanation","pattern recognition","quick practice completion","AR model exploration","self-correction"];
function clamp(value:number,min=35,max=98){return Math.max(min,Math.min(max,value))}
function dateAgo(days:number){const d=new Date();d.setDate(d.getDate()-days);return d.toISOString()}

export const demoStudents:Student[]=Array.from({length:60}).map((_,index)=>{
  const classIndex=Math.floor(index/20); const inClass=index%20;
  const classId=["class_8a","class_8b","class_8c"][classIndex] as Student["classId"];
  const className=["Class 8A","Class 8B","Class 8C"][classIndex];
  const studentNo=String(index+1).padStart(3,"0");
  const mastery=clamp(52+((index*7)%43)-(inClass%5===0?8:0));
  const supportSignal=inClass%13===0?"wellbeing_support":inClass%7===0?"learning_support":inClass%11===0?"social_support":"none";
  const isGuardianStudent=index===7||index===16;
  return {
    studentId:`stu_${studentNo}`, fullName:`${lastNames[index%lastNames.length]} ${firstNames[index%firstNames.length]}`,
    classId, className, grade:"8", currentSubject:index%3===0?"Biology":index%3===1?"Math":"Literature",
    masteryOverall:mastery, growthScore:clamp(55+((index*9)%41)), assignmentResponsibility:clamp(48+((index*11)%48)),
    collaborationScore:clamp(50+((index*5)%49)), supportRecoveryScore:clamp(50+((index*13)%44)),
    weakestSkill:weakSkills[index%weakSkills.length], strongestSkill:strongSkills[index%strongSkills.length],
    lastActivityAt:dateAgo(index%8), localAiEvents:(index*3)%18, cloudAiEvents:index%5,
    supportSignal, supportSeverityForTeacher:supportSignal==="none"?"none":inClass%13===0?"medium":"low",
    safeSummary:supportSignal==="none"?"No support issue detected in recent synced events.":"Safe support signal detected from recent learning activity. No diagnosis is made.",
    recommendedAction:supportSignal==="none"?"Continue regular learning support.":"Offer a short check-in and review the current lesson calmly.",
    isHomeroomStudent:classId==="class_8a", educationGuardianAccess:isGuardianStudent,
    guardianConsentStatus:isGuardianStudent?"family_and_school_approved":"not_granted",
    sensitiveSupportProfile:isGuardianStudent?{
      medicalSummarySafe:index===7?"Family-approved note: student may need short breaks during long sessions. No medical detail is shown here.":"Family-approved note: occasional fatigue context may affect homework pace. No raw medical record is shown.",
      psychologicalSupportSummarySafe:index===7?"Counselor-safe summary: student benefits from predictable steps and encouragement after mistakes.":"Counselor-safe summary: student benefits from low-pressure review and trusted adult check-ins.",
      socialContextSafe:"Approved support context only. No private raw chat is visible.",
      supportPlan:"Use calm check-ins, reduce overload, assign foundation review before advanced tasks.",
      trustedAdultNotes:["Homeroom teacher may coordinate with subject teachers.","Education guardian access must be audited."],
      accessAuditLog:[{actorRole:"education_guardian",actorName:"Ms. Linh",reason:"Family-approved learning support review",at:dateAgo(1)}]
    }:undefined
  }
});
export const demoClasses:ClassSummary[]=(["class_8a","class_8b","class_8c"] as const).map((classId,index)=>{
  const classStudents=demoStudents.filter(s=>s.classId===classId);
  return {classId,className:["Class 8A","Class 8B","Class 8C"][index],grade:"8",homeroomTeacherName:index===0?"Ms. Linh":index===1?"Mr. Quan":"Ms. Hoa",studentCount:classStudents.length,assignmentCompletionRate:Math.round(classStudents.reduce((sum,s)=>sum+s.assignmentResponsibility,0)/classStudents.length),supportSignalCount:classStudents.filter(s=>s.supportSignal!=="none").length,localAiReadyRate:93-index*4,averageMastery:Math.round(classStudents.reduce((sum,s)=>sum+s.masteryOverall,0)/classStudents.length)}
});
export const rolePolicies:RoleVisibilityPolicy[]=[
 {role:"subject_teacher",label:"Subject Teacher",canViewClassDashboard:true,canViewStudentAcademicReport:true,canViewCrossSubjectSummary:false,canViewSafeSupportSignal:false,canViewSensitiveSupportProfile:false,canViewRawPrivateText:false,canManageAssignments:true,canManageUsers:false,canManageAiPolicy:false,scope:"Only assigned subjects/classes."},
 {role:"homeroom_teacher",label:"Homeroom Teacher",canViewClassDashboard:true,canViewStudentAcademicReport:true,canViewCrossSubjectSummary:true,canViewSafeSupportSignal:true,canViewSensitiveSupportProfile:false,canViewRawPrivateText:false,canManageAssignments:true,canManageUsers:false,canManageAiPolicy:false,scope:"20 homeroom students in Class 8A."},
 {role:"education_guardian",label:"Education Guardian",canViewClassDashboard:true,canViewStudentAcademicReport:true,canViewCrossSubjectSummary:true,canViewSafeSupportSignal:true,canViewSensitiveSupportProfile:true,canViewRawPrivateText:false,canManageAssignments:false,canManageUsers:false,canManageAiPolicy:false,scope:"Only family/school-approved vulnerable student support cases."},
 {role:"parent",label:"Parent / Guardian",canViewClassDashboard:false,canViewStudentAcademicReport:false,canViewCrossSubjectSummary:false,canViewSafeSupportSignal:true,canViewSensitiveSupportProfile:false,canViewRawPrivateText:false,canManageAssignments:false,canManageUsers:false,canManageAiPolicy:false,scope:"Only own child and parent-safe reports."},
 {role:"school_admin",label:"School Admin",canViewClassDashboard:true,canViewStudentAcademicReport:true,canViewCrossSubjectSummary:true,canViewSafeSupportSignal:true,canViewSensitiveSupportProfile:false,canViewRawPrivateText:false,canManageAssignments:true,canManageUsers:true,canManageAiPolicy:true,scope:"School-level aggregate and role-policy operations."}
];
function rankBy(key:keyof Pick<Student,"growthScore"|"assignmentResponsibility"|"collaborationScore"|"supportRecoveryScore">,reason:string):RankingItem[]{return [...demoStudents].sort((a,b)=>b[key]-a[key]).slice(0,12).map((s,i)=>({rank:i+1,studentId:s.studentId,fullName:s.fullName,className:s.className,score:Number(s[key]),trend:i%3===0?"up":i%3===1?"stable":"down",reason}))}
export const apiUsage:ApiUsageByPerson[]=demoStudents.slice(0,24).map((s,index)=>({userId:s.studentId,displayName:s.fullName,role:"student",classId:s.classId,requestCount:s.localAiEvents+s.cloudAiEvents,localAiEvents:s.localAiEvents,cloudAiEvents:s.cloudAiEvents,tokenEstimate:s.cloudAiEvents*850,costEstimate:Number((s.cloudAiEvents*.00012).toFixed(4)),successCount:s.localAiEvents+Math.max(0,s.cloudAiEvents-1),errorCount:index%8===0?1:0,lastUsedAt:s.lastActivityAt,keyId:`key_demo_${String(index%4+1).padStart(2,"0")}`,modelId:"gemma-4-e2b-it",quantization:"int4",deviceId:`android_tablet_${String(index+1).padStart(3,"0")}`}));
export const rankings={learningGrowth:rankBy("growthScore","Highest growth over the last learning cycle."),assignmentResponsibility:rankBy("assignmentResponsibility","Strongest assignment completion responsibility."),collaboration:rankBy("collaborationScore","Strong group work contribution signal."),supportRecovery:rankBy("supportRecoveryScore","Best recovery after support intervention.")};
export const parentReport={studentId:"stu_001",studentName:demoStudents[0].fullName,className:demoStudents[0].className,todayLearningSummary:"Your child completed Biology learning activities and used on-device AI support for a short explanation.",progressSummary:"Biology is developing. The current review focus is cell function and organelle roles.",mentalAndCharacterGrowthSummary:"Your child benefits from calm encouragement and a short explanation-first routine. No diagnostic label is used.",recommendedParentAction:"Ask your child to explain what a cell does before correcting mistakes. Keep the session short and calm.",teacherNote:"Parent-safe report only. No raw chat, hidden score, or internal severity is shown.",assignments:[{assignmentId:"assignment_cell_001",title:"Biology: Cell Structure Review",subject:"Biology",dueDate:"2026-05-10",status:"in_progress",parentVisibleNote:"Review cell function using simple examples."},{assignmentId:"assignment_group_001",title:"Group Reflection: Organelles",subject:"Biology",dueDate:"2026-05-12",status:"not_started",parentVisibleNote:"Encourage the child to complete their group role."},{assignmentId:"assignment_math_001",title:"Linear Equation Practice",subject:"Math",dueDate:"2026-05-04",status:"submitted",parentVisibleNote:"Submitted. Teacher review pending."}],safeAlerts:[{id:"safe_alert_001",levelForParent:"attention",safeSummary:"A learning support signal was recorded after a difficult quiz.",recommendedHomeAction:"Use calm review. Ask what is already understood first.",createdAt:new Date().toISOString()}]};
