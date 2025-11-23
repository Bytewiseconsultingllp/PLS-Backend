import swaggerJsdoc from "swagger-jsdoc";
import { BASEURL } from "../constants/endpoint";

const swaggerDefinition = {
  openapi: "3.0.3",
  info: {
    title: "PLS Backend API Documentation",
    version: "1.0.0",
    description:
      "A comprehensive API documentation for PLS Backend - A freelance platform similar to Fiverr. This API provides endpoints for user management, project management, freelancer services, payments, and more.",
    contact: {
      name: "PLS Backend Team",
      email: "support@plsbackend.com",
    },
    license: {
      name: "MIT",
      url: "https://opensource.org/licenses/MIT",
    },
  },
  servers: [
    {
      url: `http://localhost:${process.env.PORT || 8000}${BASEURL}`,
      description: "Development server",
    },
    {
      url: `https://api.primelogicsol.com${BASEURL}`,
      description: "Production server",
    },
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: "http",
        scheme: "bearer",
        bearerFormat: "JWT",
        description: "Enter your JWT token in the format: Bearer <token>",
      },
      cookieAuth: {
        type: "apiKey",
        in: "cookie",
        name: "accessToken",
        description: "JWT token stored in httpOnly cookie",
      },
    },
    schemas: {
      Error: {
        type: "object",
        properties: {
          success: {
            type: "boolean",
            example: false,
          },
          message: {
            type: "string",
            example: "Error message",
          },
          error: {
            type: "object",
            nullable: true,
          },
        },
      },
      Success: {
        type: "object",
        properties: {
          success: {
            type: "boolean",
            example: true,
          },
          message: {
            type: "string",
            example: "Operation successful",
          },
          data: {
            type: "object",
            nullable: true,
          },
        },
      },
      User: {
        type: "object",
        properties: {
          uid: {
            type: "string",
            format: "uuid",
            description: "Unique user identifier",
          },
          fullName: {
            type: "string",
            example: "John Doe",
          },
          email: {
            type: "string",
            format: "email",
            example: "john.doe@example.com",
          },
          phoneNumber: {
            type: "string",
            example: "+1234567890",
            nullable: true,
          },
          role: {
            type: "string",
            enum: ["CLIENT", "FREELANCER", "ADMIN", "MODERATOR"],
            example: "CLIENT",
          },
          isEmailVerified: {
            type: "boolean",
            example: true,
          },
          isPhoneNumberVerified: {
            type: "boolean",
            example: false,
          },
          createdAt: {
            type: "string",
            format: "date-time",
          },
          updatedAt: {
            type: "string",
            format: "date-time",
          },
        },
      },
      UserRegistration: {
        type: "object",
        required: ["fullName", "email", "password", "phoneNumber"],
        properties: {
          fullName: {
            type: "string",
            example: "John Doe",
            minLength: 3,
            maxLength: 50,
          },
          email: {
            type: "string",
            format: "email",
            example: "john.doe@example.com",
          },
          password: {
            type: "string",
            format: "password",
            example: "SecurePass123!",
            minLength: 8,
            description:
              "Must contain uppercase, lowercase, number, and special character",
          },
          phoneNumber: {
            type: "string",
            example: "+1234567890",
          },
        },
      },
      UserLogin: {
        type: "object",
        required: ["email", "password"],
        properties: {
          email: {
            type: "string",
            format: "email",
            example: "john.doe@example.com",
          },
          password: {
            type: "string",
            format: "password",
            example: "SecurePass123!",
          },
        },
      },
      OTPRequest: {
        type: "object",
        required: ["email"],
        properties: {
          email: {
            type: "string",
            format: "email",
            example: "john.doe@example.com",
          },
        },
      },
      OTPVerification: {
        type: "object",
        required: ["email", "otp"],
        properties: {
          email: {
            type: "string",
            format: "email",
            example: "john.doe@example.com",
          },
          otp: {
            type: "string",
            example: "123456",
            minLength: 6,
            maxLength: 6,
          },
        },
      },
      Blog: {
        type: "object",
        properties: {
          id: {
            type: "string",
            format: "uuid",
          },
          title: {
            type: "string",
            example: "Getting Started with Node.js",
          },
          slug: {
            type: "string",
            example: "getting-started-with-nodejs",
          },
          content: {
            type: "string",
            example: "This is the blog content...",
          },
          isPublic: {
            type: "boolean",
            example: true,
          },
          authorId: {
            type: "string",
            format: "uuid",
          },
          createdAt: {
            type: "string",
            format: "date-time",
          },
          updatedAt: {
            type: "string",
            format: "date-time",
          },
        },
      },
      BlogPost: {
        type: "object",
        required: ["title", "content"],
        properties: {
          title: {
            type: "string",
            example: "Getting Started with Node.js",
            minLength: 5,
            maxLength: 200,
          },
          content: {
            type: "string",
            example: "This is the blog content...",
            minLength: 100,
          },
          isPublic: {
            type: "boolean",
            example: true,
            default: false,
          },
        },
      },
      Project: {
        type: "object",
        properties: {
          id: {
            type: "string",
            format: "uuid",
          },
          title: {
            type: "string",
            example: "E-commerce Website Development",
          },
          slug: {
            type: "string",
            example: "ecommerce-website-development",
          },
          description: {
            type: "string",
            example: "Build a full-featured e-commerce website",
          },
          budget: {
            type: "number",
            example: 5000.0,
          },
          status: {
            type: "string",
            enum: ["PENDING", "IN_PROGRESS", "COMPLETED", "CANCELLED"],
            example: "PENDING",
          },
          isOutsourced: {
            type: "boolean",
            example: false,
          },
          clientId: {
            type: "string",
            format: "uuid",
          },
          createdAt: {
            type: "string",
            format: "date-time",
          },
          updatedAt: {
            type: "string",
            format: "date-time",
          },
        },
      },
      ContactMessage: {
        type: "object",
        required: ["name", "email", "message"],
        properties: {
          name: {
            type: "string",
            example: "John Doe",
            minLength: 2,
            maxLength: 100,
          },
          email: {
            type: "string",
            format: "email",
            example: "john.doe@example.com",
          },
          subject: {
            type: "string",
            example: "Inquiry about services",
            maxLength: 200,
          },
          message: {
            type: "string",
            example: "I would like to know more about your services...",
            minLength: 10,
            maxLength: 2000,
          },
        },
      },
      ConsultationBooking: {
        type: "object",
        required: ["name", "email", "phoneNumber", "preferredDate"],
        properties: {
          name: {
            type: "string",
            example: "John Doe",
          },
          email: {
            type: "string",
            format: "email",
            example: "john.doe@example.com",
          },
          phoneNumber: {
            type: "string",
            example: "+1234567890",
          },
          preferredDate: {
            type: "string",
            format: "date-time",
          },
          message: {
            type: "string",
            example: "I would like to discuss project requirements...",
          },
          status: {
            type: "string",
            enum: ["PENDING", "ACCEPTED", "REJECTED", "COMPLETED"],
            example: "PENDING",
          },
        },
      },
      FreelancerProfile: {
        type: "object",
        properties: {
          id: {
            type: "string",
            format: "uuid",
          },
          username: {
            type: "string",
            example: "john_developer",
            unique: true,
          },
          userId: {
            type: "string",
            format: "uuid",
          },
          skills: {
            type: "array",
            items: {
              type: "string",
            },
            example: ["Node.js", "React", "MongoDB"],
          },
          hourlyRate: {
            type: "number",
            example: 50.0,
          },
          bio: {
            type: "string",
            example: "Full-stack developer with 5 years of experience",
          },
          portfolio: {
            type: "string",
            format: "uri",
            example: "https://portfolio.example.com",
            nullable: true,
          },
        },
      },
      PaymentIntent: {
        type: "object",
        required: ["amount", "currency"],
        properties: {
          amount: {
            type: "number",
            example: 1000,
            description: "Amount in cents (e.g., 1000 = $10.00)",
          },
          currency: {
            type: "string",
            example: "usd",
            default: "usd",
          },
          description: {
            type: "string",
            example: "Payment for project milestone",
          },
        },
      },
      Pagination: {
        type: "object",
        properties: {
          page: {
            type: "integer",
            example: 1,
            minimum: 1,
          },
          limit: {
            type: "integer",
            example: 10,
            minimum: 1,
            maximum: 100,
          },
          total: {
            type: "integer",
            example: 100,
          },
          totalPages: {
            type: "integer",
            example: 10,
          },
        },
      },
    },
    responses: {
      UnauthorizedError: {
        description: "Authentication token is missing or invalid",
        content: {
          "application/json": {
            schema: {
              $ref: "#/components/schemas/Error",
            },
            example: {
              success: false,
              message: "Unauthorized - Invalid or missing token",
            },
          },
        },
      },
      Unauthorized: {
        description: "Authentication token is missing or invalid",
        content: {
          "application/json": {
            schema: {
              $ref: "#/components/schemas/Error",
            },
            example: {
              success: false,
              message: "Unauthorized - Invalid or missing token",
            },
          },
        },
      },
      ForbiddenError: {
        description: "User does not have permission to access this resource",
        content: {
          "application/json": {
            schema: {
              $ref: "#/components/schemas/Error",
            },
            example: {
              success: false,
              message: "Forbidden - Insufficient permissions",
            },
          },
        },
      },
      NotFoundError: {
        description: "The requested resource was not found",
        content: {
          "application/json": {
            schema: {
              $ref: "#/components/schemas/Error",
            },
            example: {
              success: false,
              message: "Resource not found",
            },
          },
        },
      },
      ValidationError: {
        description: "Request validation failed",
        content: {
          "application/json": {
            schema: {
              $ref: "#/components/schemas/Error",
            },
            example: {
              success: false,
              message: "Validation error",
              error: {
                field: "email",
                message: "Invalid email format",
              },
            },
          },
        },
      },
      InternalServerError: {
        description: "Internal server error",
        content: {
          "application/json": {
            schema: {
              $ref: "#/components/schemas/Error",
            },
            example: {
              success: false,
              message: "Internal server error",
            },
          },
        },
      },
    },
    parameters: {
      PageParam: {
        name: "page",
        in: "query",
        description: "Page number for pagination",
        schema: {
          type: "integer",
          minimum: 1,
          default: 1,
        },
      },
      LimitParam: {
        name: "limit",
        in: "query",
        description: "Number of items per page",
        schema: {
          type: "integer",
          minimum: 1,
          maximum: 100,
          default: 10,
        },
      },
      IdParam: {
        name: "id",
        in: "path",
        required: true,
        description: "Resource ID",
        schema: {
          type: "string",
          format: "uuid",
        },
      },
    },
  },
  tags: [
    {
      name: "Health",
      description: "Health check endpoints",
    },
    {
      name: "Authentication",
      description: "User authentication and authorization endpoints",
    },
    {
      name: "Users",
      description: "User management endpoints",
    },
    {
      name: "Blog",
      description: "Blog post management endpoints",
    },
    {
      name: "Consultation",
      description: "Consultation booking endpoints",
    },
    {
      name: "Contact",
      description: "Contact form endpoints",
    },
    {
      name: "Freelancer",
      description: "Freelancer management endpoints",
    },
    {
      name: "Quote",
      description: "Quote request endpoints",
    },
    {
      name: "Hire Us",
      description: "Hiring request endpoints",
    },
    {
      name: "Milestone",
      description: "Project milestone endpoints",
    },
    {
      name: "Navigation",
      description: "Navigation page endpoints",
    },
    {
      name: "Newsletter",
      description: "Newsletter subscription endpoints",
    },
    {
      name: "Payment",
      description: "Payment and Stripe integration endpoints",
    },
    {
      name: "Project Builder",
      description: "Project builder endpoints",
    },
    {
      name: "Project Request",
      description: "Project request endpoints",
    },
    {
      name: "Project",
      description: "Project management endpoints (Legacy system)",
    },
    {
      name: "Client Projects",
      description:
        "Client project management endpoints (NEW system for existing clients)",
    },
    {
      name: "Client Project Draft",
      description:
        "Step-by-step project creation for existing authenticated clients (similar to visitor flow)",
    },
    {
      name: "Trash",
      description: "Trash and soft-delete management endpoints",
    },
    {
      name: "Visitors",
      description: "Visitor tracking endpoints",
    },
    {
      name: "Admin - Moderators",
      description: "Admin endpoints for managing moderators (Admin only)",
    },
    {
      name: "Moderator",
      description: "Moderator endpoints for managing assigned projects",
    },
    {
      name: "Payment Agreements",
      description:
        "Milestone payment agreement management (Admin/Moderator only)",
    },
    {
      name: "KPI - Admin",
      description: "Admin endpoints for assigning KPI points to freelancers",
    },
    {
      name: "KPI - Moderator",
      description:
        "Moderator endpoints for assigning KPI points (assigned projects only)",
    },
    {
      name: "KPI - Client",
      description:
        "Client endpoints for assigning KPI points (their projects only)",
    },
    {
      name: "KPI - Public",
      description: "Public endpoints for viewing KPI data and leaderboard",
    },
    {
      name: "Pricing Management",
      description:
        "Admin endpoints for managing pricing data (service categories, technologies, features)",
    },
    {
      name: "Admin - Projects",
      description:
        "Admin endpoints for managing all projects with comprehensive data (Admin only)",
    },
    {
      name: "Admin - Clients",
      description:
        "Admin endpoints for managing all clients with full details (Admin only)",
    },
    {
      name: "Admin - Freelancers",
      description: "Admin endpoints for managing all freelancers (Admin only)",
    },
    {
      name: "Admin - Payments",
      description:
        "Admin endpoints for listing and managing all payments (Admin only)",
    },
    {
      name: "Reference Data",
      description:
        "Public endpoints for retrieving reference data (enums) such as service categories, industry categories, technology categories, and feature categories. Used by frontend for populating dropdowns and form selectors.",
    },
  ],
};

const options: swaggerJsdoc.Options = {
  swaggerDefinition,
  // Path to API documentation files
  apis: [
    "./src/routers/**/*.ts",
    "./src/controllers/**/*.ts",
    "./src/swagger/**/*.yaml",
    "./src/swagger/**/*.yml",
  ],
};

export const swaggerSpec = swaggerJsdoc(options);
