import { runStudentAgentTurn } from '../agents/studentAgentOrchestrator';
import type {
  ParentTrendChartPoint,
  ParentTrendReportDto,
  ReportProvider,
  StudentTrendPacket
} from '../../types/studentTrendTypes';

function templateFallback(packet: StudentTrendPacket, childName: string): Pick<ParentTrendReportDto, "title" | "summary" | "keyFactors" | "suggestedActions" | "provider"> {
  const keyFactors = packet.topContributingFactors.slice(0, 3);
  if (packet.level === "red") {
    return {
      title: `Urgent support trend for ${childName}`,
      summary: "Multiple support signals were elevated. Please review the report and follow school support procedures.",
      keyFactors,
      suggestedActions: ["Review trend details today", "Contact school support coordinator", "Use low-pressure study routine tonight"],
      provider: "template_fallback"
    };
  }
  if (packet.level === "high" || packet.level === "elevated") {
    return {
      title: `Learning and wellbeing trend needs attention for ${childName}`,
      summary: "Recent trends show increased strain across one or more factors.",
      keyFactors,
      suggestedActions: ["Keep sessions short", "Check sleep and break routine", "Coordinate with teacher for targeted support"],
      provider: "template_fallback"
    };
  }
  return {
    title: `Trend update for ${childName}`,
    summary: "Current trend is stable or mild. Continue monitoring with a calm routine.",
    keyFactors,
    suggestedActions: ["Maintain consistent sleep", "Use short review blocks", "Check in daily with your child"],
    provider: "template_fallback"
  };
}

function parseJsonSafe(raw: string): { title: string; summary: string; keyFactors: string[]; suggestedActions: string[] } | null {
  try {
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object') return null;
    if (typeof parsed.title !== 'string' || typeof parsed.summary !== 'string') return null;
    return {
      title: parsed.title,
      summary: parsed.summary,
      keyFactors: Array.isArray(parsed.keyFactors) ? parsed.keyFactors.map(String) : [],
      suggestedActions: Array.isArray(parsed.suggestedActions) ? parsed.suggestedActions.map(String) : []
    };
  } catch {
    return null;
  }
}

export async function generateParentTrendReport(args: {
  packet: StudentTrendPacket;
  chart: ParentTrendChartPoint[];
  childName: string;
}): Promise<ParentTrendReportDto> {
  const redactedPacket = {
    level: args.packet.level,
    totalDeduction: args.packet.totalDeduction,
    topContributingFactors: args.packet.topContributingFactors,
    topReasons: args.packet.negativeSummary.topReasons,
    redAlert: args.packet.redAlert,
    redAlertReasons: args.packet.redAlertReasons
  };
  const chartSummary = args.chart.slice(-7);
  let provider: ReportProvider = "template_fallback";
  let content = templateFallback(args.packet, args.childName);

  try {
    const response = await runStudentAgentTurn({
      action: "guardian_report",
      contextMode: "support",
      studentId: args.packet.studentId,
      prompt:
        `You are creating a concise parent message from a structured student trend summary.\n` +
        `Use only the provided packet.\nDo not invent new facts.\nWrite a clear, practical message for the parent.\n` +
        `Return strict JSON:\n{"title": string, "summary": string, "keyFactors": string[], "suggestedActions": string[]}\n` +
        `Packet:\n${JSON.stringify(redactedPacket)}\nChartSummary:\n${JSON.stringify(chartSummary)}`,
      contextText: JSON.stringify(redactedPacket)
    });
    if (response.response.ok) {
      const parsed = parseJsonSafe(response.response.text);
      if (parsed) {
        content = { ...parsed, provider: "gemma_local_cactus" };
        provider = "gemma_local_cactus";
      }
    }
  } catch {
    provider = "template_fallback";
  }

  return {
    studentId: args.packet.studentId,
    childName: args.childName,
    latestPacketId: args.packet.id,
    level: args.packet.level,
    redAlert: args.packet.redAlert,
    title: content.title,
    summary: content.summary,
    keyFactors: content.keyFactors,
    suggestedActions: content.suggestedActions,
    chart: args.chart,
    generatedAt: new Date().toISOString(),
    provider,
    source: args.packet.source
  };
}
