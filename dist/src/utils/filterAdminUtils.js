"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.filterClientEmail = exports.filterFreelanserEmail = exports.filterAdminTest = exports.filterAdmin = void 0;
const config_1 = require("../config/config");
const WHITELISTMAILS = JSON.parse(config_1.WHITE_LIST_MAILS);
const filterAdmin = (email) => {
    return WHITELISTMAILS.includes(email);
};
exports.filterAdmin = filterAdmin;
const filterAdminTest = (email) => {
    return email.endsWith("@admin.com");
};
exports.filterAdminTest = filterAdminTest;
const filterFreelanserEmail = (email) => {
    return email.endsWith("@freelancer.com");
};
exports.filterFreelanserEmail = filterFreelanserEmail;
const filterClientEmail = (email) => {
    return email.endsWith("@client.com");
};
exports.filterClientEmail = filterClientEmail;
