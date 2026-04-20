import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createRequire } from "node:module";

import { app } from "./app.js";
import { errorMiddleware } from "./middlewares/error.middleware.js";
import { connectHRMSMySQL, connectMySQL } from "./config/mySqlDB.js";
import { admin } from "./config/firebase.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const frontendDir = path.resolve(__dirname, "../../frontend");
const nextBuildDir = path.join(frontendDir, ".next");

const PORT = process.env.PORT || 4000;
const isProd = process.env.NODE_ENV === "production";
const serveFrontend =
  process.env.SERVE_FRONTEND === "false"
    ? false
    : process.env.SERVE_FRONTEND === "true" ||
      (isProd && fs.existsSync(nextBuildDir));

const start = async () => {
  connectMySQL();
  connectHRMSMySQL();

  if (admin.apps.length) {
    console.log("✅ Firebase connected successfully");
  } else {
    console.log("⚠️ Firebase not connected");
  }

  if (serveFrontend) {
    const require = createRequire(path.join(frontendDir, "package.json"));
    const next = require("next");
    const dev = process.env.NODE_ENV !== "production";
    const nextApp = next({ dev, dir: frontendDir });
    const nextHandler = nextApp.getRequestHandler();
    await nextApp.prepare();
    console.log("✅ Next.js prepared");
    app.all(/.*/, (req, res) => nextHandler(req, res));
  } else {
    console.log("ℹ️  Next.js frontend not served (no .next build found)");
  }

  app.use(errorMiddleware);

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`✅ Server running on port ${PORT}`);
    console.log(`   API: http://localhost:${PORT}/api/v1/`);
    if (serveFrontend) {
      console.log(`   Frontend: http://localhost:${PORT}/`);
    }
  });
};

start().catch((err) => {
  console.error("❌ Failed to start server:", err);
  process.exit(1);
});
