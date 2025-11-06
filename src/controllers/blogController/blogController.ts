import type { Request, Response } from "express";
import { asyncHandler } from "../../utils/asyncHandlerUtils";
import type { TBLOGPOST } from "../../types";
import { db } from "../../database/db";
import { generateSlug } from "../../services/slugStringGeneratorService";
import { httpResponse } from "../../utils/apiResponseUtils";
import {
  BADREQUESTCODE,
  NOTFOUNDCODE,
  SUCCESSCODE,
  SUCCESSMSG,
} from "../../constants";
import { parse } from "csv-parse/sync";

export default {
  //** Create Blog
  createBlog: asyncHandler(async (req: Request, res: Response) => {
    const { blogTitle, blogThumbnail, blogOverview, blogBody } =
      req.body as TBLOGPOST;
    // ** validation is handled by middleware
    const blogSlug = generateSlug(blogTitle);
    const checkIfBlogExist = await db.blogPost.findUnique({
      where: { blogSlug },
    });
    if (checkIfBlogExist)
      throw { status: BADREQUESTCODE, message: "Blog already exist" };
    await db.blogPost.create({
      data: { blogTitle, blogSlug, blogThumbnail, blogOverview, blogBody },
    });
    httpResponse(req, res, SUCCESSCODE, SUCCESSMSG, {
      optMessage: "Blog uploaded successfully",
    });
  }),
  // **  List Single Blog Post
  getSingleBlog: asyncHandler(async (req: Request, res: Response) => {
    const { blogSlug } = req.params;
    if (!blogSlug)
      throw { status: BADREQUESTCODE, message: "Blog slug is required" };
    const blog = await db.blogPost.findUnique({ where: { blogSlug } });
    if (!blog) throw { status: NOTFOUNDCODE, message: "Blog not found" };
    httpResponse(req, res, SUCCESSCODE, SUCCESSMSG, blog);
  }),

  // ** List All Public Blogs Blog Posts
  getAllPublicBlog: asyncHandler(async (req: Request, res: Response) => {
    const blogCache: Map<string, { blogs: TBLOGPOST[]; pagination: unknown }> =
      new Map();
    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const limit = Math.max(1, parseInt(req.query.limit as string) || 10);
    const cacheKey = `blogs_page_${page}_limit_${limit}`;
    if (blogCache.has(cacheKey)) {
      httpResponse(req, res, SUCCESSCODE, SUCCESSMSG, blogCache.get(cacheKey));
    }
    const [blogs, totalBlogs] = await Promise.all([
      db.blogPost
        .findMany({
          where: { isPublished: true },
          skip: (page - 1) * limit,
          take: limit,
        })
        .then((res) => {
          if (res.length === 0)
            throw {
              status: NOTFOUNDCODE,
              message: "There is no public blog for now",
            };
          return res;
        }),
      db.blogPost.count({
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
    httpResponse(req, res, SUCCESSCODE, SUCCESSMSG, response);
  }),

  // ** List all private Blogs
  getAllPrivateBlogs: asyncHandler(async (req: Request, res: Response) => {
    const blogs = await db.blogPost.findMany({ where: { isPublished: false } });
    if (blogs.length === 0)
      throw {
        status: NOTFOUNDCODE,
        message: "There is no private blog for now",
      };
    httpResponse(req, res, SUCCESSCODE, SUCCESSMSG, blogs);
  }),

  // ** Update Blog
  updateBlog: asyncHandler(async (req: Request, res: Response) => {
    const { blogSlug } = req.params;
    if (!blogSlug)
      throw { status: BADREQUESTCODE, message: "Blog slug is required" };
    const { blogTitle, blogThumbnail, blogOverview, blogBody } =
      req.body as TBLOGPOST;
    const updatedBlog = await db.blogPost
      .update({
        where: { blogSlug },
        data: { blogTitle, blogThumbnail, blogOverview, blogBody },
      })
      .catch(() => {
        throw { status: BADREQUESTCODE, message: "Blog not found" };
      });
    httpResponse(req, res, SUCCESSCODE, SUCCESSMSG, {
      optMessage: "Blog updated successfully",
      updatedBlog,
    });
  }),
  // ** Delete Blog
  deleteBlog: asyncHandler(async (req: Request, res: Response) => {
    const { blogSlug } = req.params;
    if (!blogSlug)
      throw { status: BADREQUESTCODE, message: "Blog slug is required" };
    await db.blogPost.delete({ where: { blogSlug } }).catch(() => {
      throw { status: NOTFOUNDCODE, message: "Blog not found" };
    });
    httpResponse(req, res, SUCCESSCODE, SUCCESSMSG, {
      optMessage: "Blog deleted successfully",
    });
  }),
  // ** Make Blog public or Private
  makeBlogPublicOrPrivate: asyncHandler(async (req: Request, res: Response) => {
    const { blogSlug } = req.params;
    if (!blogSlug)
      throw { status: BADREQUESTCODE, message: "Blog slug is required" };
    const { isPublished = true } = req.body as TBLOGPOST;
    const updatedBlog = await db.blogPost
      .update({
        where: { blogSlug },
        data: { isPublished },
        select: { isPublished: true },
      })
      .catch(() => {
        throw { status: NOTFOUNDCODE, message: "Blog not found" };
      });
    httpResponse(req, res, SUCCESSCODE, SUCCESSMSG, {
      optMessage: "Blog updated successfully",
      updatedBlog,
    });
  }),

  // ** Bulk Upload Blogs (JSON and CSV support)
  bulkUploadBlogs: asyncHandler(async (req: Request, res: Response) => {
    let blogsToUpload: TBLOGPOST[] = [];

    // Check if request is CSV file upload
    if (req.file && req.file.mimetype === "text/csv") {
      try {
        const fileContent = req.file.buffer.toString("utf-8");
        /* eslint-disable camelcase */
        const records = parse(fileContent, {
          columns: true,
          skip_empty_lines: true,
          trim: true,
        });
        /* eslint-enable camelcase */

        // Convert CSV records to blog objects
        blogsToUpload = records.map((record: any) => ({
          blogTitle: record.blogTitle || record.title,
          blogThumbnail: record.blogThumbnail || record.thumbnail,
          blogOverview: record.blogOverview || record.overview,
          blogBody: record.blogBody || record.body,
          isPublished:
            record.isPublished === "true" ||
            record.isPublished === true ||
            record.isPublished === "1"
              ? true
              : false,
        }));
      } catch (error) {
        throw {
          status: BADREQUESTCODE,
          message: `CSV parsing error: ${error instanceof Error ? error.message : "Invalid CSV format"}`,
        };
      }
    }
    // Check if request is JSON
    else if (req.body.blogs && Array.isArray(req.body.blogs)) {
      blogsToUpload = req.body.blogs;
    } else {
      throw {
        status: BADREQUESTCODE,
        message:
          "Invalid request format. Please provide either a CSV file or JSON array of blogs",
      };
    }

    if (blogsToUpload.length === 0) {
      throw {
        status: BADREQUESTCODE,
        message: "No blogs to upload. Please provide at least one blog",
      };
    }

    // Process each blog and track results
    const results = {
      successful: [] as Array<{
        blogTitle: string;
        blogSlug: string;
        isPublished: boolean;
      }>,
      failed: [] as Array<{ blogTitle: string; reason: string }>,
      skipped: [] as Array<{ blogTitle: string; reason: string }>,
    };

    for (const blog of blogsToUpload) {
      try {
        // Validate required fields
        if (
          !blog.blogTitle ||
          !blog.blogThumbnail ||
          !blog.blogOverview ||
          !blog.blogBody
        ) {
          results.failed.push({
            blogTitle: blog.blogTitle || "Untitled",
            reason: "Missing required fields",
          });
          continue;
        }

        const blogSlug = generateSlug(blog.blogTitle);

        // Check if blog already exists
        const existingBlog = await db.blogPost.findUnique({
          where: { blogSlug },
        });

        if (existingBlog) {
          results.skipped.push({
            blogTitle: blog.blogTitle,
            reason: "Blog with this title already exists",
          });
          continue;
        }

        // Create the blog with isPublished defaulting to false if not provided
        const createdBlog = await db.blogPost.create({
          data: {
            blogTitle: blog.blogTitle,
            blogSlug,
            blogThumbnail: blog.blogThumbnail,
            blogOverview: blog.blogOverview,
            blogBody: blog.blogBody,
            isPublished: blog.isPublished ?? false,
          },
          select: {
            blogTitle: true,
            blogSlug: true,
            isPublished: true,
          },
        });

        results.successful.push(createdBlog);
      } catch (error) {
        results.failed.push({
          blogTitle: blog.blogTitle || "Untitled",
          reason:
            error instanceof Error ? error.message : "Unknown error occurred",
        });
      }
    }

    // Prepare summary
    const summary = {
      totalProcessed: blogsToUpload.length,
      successCount: results.successful.length,
      failedCount: results.failed.length,
      skippedCount: results.skipped.length,
    };

    httpResponse(req, res, SUCCESSCODE, SUCCESSMSG, {
      optMessage: `Bulk upload completed. ${summary.successCount} blogs uploaded successfully, ${summary.skippedCount} skipped, ${summary.failedCount} failed`,
      summary,
      details: results,
    });
  }),
};
