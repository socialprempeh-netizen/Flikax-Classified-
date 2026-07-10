export const FEEDBACK_REPORT_REASONS = ["harassment", "spam", "offensive_content", "fake", "other"] as const;

export type FeedbackReportReason = (typeof FEEDBACK_REPORT_REASONS)[number];

export const FEEDBACK_REPORT_REASON_LABELS: Record<FeedbackReportReason, string> = {
  harassment: "Harassment",
  spam: "Spam",
  offensive_content: "Offensive content",
  fake: "Fake feedback",
  other: "Other",
};
