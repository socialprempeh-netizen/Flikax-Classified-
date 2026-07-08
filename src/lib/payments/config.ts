/** Server-only. Master switch for all payment/subscription UI and routes; defaults off pre-launch. */
export const PAYMENTS_ENABLED = process.env.PAYMENTS_ENABLED === "true";
