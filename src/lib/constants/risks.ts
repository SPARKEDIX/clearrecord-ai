import type { RiskCategory } from "@/types/models";

export const RISK_CATEGORY_LABELS: Record<RiskCategory, string> = {
  workplace_hostility: "Workplace Hostility",
  aggressive_debates: "Aggressive Debates",
  profanity: "Profanity",
  substance_references: "Substance References",
  discriminatory_language: "Discriminatory Language",
  unprofessional_behavior: "Unprofessional Behavior",
  confidential_info_sharing: "Confidential Info Sharing",
  fake_news: "Fake News",
  extremist_content: "Extremist Content",
  inappropriate_media: "Inappropriate Media",
  privacy_violations: "Privacy Violations",
  dishonest_behavior: "Dishonest Behavior",
  violent_threats: "Violent Threats"
};

export const RISK_LEVEL_COLORS = {
  high: "#FF4444",
  medium: "#FFC107",
  safe: "#1DB954"
} as const;

export function scoreColor(score: number): string {
  if (score < 50) return "#FF4444";
  if (score < 80) return "#FFC107";
  return "#1DB954";
}
