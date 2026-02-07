/**
 * Auth Module Handler
 * Handles all auth module actions
 */

import { TRPCError } from "@trpc/server";

export async function handleAction(action: string, params: any, customer: any) {
  switch (action) {
    case "login":
    case "logout":
    case "refresh_token":
    case "get_user":
    case "verify_token":
      throw new TRPCError({
        code: "NOT_IMPLEMENTED",
        message: "Auth module coming soon",
      });
    
    default:
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: `Unknown action: ${action}`,
      });
  }
}
