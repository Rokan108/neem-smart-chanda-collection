

import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

// Create a new donation entry
export const create = mutation({
  args: {
    mandal_name: v.string(),
    donor_name: v.string(),
    amount: v.number(),
    mobile_number: v.string(),
    email: v.optional(v.string()),
    donation_date: v.string(),
    donation_time: v.string(),
    receipt_id: v.string(),
    festival_name: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const donationId = await ctx.db.insert("donations", {
      mandal_name: args.mandal_name,
      donor_name: args.donor_name,
      amount: args.amount,
      mobile_number: args.mobile_number,
      email: args.email,
      donation_date: args.donation_date,
      donation_time: args.donation_time,
      receipt_id: args.receipt_id,
      festival_name: args.festival_name || "General Donation",
    });
    return donationId;
  },
});

// Get all donations
export const list = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db
      .query("donations")
      .order("desc")
      .collect();
  },
});

// Search donations by donor name
export const searchByDonor = query({
  args: { donor_name: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("donations")
      .withIndex("by_donor_name", (q) => q.eq("donor_name", args.donor_name))
      .collect();
  },
});

// Get donations by date range
export const getByDateRange = query({
  args: { 
    start_date: v.string(),
    end_date: v.string() 
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("donations")
      .withIndex("by_date")
      .filter((q) => 
        q.and(
          q.gte(q.field("donation_date"), args.start_date),
          q.lte(q.field("donation_date"), args.end_date)
        )
      )
      .collect();
  },
});

// Get total donations amount
export const getTotalAmount = query({
  args: {},
  handler: async (ctx) => {
    const donations = await ctx.db.query("donations").collect();
    return donations.reduce((total, donation) => total + donation.amount, 0);
  },
});

// Get donations count
export const getCount = query({
  args: {},
  handler: async (ctx) => {
    const donations = await ctx.db.query("donations").collect();
    return donations.length;
  },
});
