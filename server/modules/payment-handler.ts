/**
 * Payment Module Handler
 * Handles all payment module actions
 */

import { TRPCError } from "@trpc/server";

export async function handleAction(action: string, params: any, customer: any) {
  switch (action) {
    case "create_checkout":
    case "process_payment":
    case "handle_webhook":
    case "refund":
    case "link_bank_account":
      throw new TRPCError({
        code: "NOT_IMPLEMENTED",
        message: "Payment module coming soon",
      });
    
    default:
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: `Unknown action: ${action}`,
      });
  }
}
