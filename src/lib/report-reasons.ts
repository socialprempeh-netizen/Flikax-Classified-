export const REPORT_REASONS = [
  "scam",
  "spam",
  "fake_listing",
  "duplicate",
  "wrong_category",
  "offensive_content",
  "copyright",
  "already_sold",
] as const;

export type ReportReason = (typeof REPORT_REASONS)[number];

export const REPORT_REASON_LABELS: Record<ReportReason, string> = {
  scam: "Scam",
  spam: "Spam",
  fake_listing: "Fake listing",
  duplicate: "Duplicate",
  wrong_category: "Wrong category",
  offensive_content: "Offensive content",
  copyright: "Copyright infringement",
  already_sold: "Already sold",
};
