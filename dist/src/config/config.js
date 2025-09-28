"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.STRIPE_WEBHOOK_SECRET = exports.STRIPE_PUBLISHABLE_KEY = exports.STRIPE_SECRET_KEY = exports.ALLOWED_ORIGIN = exports.WHITE_LIST_MAILS = exports.CLOUDINARY_API_SECRET = exports.CLOUDINARY_API_KEY = exports.CLOUDINARY_NAME = exports.HOST_EMAIL_SECRET = exports.HOST_EMAIL = exports.JWT_SECRET = exports.ENV = exports.PORT = void 0;
const node_process_1 = __importDefault(require("node:process"));
const dotenv_flow_1 = __importDefault(require("dotenv-flow"));
dotenv_flow_1.default.config();
const config = {
    ENV: node_process_1.default.env.ENV,
    PORT: node_process_1.default.env.PORT || 4000,
    JWT_SECRET: node_process_1.default.env.JWT_SECRET,
    HOST_EMAIL: node_process_1.default.env.SMTP_HOST_EMAIL,
    HOST_EMAIL_SECRET: node_process_1.default.env.SMTP_SECRET,
    CLOUDINARY_NAME: node_process_1.default.env.CLOUDINARY_NAME,
    CLOUDINARY_API_KEY: node_process_1.default.env.CLOUDINARY_API_KEY,
    CLOUDINARY_API_SECRET: node_process_1.default.env.CLOUDINARY_API_SECRET,
    WHITE_LIST_MAILS: node_process_1.default.env.WHITE_LIST_MAILS,
    ALLOWED_ORIGIN: JSON.parse(node_process_1.default.env.ALLOWED_ORIGIN),
    STRIPE_SECRET_KEY: node_process_1.default.env.STRIPE_SECRET_KEY,
    STRIPE_PUBLISHABLE_KEY: node_process_1.default.env.STRIPE_PUBLISHABLE_KEY,
    STRIPE_WEBHOOK_SECRET: node_process_1.default.env.STRIPE_WEBHOOK_SECRET,
};
exports.PORT = config.PORT, exports.ENV = config.ENV, exports.JWT_SECRET = config.JWT_SECRET, exports.HOST_EMAIL = config.HOST_EMAIL, exports.HOST_EMAIL_SECRET = config.HOST_EMAIL_SECRET, exports.CLOUDINARY_NAME = config.CLOUDINARY_NAME, exports.CLOUDINARY_API_KEY = config.CLOUDINARY_API_KEY, exports.CLOUDINARY_API_SECRET = config.CLOUDINARY_API_SECRET, exports.WHITE_LIST_MAILS = config.WHITE_LIST_MAILS, exports.ALLOWED_ORIGIN = config.ALLOWED_ORIGIN, exports.STRIPE_SECRET_KEY = config.STRIPE_SECRET_KEY, exports.STRIPE_PUBLISHABLE_KEY = config.STRIPE_PUBLISHABLE_KEY, exports.STRIPE_WEBHOOK_SECRET = config.STRIPE_WEBHOOK_SECRET;
