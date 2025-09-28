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
exports.sendMessageToTheUserService = sendMessageToTheUserService;
const nodemailer_1 = __importDefault(require("nodemailer"));
const node_fs_1 = __importDefault(require("node:fs"));
const node_path_1 = __importDefault(require("node:path"));
const config_1 = require("../config/config");
const slugStringGeneratorService_1 = require("./slugStringGeneratorService");
const loggerUtils_1 = __importDefault(require("../utils/loggerUtils"));
const constants_1 = require("../constants");
const transporter = nodemailer_1.default.createTransport({
    service: "gmail",
    auth: {
        user: config_1.HOST_EMAIL,
        pass: config_1.HOST_EMAIL_SECRET,
    },
});
function sendMessageToTheUserService(to, messageByAdmin, name) {
    return __awaiter(this, void 0, void 0, function* () {
        const templatePath = node_path_1.default.resolve(__dirname, "../templates/sendMessageToUser.html");
        let htmlTemplate = node_fs_1.default.readFileSync(templatePath, "utf8");
        htmlTemplate = htmlTemplate
            .replace("{{messageByAdmin}}", messageByAdmin)
            .replace("{{name}}", name);
        const randomStr = (0, slugStringGeneratorService_1.generateRandomStrings)(10);
        const mailOptions = {
            from: "noreply@pls.com",
            to: to,
            subject: "Replied Mail by Administrator of Prime Logic Solution",
            html: htmlTemplate,
            headers: {
                "Message-ID": `<${randomStr}.dev>`,
            },
        };
        try {
            const info = yield transporter.sendMail(mailOptions);
            loggerUtils_1.default.info("message sent: " + info.response);
        }
        catch (error) {
            if (error instanceof Error) {
                loggerUtils_1.default.error("message  sending error:", error.message);
                throw {
                    status: constants_1.INTERNALSERVERERRORCODE,
                    message: "Unable To send message",
                };
            }
            else {
                loggerUtils_1.default.error("message sending message:", +`${error}`);
                throw {
                    status: constants_1.INTERNALSERVERERRORCODE,
                    message: "Unable To send message",
                };
            }
        }
    });
}
