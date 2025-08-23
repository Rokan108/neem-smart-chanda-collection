

import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  donations: defineTable({
    mandal_name: v.string(),
    donor_name: v.string(),
    amount: v.number(),
    mobile_number: v.string(),
    email: v.optional(v.string()),
    donation_date: v.string(), // YYYY-MM-DD format
    donation_time: v.string(), // HH:MM:SS format
    receipt_id: v.string(), // Unique receipt identifier
    festival_name: v.optional(v.string()), // Festival name (Ganpati Festival, Holi, etc.) - optional for backward compatibility
  })
    .index("by_donor_name", ["donor_name"])
    .index("by_date", ["donation_date"])
    .index("by_mandal", ["mandal_name"])
    .index("by_amount", ["amount"])
    .index("by_festival", ["festival_name"]),
});
