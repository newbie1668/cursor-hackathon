import type { CiStatus, RiskLevel } from "../data/reviews";

const RISK_LABEL: Record<RiskLevel, string> = {
  safe: "safe",
  needs_eyes: "needs eyes",
  dangerous: "dangerous",
};

const CI_LABEL: Record<CiStatus, string> = {
  passing: "CI passing",
  failing: "CI failing",
  pending: "CI pending",
};

export function riskClass(risk: RiskLevel) {
  if (risk === "safe") return "signal-safe";
  if (risk === "dangerous") return "signal-danger";
  return "signal-eyes";
}

export function ciClass(ci: CiStatus) {
  if (ci === "passing") return "signal-safe";
  if (ci === "failing") return "signal-danger";
  return "signal-eyes";
}

export function formatRisk(risk: RiskLevel) {
  return RISK_LABEL[risk];
}

export function formatCi(ci: CiStatus) {
  return CI_LABEL[ci];
}
