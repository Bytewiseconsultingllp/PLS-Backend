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
const config_1 = require("../../config/config");
const constants_1 = require("../../constants");
const db_1 = require("../../database/db");
const globalMailService_1 = require("../../services/globalMailService");
const apiResponseUtils_1 = require("../../utils/apiResponseUtils");
const asyncHandlerUtils_1 = require("../../utils/asyncHandlerUtils");
const loggerUtils_1 = __importDefault(require("../../utils/loggerUtils"));
exports.default = {
    createConsultation: (0, asyncHandlerUtils_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
        const { name, email, phone, message, address, subject } = req.body;
        const { bookingDate: stringyDate } = req.body;
        const bookingDate = new Date(stringyDate);
        if (isNaN(bookingDate.getTime())) {
            throw { status: constants_1.BADREQUESTCODE, message: "Invalid date format." };
        }
        if (bookingDate < new Date())
            throw { status: constants_1.BADREQUESTCODE, message: "Please enter a future date" };
        if (bookingDate.getDay() === 6)
            throw { status: constants_1.BADREQUESTCODE, message: "We are closed on saturday" };
        if (bookingDate.getDay() === 0)
            throw { status: constants_1.BADREQUESTCODE, message: "We are closed on sunday" };
        const bookingHour = bookingDate.getHours();
        loggerUtils_1.default.info("bookinghour", { bookingHour });
        if (bookingHour < 9 || bookingHour >= 17) {
            throw {
                status: constants_1.BADREQUESTCODE,
                message: "Consultation time must be between 9 AM and 5 PM",
            };
        }
        const isConsultationDateAlreadyBooked = yield db_1.db.consultationBooking.findUnique({
            where: {
                bookingDate: bookingDate,
            },
        });
        if (isConsultationDateAlreadyBooked)
            throw {
                status: constants_1.BADREQUESTCODE,
                message: "This date is already booked, Please choose another one",
            };
        const consultation = yield db_1.db.consultationBooking.create({
            data: {
                name,
                email,
                phone,
                message,
                bookingDate,
                address,
                subject,
            },
        });
        yield Promise.all([
            yield (0, globalMailService_1.gloabalMailMessage)(email, message, "Consultation Request For Prime Logic Solution", `Dear ${name},`),
            yield (0, globalMailService_1.gloabalMailMessage)(config_1.HOST_EMAIL, message, "Consultation Request For Prime Logic Solution", "Dear Administrators of PLS,", `User's orignal email is here: ${email} For more information check admin pannel of PLS`, name),
            yield (0, globalMailService_1.gloabalMailMessage)(email, constants_1.CONSULTATIONPENDINGMESSAGEFROMADMIN, "About your consultation request", `Dear ${name},`, "", constants_1.ADMINNAME),
        ]);
        (0, apiResponseUtils_1.httpResponse)(req, res, constants_1.SUCCESSCODE, "Please check your email for more details", consultation);
    })),
    updateConsultation: (0, asyncHandlerUtils_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
        const { id } = req.params;
        if (!id)
            throw {
                status: constants_1.BADREQUESTCODE,
                message: "Please send the id of consultaion request you want to update",
            };
        const { name, email, phone, message, address, subject } = req.body;
        const { bookingDate: stringyDate } = req.body;
        const existingConsultation = yield db_1.db.consultationBooking.findUnique({
            where: { id: Number(id) },
        });
        if (!existingConsultation) {
            throw { status: constants_1.NOTFOUNDCODE, message: "Consultation not found" };
        }
        const bookingDate = new Date(stringyDate);
        if (isNaN(bookingDate.getTime())) {
            throw { status: constants_1.BADREQUESTCODE, message: "Invalid date format." };
        }
        if (bookingDate < new Date()) {
            throw { status: constants_1.BADREQUESTCODE, message: "Please enter a future date" };
        }
        if (bookingDate.getDay() === 6) {
            throw { status: constants_1.BADREQUESTCODE, message: "We are closed on saturday" };
        }
        if (bookingDate.getDay() === 0) {
            throw { status: constants_1.BADREQUESTCODE, message: "We are closed on sunday" };
        }
        const bookingHour = bookingDate.getHours();
        loggerUtils_1.default.info("bookinghour", { bookingHour });
        if (bookingHour < 9 || bookingHour >= 17) {
            throw {
                status: constants_1.BADREQUESTCODE,
                message: "Consultation time must be between 9 AM and 5 PM",
            };
        }
        const isConsultationDateAlreadyBooked = yield db_1.db.consultationBooking.findFirst({
            where: {
                bookingDate,
                id: { not: Number(id) },
            },
        });
        if (isConsultationDateAlreadyBooked) {
            throw {
                status: constants_1.BADREQUESTCODE,
                message: "This date is already booked, Please choose another one",
            };
        }
        const updatedConsultation = yield db_1.db.consultationBooking.update({
            where: { id: Number(id) },
            data: {
                name,
                email,
                phone,
                message,
                bookingDate,
                address,
                subject,
            },
        });
        yield Promise.all([
            yield (0, globalMailService_1.gloabalMailMessage)(config_1.HOST_EMAIL, message, "Consultation Update For Prime Logic Solution", "Dear Administrators of PLS,", `Some one has updated the User's email in consultancy. User's update email is here: ${email} For more information check admin panel of PLS`, name),
            yield (0, globalMailService_1.gloabalMailMessage)(email, "Your consultation booking has been updated successfully", "Consultation Update Confirmation", `Dear ${name},`, "", constants_1.ADMINNAME),
        ]);
        (0, apiResponseUtils_1.httpResponse)(req, res, constants_1.SUCCESSCODE, "Consultation updated successfully", updatedConsultation);
    })),
    getAllRequestedConsultations: (0, asyncHandlerUtils_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
        const consultations = yield db_1.db.consultationBooking.findMany({
            where: { trashedAt: null, trashedBy: null },
        });
        if (consultations.length === 0)
            (0, apiResponseUtils_1.httpResponse)(req, res, constants_1.SUCCESSCODE, constants_1.NOTFOUNDMSG, null);
        (0, apiResponseUtils_1.httpResponse)(req, res, constants_1.SUCCESSCODE, "All consultations", consultations);
    })),
    getSingleRequestedConsultation: (0, asyncHandlerUtils_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
        const { id } = req.params;
        const consultation = yield db_1.db.consultationBooking.findUnique({
            where: { id: Number(id), trashedBy: null, trashedAt: null },
        });
        if (!consultation)
            throw { status: constants_1.NOTFOUNDCODE, message: "No consultation found" };
        (0, apiResponseUtils_1.httpResponse)(req, res, constants_1.SUCCESSCODE, "Single consultation", consultation);
    })),
    deleteRequestedConsultation: (0, asyncHandlerUtils_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
        const { id } = req.params;
        const checkIfConsultationExists = yield db_1.db.consultationBooking.findUnique({
            where: { id: Number(id) },
        });
        if (!checkIfConsultationExists)
            throw { status: constants_1.NOTFOUNDCODE, message: "No consultation found" };
        yield db_1.db.consultationBooking
            .delete({ where: { id: Number(id) } })
            .then(() => (0, apiResponseUtils_1.httpResponse)(req, res, constants_1.SUCCESSCODE, "Deleted successfully"))
            .catch(() => {
            throw {
                status: constants_1.INTERNALSERVERERRORCODE,
                message: constants_1.INTERNALSERVERERRORMSG,
            };
        });
    })),
    acceptConsultationBooking: (0, asyncHandlerUtils_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
        const { id } = req.params;
        const consultation = yield db_1.db.consultationBooking.update({
            where: { id: Number(id) },
            data: { status: "ACCEPTED" },
        });
        yield (0, globalMailService_1.gloabalMailMessage)(consultation.email, `${constants_1.CONSULTATIONAPPROVALMESSAGEFROMADMIN} <p>I hope you are ready on ${consultation.bookingDate.toLocaleDateString()} at ${consultation.bookingDate.toLocaleTimeString()}.</p><p>Best regards,</p><p>Prime Logic Solution</p>`, "Your consultation request got Accepted", `Dear ${consultation.name},`, "", constants_1.ADMINNAME);
        (0, apiResponseUtils_1.httpResponse)(req, res, constants_1.SUCCESSCODE, constants_1.SUCCESSMSG);
    })),
    rejectConsultationBooking: (0, asyncHandlerUtils_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
        const { id } = req.params;
        const { rejectAndDeleteConsultaion = true } = req.body;
        if (!id)
            throw {
                status: constants_1.BADREQUESTCODE,
                message: "Please send the id of consultaion request you want to reject",
            };
        const checkIfConsultationExists = yield db_1.db.consultationBooking.findUnique({
            where: { id: Number(id) },
        });
        if (!checkIfConsultationExists)
            throw { status: constants_1.NOTFOUNDCODE, message: "No consultation found" };
        if (rejectAndDeleteConsultaion) {
            yield db_1.db.consultationBooking.update({
                where: { id: Number(id), status: "PENDING" },
                data: { status: "REJECTED" },
            });
        }
        (0, apiResponseUtils_1.httpResponse)(req, res, constants_1.SUCCESSCODE, constants_1.SUCCESSMSG);
    })),
    trashConsultation: (0, asyncHandlerUtils_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
        var _a;
        const { id } = req.params;
        const uid = (_a = req.userFromToken) === null || _a === void 0 ? void 0 : _a.uid;
        if (!uid)
            throw { status: constants_1.BADREQUESTCODE, message: constants_1.BADREQUESTMSG };
        const user = yield db_1.db.user.findUnique({ where: { uid } });
        yield db_1.db.consultationBooking.update({
            where: { id: Number(id) },
            data: {
                trashedAt: new Date(),
                trashedBy: `@${user === null || user === void 0 ? void 0 : user.username}-${user === null || user === void 0 ? void 0 : user.fullName}-${user === null || user === void 0 ? void 0 : user.role}`,
            },
        });
        (0, apiResponseUtils_1.httpResponse)(req, res, constants_1.SUCCESSCODE, constants_1.SUCCESSMSG);
    })),
    untrashConsultation: (0, asyncHandlerUtils_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
        const { id } = req.params;
        yield db_1.db.consultationBooking.update({
            where: { id: Number(id) },
            data: { trashedAt: null, trashedBy: null },
        });
        (0, apiResponseUtils_1.httpResponse)(req, res, constants_1.SUCCESSCODE, constants_1.SUCCESSMSG);
    })),
};
