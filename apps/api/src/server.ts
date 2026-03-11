import "dotenv/config";

import app from "./app.js";

const PORT = process.env.PORT || 3001;

try {
  await app.listen({ port: Number(PORT) });
  app.log.info(`Server M. Move API is running on port ${PORT}`);
} catch (err) {
  app.log.error(err);
  process.exit(1);
}
