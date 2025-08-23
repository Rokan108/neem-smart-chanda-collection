

import { internalMutation } from "./_generated/server";

// Migration to add festival_name to existing donations
export const addFestivalNameToExistingDonations = internalMutation({
  args: {},
  handler: async (ctx) => {
    const donations = await ctx.db.query("donations").collect();
    
    let updatedCount = 0;
    
    for (const donation of donations) {
      if (!donation.festival_name) {
        await ctx.db.patch(donation._id, {
          festival_name: "General Donation"
        });
        updatedCount++;
      }
    }
    
    return {
      totalDonations: donations.length,
      updatedDonations: updatedCount,
      message: `Updated ${updatedCount} donations with default festival name`
    };
  },
});
