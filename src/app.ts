import express, { type Express } from "express";


import cors from "cors";
import dotenv from "dotenv";
import helmet from "helmet";
import path from "node:path";
import { ALLOWED_ORIGIN } from "./config/config";
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
 res.send("<h1>Hello World</h1>");
});
// Conditionally apply express.json() - skip for blog routes that use custom parser
app.use((req, res, next) => {
 // Skip express.json() for blog create/update routes
 if (
   req.path.includes("/blog/createBlog") ||
   req.path.includes("/blog/updateBlog")
 ) {
   return next(); // Let blogJsonParser handle these
 }
 // For all other routes, use express.json()
 express.json({ limit: "50mb" })(req, res, next);
});
app.use(express.urlencoded({ parameterLimit: 50000, extended: true }));
app.use(express.static(path.resolve(__dirname, "./public")));
// **APPLICATION ROUTES **
app.use(BASEURL, defaultRouter);


// **** ERROR HANDLERS ****
app.use(notFoundHandler);
app.use(errorHandler);
export { app };



