import { app } from "./app.js";
import { env } from "./config/env.js";
import { connectDB } from "./config/db.js";
import { startAbandonedCartJob } from "./jobs/abandonedCart.job.js";

const startServer = async () => {
  await connectDB();

  app.listen(env.port, () => {
    console.log(`🚀 Server running on port ${env.port}`);
    startAbandonedCartJob();
  });
};

startServer();
