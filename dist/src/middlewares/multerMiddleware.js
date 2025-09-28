"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.fileUploader = exports.supportedFileTypes = void 0;
const multer_1 = __importDefault(require("multer"));
const node_path_1 = __importDefault(require("node:path"));
exports.supportedFileTypes = [
    "pdf",
    "txt",
    "doc",
    "docx",
    "dot",
    "dotx",
    "odt",
    "ott",
    "wps",
    "rtf",
    "wpd",
];
const storage = multer_1.default.diskStorage({
    filename: function (_, file, cb) {
        const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
        cb(null, `${file.originalname}-${uniqueSuffix}`);
    },
});
const fileFilter = (_, file, cb) => {
    const fileExtension = node_path_1.default.extname(file.originalname).toLowerCase().slice(1);
    if (!exports.supportedFileTypes.includes(fileExtension)) {
        return cb(new Error(`Unsupported file type: ${file.originalname}. Allowed types: ${exports.supportedFileTypes.join(", ")}`));
    }
    cb(null, true);
};
const upload = (0, multer_1.default)({
    storage,
    dest: node_path_1.default.resolve(__dirname, "public/temp"),
    limits: {
        fileSize: 5 * 1024 * 1024,
        files: 5,
    },
    fileFilter,
});
exports.fileUploader = upload.array("docs", 5);
