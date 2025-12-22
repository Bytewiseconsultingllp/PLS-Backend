import express, { type Express } from "express";

import cors from "cors";
import dotenv from "dotenv";
import helmet from "helmet";
import path from "node:path";
import { ALLOWED_ORIGIN } from "./config/config";
import { swaggerSpec } from "./config/swagger";
import { BASEURL } from "./constants/endpoint";
import { errorHandler, notFoundHandler } from "./middlewares/errorMiddleware";
import { defaultRouter } from "./routers/defaultRouter";
// **** APP *****
const app: Express = express();
// ** MIDDLEWARES **
dotenv.config();
app.set("trust proxy", 1);
app.disable("x-powered-by");

app.use(helmet());
app.use(
  cors({
    // origin: "*", // allow all origins
    origin: ALLOWED_ORIGIN, // use allowed origins from config
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS", "HEAD"],
    credentials: true, // allow credentials (cookies, authorization headers, etc.)
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
);
app.get("/", (req, res) => {
  const demo: string = req.body;
  console.log(demo);
  res.send("<h1>Hello World 13 ddos v1</h1>");
});

// ** STRIPE WEBHOOK - Must use raw body for signature verification **
app.use("/api/v1/payment/webhook", express.raw({ type: "application/json" }));

// ** STANDARD JSON PARSING **
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ parameterLimit: 50000, extended: true }));
app.use(express.static(path.resolve(__dirname, "./public")));

// ** SWAGGER API DOCUMENTATION **
// Swagger JSON endpoint
app.get("/api-docs.json", (_req, res) => {
  res.setHeader("Content-Type", "application/json");
  res.send(swaggerSpec);
});

// Custom Swagger UI with CDN assets (Vercel-compatible)
app.get("/api-docs", (_req, res) => {
  // Set CSP headers to allow CDN assets for Swagger UI
  res.setHeader(
    "Content-Security-Policy",
    "default-src 'self'; " +
      "script-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net; " +
      "style-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net; " +
      "img-src 'self' data: https://cdn.jsdelivr.net; " +
      "font-src 'self' data: https://cdn.jsdelivr.net; " +
      "connect-src 'self'",
  );

  const html = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>PLS Backend API Documentation</title>
      <link rel="icon" type="image/x-icon" href="/favicon.ico">
      <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/swagger-ui-dist@5.10.5/swagger-ui.css" />
      <style>
        .swagger-ui .topbar { display: none; }
      </style>
    </head>
    <body>
      <div id="swagger-ui"></div>
      <script src="https://cdn.jsdelivr.net/npm/swagger-ui-dist@5.10.5/swagger-ui-bundle.js"></script>
      <script src="https://cdn.jsdelivr.net/npm/swagger-ui-dist@5.10.5/swagger-ui-standalone-preset.js"></script>
      <script>
        window.onload = function() {
          window.ui = SwaggerUIBundle({
            url: '/api-docs.json',
            dom_id: '#swagger-ui',
            deepLinking: true,
            presets: [
              SwaggerUIBundle.presets.apis,
              SwaggerUIStandalonePreset
            ],
            plugins: [
              SwaggerUIBundle.plugins.DownloadUrl
            ],
            layout: "StandaloneLayout"
          });
        };
      </script>
    </body>
    </html>
  `;
  res.send(html);
});

// **APPLICATION ROUTES **
app.use(BASEURL, defaultRouter);

// **** ERROR HANDLERS ****
app.use(notFoundHandler);
app.use(errorHandler);
export default app;
