import express, { type Express } from "express";

import cors from "cors";
import dotenv from "dotenv";
import helmet from "helmet";
import path from "node:path";
import swaggerUi from "swagger-ui-express";
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
  res.send("<h1>Hello World 4</h1>");
});

// ** STRIPE WEBHOOK - Must use raw body for signature verification **
app.use("/api/v1/payment/webhook", express.raw({ type: "application/json" }));

// ** STANDARD JSON PARSING **
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ parameterLimit: 50000, extended: true }));
app.use(express.static(path.resolve(__dirname, "./public")));

// ** SWAGGER API DOCUMENTATION **
// Swagger UI endpoint
app.use(
  "/api-docs",
  swaggerUi.serve,
  swaggerUi.setup(swaggerSpec, {
    customCss: ".swagger-ui .topbar { display: none }",
    customSiteTitle: "PLS Backend API Documentation",
    customfavIcon: "/favicon.ico",
  }),
);

// Swagger JSON endpoint for external tools
app.get("/api-docs.json", (_req, res) => {
  res.setHeader("Content-Type", "application/json");
  res.send(swaggerSpec);
});

// **APPLICATION ROUTES **
app.use(BASEURL, defaultRouter);

// **** ERROR HANDLERS ****
app.use(notFoundHandler);
app.use(errorHandler);
export { app };
