const path = require("path");
const fs = require("fs");
const dotenv = require("dotenv");

// Load environment variables from root .env and/or backend/.env if present
dotenv.config({ path: path.resolve(__dirname, "..", ".env") });
dotenv.config({ path: path.resolve(__dirname, ".env") });

// Default to production when launched on Render unless explicitly set
if (!process.env.NODE_ENV && process.env.RENDER) {
    process.env.NODE_ENV = "production";
}

const express = require("express");
const cors = require("cors");

const app = express();

app.disable("x-powered-by");
app.set("trust proxy", 1);
app.use(express.json({ limit: "2mb" }));

const allowedOrigins = new Set(
    [
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        process.env.RENDER_EXTERNAL_URL,
        ...(process.env.ALLOWED_ORIGINS || "")
            .split(",")
            .map((origin) => origin.trim())
    ].filter(Boolean)
);

app.use(cors({
    origin: (origin, callback) => {
        if (
            !origin ||
            allowedOrigins.has(origin) ||
            /^https:\/\/[a-z0-9-]+\.onrender\.com$/i.test(origin)
        ) {
            return callback(null, true);
        }
        return callback(null, false);
    },
    credentials: true
}));

// Health check endpoints for Render & monitoring
app.get("/health", (_req, res) => {
    res.status(200).json({
        status: "ok",
        service: "medical-lms-app",
        uptime: Math.round(process.uptime()),
        timestamp: new Date().toISOString()
    });
});

app.get("/api/health", (_req, res) => {
    res.status(200).json({ status: "ok" });
});

const aiRoutes = require("./route/aiRoutes");

app.use("/api/ai", aiRoutes);

// Return JSON 404 for unmatched /api routes rather than falling back to HTML
app.use("/api", (_req, res) => {
    res.status(404).json({ error: "API endpoint not found." });
});

// Serve built Vite SPA bundle in production
const distPath = path.resolve(__dirname, "..", "dist");
const indexHtmlPath = path.join(distPath, "index.html");

if (fs.existsSync(indexHtmlPath)) {
    app.use(
        express.static(distPath, {
            index: false,
            maxAge: "1y",
            setHeaders: (res, filePath) => {
                if (filePath.endsWith(".html")) {
                    res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
                }
            }
        })
    );

    app.use((req, res, next) => {
        if (req.method !== "GET" && req.method !== "HEAD") {
            return next();
        }
        if (req.path.startsWith("/assets/") && path.extname(req.path)) {
            return res.status(404).end();
        }
        res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
        res.sendFile(indexHtmlPath);
    });
} else {
    app.get("/", (_req, res) => {
        res.status(200).json({
            status: "ok",
            message: "Medical LMS backend running. Run `npm run build` to serve frontend."
        });
    });
}

const PORT = Number(process.env.PORT) || 5000;
const HOST = "0.0.0.0";

app.listen(PORT, HOST, () => {
    console.log(`Server running on http://${HOST}:${PORT}`);
});
