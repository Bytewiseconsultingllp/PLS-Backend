// src/utils/loggerUtils.ts
import winston from "winston";
import DailyRotateFile from "winston-daily-rotate-file";

type LogLevel =
  | "error"
  | "warn"
  | "info"
  | "http"
  | "verbose"
  | "debug"
  | "silly";

const { combine, timestamp, printf, colorize } = winston.format;

// Custom format for logging with proper typing
const logFormat = printf((info) => {
  const { level, message, timestamp: ts, ...rest } = info;
  const formattedTimestamp =
    typeof ts === "string" ? ts : new Date().toISOString();
  const levelStr = typeof level === "string" ? level : (level as LogLevel);
  const messageStr =
    typeof message === "string" ? message : JSON.stringify(message);

  let logMessage = `${formattedTimestamp} ${levelStr}: ${messageStr}`;

  // Add additional metadata if present and not empty
  const restKeys = Object.keys(rest).filter((key) => rest[key] !== undefined);
  if (restKeys.length > 0) {
    const metadata = restKeys.reduce(
      (acc, key) => {
        acc[key] = rest[key];
        return acc;
      },
      {} as Record<string, unknown>,
    );

    if (Object.keys(metadata).length > 0) {
      logMessage += `\n${JSON.stringify(metadata, null, 2)}`;
    }
  }

  return logMessage;
});

// Common format for all environments
const commonFormat = combine(
  timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
  winston.format.errors({ stack: true }),
);

// Development logger with file transport
const devLogger = () => {
  return winston.createLogger({
    level: "info",
    format: combine(commonFormat, logFormat),
    transports: [
      new winston.transports.Console({
        format: combine(colorize(), logFormat),
      }),
      new DailyRotateFile({
        filename: "logs/application-%DATE%.log",
        datePattern: "YYYY-MM-DD",
        zippedArchive: true,
        maxSize: "20m",
        maxFiles: "14d",
      }),
    ],
  });
};

// Production logger (console only)
const prodLogger = () => {
  return winston.createLogger({
    level: "info",
    format: combine(commonFormat, winston.format.json()),
    transports: [
      new winston.transports.Console({
        format: combine(colorize(), logFormat),
      }),
    ],
  });
};

// Use the appropriate logger based on environment
const logger =
  process.env.NODE_ENV === "production" ? prodLogger() : devLogger();

export default logger;
