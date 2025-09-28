"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.replaceAllPlaceholders = replaceAllPlaceholders;
function replaceAllPlaceholders(template, placeholders) {
    let modifiedTemplate = template;
    for (const [key, value] of Object.entries(placeholders)) {
        const regex = new RegExp(`{{\\s*${key}\\s*}}`, "g");
        modifiedTemplate = modifiedTemplate.replace(regex, value || "");
    }
    return modifiedTemplate;
}
