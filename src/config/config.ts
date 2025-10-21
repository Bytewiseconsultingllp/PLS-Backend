import process from "node:process";
import DotenvFlow from "dotenv-flow";
import type { TENV } from "../types";
DotenvFlow.config();

const config = {
  ENV: process.env.ENV as TENV,
  PORT: process.env.PORT || 4000,
  JWT_SECRET: process.env.JWT_SECRET as string,
  HOST_EMAIL: process.env.SMTP_HOST_EMAIL as string,
  HOST_EMAIL_SECRET: process.env.SMTP_SECRET as string,
  CLOUDINARY_NAME: process.env.CLOUDINARY_NAME as string,
  CLOUDINARY_API_KEY: process.env.CLOUDINARY_API_KEY as string,
  CLOUDINARY_API_SECRET: process.env.CLOUDINARY_API_SECRET as string,
  WHITE_LIST_MAILS: process.env.WHITE_LIST_MAILS as string,
  ALLOWED_ORIGIN: JSON.parse(process.env.ALLOWED_ORIGIN as string) as string[],
  STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY as string,
  STRIPE_PUBLISHABLE_KEY: process.env.STRIPE_PUBLISHABLE_KEY as string,
  STRIPE_WEBHOOK_SECRET: process.env.STRIPE_WEBHOOK_SECRET as string,
  // Rate limiter whitelist IPs (optional, comma-separated)
  RATE_LIMIT_WHITELIST_IPS: process.env.RATE_LIMIT_WHITELIST_IPS
    ? process.env.RATE_LIMIT_WHITELIST_IPS.split(",").map((ip) => ip.trim())
    : [],
  // Enable rate limiting in development mode for testing
  ENABLE_RATE_LIMIT_IN_DEV: process.env.ENABLE_RATE_LIMIT_IN_DEV === "true",
};
export const {
  PORT,
  ENV,
  JWT_SECRET,
  HOST_EMAIL,
  HOST_EMAIL_SECRET,
  CLOUDINARY_NAME,
  CLOUDINARY_API_KEY,
  CLOUDINARY_API_SECRET,
  WHITE_LIST_MAILS,
  ALLOWED_ORIGIN,
  STRIPE_SECRET_KEY,
  STRIPE_PUBLISHABLE_KEY,
  STRIPE_WEBHOOK_SECRET,
  RATE_LIMIT_WHITELIST_IPS,
  ENABLE_RATE_LIMIT_IN_DEV,
} = config;
