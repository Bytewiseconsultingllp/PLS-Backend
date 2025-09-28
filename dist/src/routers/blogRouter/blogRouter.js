"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.blogRouter = void 0;
const express_1 = require("express");
const blogController_1 = __importDefault(require("../../controllers/blogController/blogController"));
const validationMiddleware_1 = require("../../middlewares/validationMiddleware");
const zod_1 = require("../../validation/zod");
const authMiddleware_1 = __importDefault(require("../../middlewares/authMiddleware"));
exports.blogRouter = (0, express_1.Router)();
exports.blogRouter
    .route("/createBlog")
    .post((0, validationMiddleware_1.validateDataMiddleware)(zod_1.blogPostSchema), authMiddleware_1.default.checkToken, authMiddleware_1.default.checkIfUserIAdminOrModerator, blogController_1.default.createBlog);
exports.blogRouter.route("/getSingleBlog/:blogSlug").get(blogController_1.default.getSingleBlog);
exports.blogRouter.route("/getAllPublicBlogs").get(blogController_1.default.getAllPublicBlog);
exports.blogRouter
    .route("/getAllPrivateBlogs")
    .get(authMiddleware_1.default.checkToken, authMiddleware_1.default.checkIfUserIsAdmin, blogController_1.default.getAllPrivateBlogs);
exports.blogRouter
    .route("/updateBlog/:blogSlug")
    .patch((0, validationMiddleware_1.validateDataMiddleware)(zod_1.blogPostSchema), authMiddleware_1.default.checkToken, authMiddleware_1.default.checkIfUserIAdminOrModerator, blogController_1.default.updateBlog);
exports.blogRouter
    .route("/makeBlogPublicOrPrivate/:blogSlug")
    .patch(authMiddleware_1.default.checkToken, authMiddleware_1.default.checkIfUserIsAdmin, blogController_1.default.makeBlogPublicOrPrivate);
exports.blogRouter
    .route("/deleteBlog/:blogSlug")
    .delete(authMiddleware_1.default.checkToken, authMiddleware_1.default.checkIfUserIsAdmin, blogController_1.default.deleteBlog);
