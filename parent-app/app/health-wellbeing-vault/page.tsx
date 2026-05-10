export const dynamic = "force-dynamic";

import ParentShell from "../../components/ParentShell";
import { EvidenceRail, ParentHero, VaultBoard } from "../../components/ParentExperienceKit";
import { levelLabel, onepadApi } from "../../lib/api";

export default async function HealthWellbeingVaultPage() {
  const [trend, vaultResponse, chartResponse] = await Promise.all([
    onepadApi.getChildTrendReport(),
    onepadApi.healthVaultSummary(),
    onepadApi.getChildTrendChart(undefined, 14),
  ]) as any;
  const vault = vaultResponse.vault || {};
  const chart = Array.isArray(chartResponse.points) ? chartResponse.points : [];
  const urgentAlerts = Array.isArray(vault.urgentAlerts) ? vault.urgentAlerts : [];
  const accessHistory = Array.isArray(vault.accessHistory) ? vault.accessHistory : [];

  return (
    <ParentShell>
      <ParentHero
        eyebrow="Parent-controlled privacy boundary"
        title="Health & Wellbeing Vault"
        description="Only safe summaries are shown. Raw private data, hidden internal scores, and teacher-only notes remain outside the parent UI."
        level={trend.level}
      />
      <EvidenceRail items={[
        { label: "Vault status", value: levelLabel(trend.level), hint: "Parent-visible level" },
        { label: "Urgent items", value: urgentAlerts.length, hint: "School-support threshold" },
        { label: "Access records", value: accessHistory.length, hint: "Audit log entries" },
        { label: "Trend points", value: chart.length, hint: "Parent-safe history" },
      ]} />
      <VaultBoard vault={vault} chart={chart} />
    </ParentShell>
  );
}
