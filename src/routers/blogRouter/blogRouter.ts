import { Router } from "express";
import multer from "multer";
import blogController from "../../controllers/blogController/blogController";
import { validateDataMiddleware } from "../../middlewares/validationMiddleware";
import { blogPostSchema, bulkBlogUploadSchema } from "../../validation/zod";
import authMiddleware from "../../middlewares/authMiddleware";

// Multer configuration for CSV file uploads
const csvStorage = multer.memoryStorage();
const csvUpload = multer({
  storage: csvStorage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB max file size
  },
  fileFilter: (_, file, cb) => {
    if (
      file.mimetype === "text/csv" ||
      file.mimetype === "application/vnd.ms-excel"
    ) {
      cb(null, true);
    } else {
      cb(new Error("Only CSV files are allowed for file upload"));
    }
  },
});

export const blogRouter: Router = Router();
blogRouter
  .route("/createBlog")
  .post(
    validateDataMiddleware(blogPostSchema),
    authMiddleware.checkToken,
    authMiddleware.checkIfUserIAdminOrModerator,
    blogController.createBlog,
  );
blogRouter.route("/getSingleBlog/:blogSlug").get(blogController.getSingleBlog);
blogRouter.route("/getAllPublicBlogs").get(blogController.getAllPublicBlog);
blogRouter
  .route("/getAllPrivateBlogs")
  .get(
    authMiddleware.checkToken,
    authMiddleware.checkIfUserIsAdmin,
    blogController.getAllPrivateBlogs,
  );
blogRouter
  .route("/updateBlog/:blogSlug")
  .patch(
    validateDataMiddleware(blogPostSchema),
    authMiddleware.checkToken,
    authMiddleware.checkIfUserIAdminOrModerator,
    blogController.updateBlog,
  );
blogRouter
  .route("/makeBlogPublicOrPrivate/:blogSlug")
  .patch(
    authMiddleware.checkToken,
    authMiddleware.checkIfUserIsAdmin,
    blogController.makeBlogPublicOrPrivate,
  );
blogRouter
  .route("/deleteBlog/:blogSlug")
  .delete(
    authMiddleware.checkToken,
    authMiddleware.checkIfUserIsAdmin,
    blogController.deleteBlog,
  );

// Bulk upload route - supports both JSON and CSV
blogRouter.route("/bulkUploadBlogs").post(
  authMiddleware.checkToken,
  authMiddleware.checkIfUserIsAdmin,
  csvUpload.single("file"),
  (req, res, next) => {
    // Only validate JSON requests, skip validation for CSV uploads
    if (!req.file) {
      return validateDataMiddleware(bulkBlogUploadSchema)(req, res, next);
    }
    next();
  },
  blogController.bulkUploadBlogs,
);
