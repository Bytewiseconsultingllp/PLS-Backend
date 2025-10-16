"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.app = void 0;
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const helmet_1 = __importDefault(require("helmet"));
const node_path_1 = __importDefault(require("node:path"));
const config_1 = require("./config/config");
const endpoint_1 = require("./constants/endpoint");
const errorMiddleware_1 = require("./middlewares/errorMiddleware");
const defaultRouter_1 = require("./routers/defaultRouter");
const app = (0, express_1.default)();
exports.app = app;
dotenv_1.default.config();
app.set("trust proxy", 1);
app.disable("x-powered-by");
app.use((0, helmet_1.default)());
app.use((0, cors_1.default)({
    origin: config_1.ALLOWED_ORIGIN,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS", "HEAD"],
    credentials: true,
    allowedHeaders: ["Content-Type", "Authorization"],
}));
app.use(express_1.default.json({ limit: "50mb" }));
app.use(express_1.default.urlencoded({ parameterLimit: 50000, extended: true }));
app.use(express_1.default.static(node_path_1.default.resolve(__dirname, "./public")));
app.use(endpoint_1.BASEURL, defaultRouter_1.defaultRouter);
app.use(errorMiddleware_1.notFoundHandler);
app.use(errorMiddleware_1.errorHandler);
