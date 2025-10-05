"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.gloabalMailMessage = gloabalMailMessage;
const nodemailer_1 = __importDefault(require("nodemailer"));
const config_1 = require("../config/config");
const constants_1 = require("../constants");
const loggerUtils_1 = __importDefault(require("../utils/loggerUtils"));
const slugStringGeneratorUtils_1 = require("../utils/slugStringGeneratorUtils");
const transporter = nodemailer_1.default.createTransport({
    service: "gmail",
    host: "smtp.gmail.com",
    port: 587,
    secure: false,
    auth: {
        user: config_1.HOST_EMAIL,
        pass: config_1.HOST_EMAIL_SECRET,
    },
    tls: {
        rejectUnauthorized: false,
    },
});
function gloabalMailMessage(to, message, subject, header, addsOn, senderIntro) {
    return __awaiter(this, void 0, void 0, function* () {
        if (config_1.ENV == "DEVELOPMENT")
            return;
        const htmlTemplate = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; margin: 0; padding: 20px; }
        .container { max-width: 600px; margin: 0 auto; }
        .header { background: #f4f4f4; padding: 20px; text-align: center; }
        .content { padding: 20px; }
        .footer { font-size: 12px; color: #666; text-align: center; padding: 20px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h2>${header || ""}</h2>
        </div>
        <div class="content">
          <p>${senderIntro || ""}</p>
          <p>${message || ""}</p>
          <p>${addsOn || ""}</p>
        </div>
        <div class="footer">
          <p>${constants_1.COMPANY_NAME || "Prime Logic Solutions"}</p>
        </div>
      </div>
    </body>
    </html>
  `;
        const randomStr = (0, slugStringGeneratorUtils_1.generateRandomStrings)(10);
        const mailOptions = {
            from: config_1.HOST_EMAIL,
            to: to,
            subject: subject !== null && subject !== void 0 ? subject : constants_1.COMPANY_NAME,
            html: htmlTemplate,
            headers: {
                "X-Auto-Response-Suppress": "All",
                Precedence: "bulk",
                "Auto-Submitted": "auto-generated",
                "Message-ID": `<${randomStr}.dev>`,
            },
            replyTo: "support@primelogicsole.com",
        };
        try {
            const info = yield transporter.sendMail(mailOptions);
            loggerUtils_1.default.info(`Email message sent successfully: ${info.response}`);
        }
        catch (error) {
            if (error instanceof Error) {
                loggerUtils_1.default.error(`Error Email message sending :${error.message}`);
                throw {
                    status: constants_1.INTERNALSERVERERRORCODE,
                    message: constants_1.INTERNALSERVERERRORMSG,
                };
            }
            loggerUtils_1.default.error(`Error sending Email message:${error}`);
            throw { status: constants_1.INTERNALSERVERERRORCODE, message: constants_1.INTERNALSERVERERRORMSG };
        }
    });
}
