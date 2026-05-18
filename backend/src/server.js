import fs from "node:fs";
import path from "node:path";
import http from "node:http";
import { fileURLToPath } from "node:url";
import { createRequire } from "node:module";

import { app } from "./app.js";
import { errorMiddleware } from "./middlewares/error.middleware.js";
import { connectHRMSMySQL, connectMySQL } from "./config/mySqlDB.js";
import { admin } from "./config/firebase.js";
import { initSocket } from "./socket/socket.js";

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
    const reason =
      process.env.SERVE_FRONTEND === "false"
        ? "SERVE_FRONTEND=false"
        : !isProd
          ? "NODE_ENV is not 'production' — run `next dev` separately for the frontend"
          : "no .next build found — run `npm run build` first";
    console.log(`ℹ️  Next.js frontend not served (${reason})`);
  }

  app.use(errorMiddleware);

  // Create HTTP server so Socket.IO can share the same port
  const server = http.createServer(app);
  // Initialize Socket.IO
  initSocket(server);

  server.listen(PORT, "0.0.0.0", () => {
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
