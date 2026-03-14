import "dotenv/config";

import app from "./app.js";

const PORT = process.env.PORT || 3001;

function shutdown(signal: string): void {
  app.log.info(`Received ${signal}, starting graceful shutdown`);
  app.close().then(
    () => {
      app.log.info("Graceful shutdown complete");
      process.exit(0);
    },
    (err) => {
      app.log.error(err, "Error during shutdown");
      process.exit(1);
    },
  );
}

process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("SIGINT", () => shutdown("SIGINT"));

try {
  await app.listen({ port: Number(PORT) });
  app.log.info(`Server M. Move API is running on port ${PORT}`);
} catch (err) {
  app.log.error(err);
  process.exit(1);
}
