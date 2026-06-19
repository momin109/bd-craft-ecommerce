import cron from "node-cron";
import { env } from "../config/env.js";
import { AbandonedCartService } from "../modules/abandonedCart/abandonedCart.service.js";

export const startAbandonedCartJob = () => {
  if (env.nodeEnv !== "production") {
    return;
  }

  cron.schedule("0 * * * *", async () => {
    try {
      await AbandonedCartService.runAbandonedCartRecovery();
      console.log("✅ Abandoned cart recovery job completed");
    } catch (error) {
      console.error("❌ Abandoned cart recovery job failed:", error);
    }
  });
};
