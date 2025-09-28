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
Object.defineProperty(exports, "__esModule", { value: true });
const db_1 = require("../../database/db");
const asyncHandlerUtils_1 = require("../../utils/asyncHandlerUtils");
const apiResponseUtils_1 = require("../../utils/apiResponseUtils");
const constants_1 = require("../../constants");
const slugStringGeneratorService_1 = require("../../services/slugStringGeneratorService");
const createMenuItem = (item_1, ...args_1) => __awaiter(void 0, [item_1, ...args_1], void 0, function* (item, parentId = null) {
    var _a, _b, _c;
    const slug = (0, slugStringGeneratorService_1.generateSlug)(item.title);
    const existingItem = yield db_1.db.menuItem.findUnique({ where: { slug } });
    if (existingItem)
        throw {
            BADREQUESTCODE: constants_1.BADREQUESTCODE,
            message: `Navigation page with title ${item.title} already exists`,
        };
    const createdItem = yield db_1.db.menuItem.create({
        data: {
            title: item.title,
            description: (_a = item.description) !== null && _a !== void 0 ? _a : null,
            href: (_b = item.href) !== null && _b !== void 0 ? _b : null,
            image: (_c = item.image) !== null && _c !== void 0 ? _c : null,
            slug: `${slug}_${(0, slugStringGeneratorService_1.generateRandomStrings)(5)}`,
            parentId,
        },
    });
    if (item.children && item.children.length > 0) {
        for (const child of item.children) {
            yield createMenuItem(child, createdItem.id);
        }
    }
});
exports.default = {
    createNavigationPage: (0, asyncHandlerUtils_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
        const data = req.body;
        if (!data.title)
            throw { status: 400, message: "Navigation page title is required" };
        yield createMenuItem(data);
        (0, apiResponseUtils_1.httpResponse)(req, res, constants_1.SUCCESSCODE, constants_1.SUCCESSMSG, {
            message: "Navigation page created successfully",
        });
    })),
    getSingleNavigationPage: (0, asyncHandlerUtils_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
        const { id } = req.params;
        if (!id)
            throw { status: 400, message: "Navigation page ID is required" };
        const menuItem = yield db_1.db.menuItem.findUnique({
            where: { id: Number(id) },
            include: { children: true },
        });
        if (!menuItem)
            throw { status: 404, message: "Navigation page not found" };
        (0, apiResponseUtils_1.httpResponse)(req, res, constants_1.SUCCESSCODE, constants_1.SUCCESSMSG, menuItem);
    })),
    getAllNavigationPages: (0, asyncHandlerUtils_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
        const menuItems = yield db_1.db.menuItem.findMany({
            where: { trashedAt: null },
            include: { children: true },
        });
        if (!menuItems || menuItems.length === 0)
            throw { status: 404, message: "No navigation pages found" };
        (0, apiResponseUtils_1.httpResponse)(req, res, constants_1.SUCCESSCODE, constants_1.SUCCESSMSG, menuItems);
    })),
    updateNavigationPage: (0, asyncHandlerUtils_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
        var _a, _b, _c;
        const { id } = req.params;
        const data = req.body;
        if (!id)
            throw { status: 400, message: "Navigation page ID is required" };
        if (!data)
            throw { status: 400, message: "Navigation page data is required" };
        if (typeof data !== "object")
            throw { status: 400, message: "Data must be an object" };
        const updatedMenuItem = yield db_1.db.menuItem.update({
            where: { id: Number(id) },
            data: {
                title: data.title,
                description: (_a = data.description) !== null && _a !== void 0 ? _a : null,
                href: (_b = data.href) !== null && _b !== void 0 ? _b : null,
                image: (_c = data.image) !== null && _c !== void 0 ? _c : null,
            },
        });
        (0, apiResponseUtils_1.httpResponse)(req, res, constants_1.SUCCESSCODE, constants_1.SUCCESSMSG, updatedMenuItem);
    })),
    deleteNavigationPage: (0, asyncHandlerUtils_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
        const { id } = req.params;
        if (!id)
            throw { status: 400, message: "Navigation page ID is required" };
        yield db_1.db.menuItem.delete({ where: { id: Number(id) } });
        (0, apiResponseUtils_1.httpResponse)(req, res, constants_1.SUCCESSCODE, constants_1.SUCCESSMSG, {
            message: "Navigation page deleted successfully",
        });
    })),
    trashNavigationPage: (0, asyncHandlerUtils_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
        var _a;
        const uid = (_a = req.userFromToken) === null || _a === void 0 ? void 0 : _a.uid;
        const { id } = req.params;
        if (!id)
            throw { status: 400, message: "Navigation page ID is required" };
        if (!uid)
            throw { status: 400, message: "User ID is required" };
        const user = yield db_1.db.user.findUnique({ where: { uid, trashedAt: null } });
        if (!user)
            throw { status: 404, message: "User not found" };
        const trashedMenuItem = yield db_1.db.menuItem.update({
            where: { id: Number(id) },
            data: {
                trashedBy: `@${user.username}-${user.fullName}-${user.role}`,
                trashedAt: new Date(),
            },
        });
        (0, apiResponseUtils_1.httpResponse)(req, res, constants_1.SUCCESSCODE, constants_1.SUCCESSMSG, trashedMenuItem);
    })),
    untrashNavigationPage: (0, asyncHandlerUtils_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
        const { id } = req.params;
        if (!id)
            throw { status: 400, message: "Navigation page ID is required" };
        const untrashedMenuItem = yield db_1.db.menuItem.update({
            where: { id: Number(id) },
            data: { trashedBy: null, trashedAt: null },
        });
        (0, apiResponseUtils_1.httpResponse)(req, res, constants_1.SUCCESSCODE, constants_1.SUCCESSMSG, untrashedMenuItem);
    })),
    addChildrenToMenuItem: (0, asyncHandlerUtils_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
        var _a, _b, _c;
        const { id } = req.params;
        const children = req.body;
        if (!id)
            throw { status: 400, message: "Parent menu item ID is required" };
        if (!children)
            throw { status: 400, message: "Children data is required" };
        const parentMenuItem = yield db_1.db.menuItem.findUnique({
            where: { id: Number(id) },
        });
        if (!parentMenuItem)
            throw { status: 400, message: "Parent menu item does not exist" };
        const childrenArray = Array.isArray(children) ? children : [children];
        const processedChildren = childrenArray.map((child) => {
            if (!child.title)
                throw { status: 400, message: "Child title is required" };
            return Object.assign(Object.assign({}, child), { parentId: Number(id), slug: `${(0, slugStringGeneratorService_1.generateSlug)(child.title)}-${Math.random().toString(36).substring(2, 8)}` });
        });
        for (const child of processedChildren) {
            yield db_1.db.menuItem.create({
                data: {
                    title: child.title,
                    description: (_a = child.description) !== null && _a !== void 0 ? _a : null,
                    href: (_b = child.href) !== null && _b !== void 0 ? _b : null,
                    image: (_c = child.image) !== null && _c !== void 0 ? _c : null,
                    slug: `${(0, slugStringGeneratorService_1.generateSlug)(child.title)}_${(0, slugStringGeneratorService_1.generateRandomStrings)(5)}`,
                    parentId: child.parentId,
                },
            });
        }
        (0, apiResponseUtils_1.httpResponse)(req, res, constants_1.SUCCESSCODE, constants_1.SUCCESSMSG, {
            message: "Children added successfully",
        });
    })),
};
