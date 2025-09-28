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
const asyncHandlerUtils_1 = require("../../utils/asyncHandlerUtils");
const db_1 = require("../../database/db");
const slugStringGeneratorService_1 = require("../../services/slugStringGeneratorService");
const apiResponseUtils_1 = require("../../utils/apiResponseUtils");
const constants_1 = require("../../constants");
exports.default = {
    createBlog: (0, asyncHandlerUtils_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
        const { blogTitle, blogThumbnail, blogOverview, blogBody } = req.body;
        const blogSlug = (0, slugStringGeneratorService_1.generateSlug)(blogTitle);
        const checkIfBlogExist = yield db_1.db.blogPost.findUnique({
            where: { blogSlug },
        });
        if (checkIfBlogExist)
            throw { status: constants_1.BADREQUESTCODE, message: "Blog already exist" };
        yield db_1.db.blogPost.create({
            data: { blogTitle, blogSlug, blogThumbnail, blogOverview, blogBody },
        });
        (0, apiResponseUtils_1.httpResponse)(req, res, constants_1.SUCCESSCODE, constants_1.SUCCESSMSG, {
            optMessage: "Blog uploaded successfully",
        });
    })),
    getSingleBlog: (0, asyncHandlerUtils_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
        const { blogSlug } = req.params;
        if (!blogSlug)
            throw { status: constants_1.BADREQUESTCODE, message: "Blog slug is required" };
        const blog = yield db_1.db.blogPost.findUnique({ where: { blogSlug } });
        if (!blog)
            throw { status: constants_1.NOTFOUNDCODE, message: "Blog not found" };
        (0, apiResponseUtils_1.httpResponse)(req, res, constants_1.SUCCESSCODE, constants_1.SUCCESSMSG, blog);
    })),
    getAllPublicBlog: (0, asyncHandlerUtils_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
        const blogCache = new Map();
        const page = Math.max(1, parseInt(req.query.page) || 1);
        const limit = Math.max(1, parseInt(req.query.limit) || 10);
        const cacheKey = `blogs_page_${page}_limit_${limit}`;
        if (blogCache.has(cacheKey)) {
            (0, apiResponseUtils_1.httpResponse)(req, res, constants_1.SUCCESSCODE, constants_1.SUCCESSMSG, blogCache.get(cacheKey));
        }
        const [blogs, totalBlogs] = yield Promise.all([
            db_1.db.blogPost
                .findMany({
                where: { isPublished: true },
                skip: (page - 1) * limit,
                take: limit,
            })
                .then((res) => {
                if (res.length === 0)
                    throw {
                        status: constants_1.NOTFOUNDCODE,
                        message: "There is no public blog for now",
                    };
                return res;
            }),
            db_1.db.blogPost.count({
                where: { isPublished: true },
            }),
        ]);
        const totalPages = Math.ceil(totalBlogs / limit);
        const hasNextPage = page < totalPages;
        const hasPreviousPage = page > 1;
        const pagination = {
            page,
            limit,
            totalPages,
            totalBlogs,
            hasNextPage,
            hasPreviousPage,
        };
        const response = { blogs, pagination };
        blogCache.set(cacheKey, response);
        (0, apiResponseUtils_1.httpResponse)(req, res, constants_1.SUCCESSCODE, constants_1.SUCCESSMSG, response);
    })),
    getAllPrivateBlogs: (0, asyncHandlerUtils_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
        const blogs = yield db_1.db.blogPost.findMany({ where: { isPublished: false } });
        if (blogs.length === 0)
            throw {
                status: constants_1.NOTFOUNDCODE,
                message: "There is no private blog for now",
            };
        (0, apiResponseUtils_1.httpResponse)(req, res, constants_1.SUCCESSCODE, constants_1.SUCCESSMSG, blogs);
    })),
    updateBlog: (0, asyncHandlerUtils_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
        const { blogSlug } = req.params;
        if (!blogSlug)
            throw { status: constants_1.BADREQUESTCODE, message: "Blog slug is required" };
        const { blogTitle, blogThumbnail, blogOverview, blogBody } = req.body;
        const updatedBlog = yield db_1.db.blogPost
            .update({
            where: { blogSlug },
            data: { blogTitle, blogThumbnail, blogOverview, blogBody },
        })
            .catch(() => {
            throw { status: constants_1.BADREQUESTCODE, message: "Blog not found" };
        });
        (0, apiResponseUtils_1.httpResponse)(req, res, constants_1.SUCCESSCODE, constants_1.SUCCESSMSG, {
            optMessage: "Blog updated successfully",
            updatedBlog,
        });
    })),
    deleteBlog: (0, asyncHandlerUtils_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
        const { blogSlug } = req.params;
        if (!blogSlug)
            throw { status: constants_1.BADREQUESTCODE, message: "Blog slug is required" };
        yield db_1.db.blogPost.delete({ where: { blogSlug } }).catch(() => {
            throw { status: constants_1.NOTFOUNDCODE, message: "Blog not found" };
        });
        (0, apiResponseUtils_1.httpResponse)(req, res, constants_1.SUCCESSCODE, constants_1.SUCCESSMSG, {
            optMessage: "Blog deleted successfully",
        });
    })),
    makeBlogPublicOrPrivate: (0, asyncHandlerUtils_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
        const { blogSlug } = req.params;
        if (!blogSlug)
            throw { status: constants_1.BADREQUESTCODE, message: "Blog slug is required" };
        const { isPublished = true } = req.body;
        const updatedBlog = yield db_1.db.blogPost
            .update({
            where: { blogSlug },
            data: { isPublished },
            select: { isPublished: true },
        })
            .catch(() => {
            throw { status: constants_1.NOTFOUNDCODE, message: "Blog not found" };
        });
        (0, apiResponseUtils_1.httpResponse)(req, res, constants_1.SUCCESSCODE, constants_1.SUCCESSMSG, {
            optMessage: "Blog updated successfully",
            updatedBlog,
        });
    })),
};
