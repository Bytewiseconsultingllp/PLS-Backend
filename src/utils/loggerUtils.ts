// src/utils/loggerUtils.ts
import winston from "winston";
import DailyRotateFile from "winston-daily-rotate-file";

const { combine, timestamp, printf, colorize } = winston.format;

// Custom format for logging
const logFormat = printf(({ level, message, timestamp }) => {
  return `${timestamp} ${level}: ${message}`;
});

// Common format for all environments
const commonFormat = combine(
  timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
  winston.format.errors({ stack: true })
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