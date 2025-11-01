import nodemailer from "nodemailer";
import fs from "fs";
import path from "path";
import { ENV, HOST_EMAIL, HOST_EMAIL_SECRET } from "../config/config";
import {
  COMPANY_NAME,
  INTERNALSERVERERRORCODE,
  INTERNALSERVERERRORMSG,
} from "../constants";
import logger from "../utils/loggerUtils";
import { generateRandomStrings } from "../utils/slugStringGeneratorUtils";

const transporter = nodemailer.createTransport({
  service: "gmail",
  host: "smtp.gmail.com",
  port: 587,
  secure: false, // true for 465, false for other ports
  auth: {
    user: HOST_EMAIL,
    pass: HOST_EMAIL_SECRET, // Use App Password for Gmail
  },
  tls: {
    rejectUnauthorized: false,
  },
});

export async function gloabalMailMessage(
  to: string,
  message?: string | null,
  subject?: string,
  header?: string,
  addsOn?: string,
  senderIntro?: string,
) {
  //Log in development but still send the email
  if (ENV == "DEVELOPMENT") {
    logger.info(`[DEV MODE] Sending test email to ${to}`);
    // Email will still be sent
  }

  const htmlTemplate = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; margin: 0; padding: 20px; }
        .container { max-width: 600px; margin: 0 auto; }
        .header { background: #f4f4f4; padding: 20px; text-align: center; }
        .content { padding: 20px; }
        .footer { font-size: 12px; color: #666; text-align: center; padding: 20px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h2>${header || ""}</h2>
        </div>
        <div class="content">
          <p>${senderIntro || ""}</p>
          <p>${message || ""}</p>
          <p>${addsOn || ""}</p>
        </div>
        <div class="footer">
          <p>${COMPANY_NAME || "Prime Logic Solutions"}</p>
        </div>
      </div>
    </body>
    </html>
  `;

  const randomStr = generateRandomStrings(10);
  const mailOptions = {
    from: HOST_EMAIL,
    to: to,
    subject: subject ?? COMPANY_NAME,
    html: htmlTemplate,
    headers: {
      "X-Auto-Response-Suppress": "All",
      Precedence: "bulk",
      "Auto-Submitted": "auto-generated",
      "Message-ID": `<${randomStr}.dev>`,
    },
    replyTo: "support@primelogicsole.com",
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    logger.info(`Email message sent successfully: ${info.response}`);
  } catch (error) {
    if (error instanceof Error) {
      logger.error(`Error Email message sending :${error.message}`);
      throw {
        status: INTERNALSERVERERRORCODE,
        message: INTERNALSERVERERRORMSG,
      };
    }
    logger.error(`Error sending Email message:${error as string}`);
    throw { status: INTERNALSERVERERRORCODE, message: INTERNALSERVERERRORMSG };
  }
}

/**
 * Send email using a custom HTML template with variable replacement
 * @param to - Recipient email address
 * @param subject - Email subject
 * @param templateName - Name of the HTML template file (without extension)
 * @param variables - Object with template variables to replace
 */
export async function sendTemplatedEmail(
  to: string,
  subject: string,
  templateName: string,
  variables: Record<string, string>,
) {
  // Log in development but still send the email
  if (ENV === "DEVELOPMENT") {
    logger.info(
      `[DEV MODE] Sending test email to ${to} with template ${templateName}`,
    );
    // Email will still be sent
  }

  try {
    // Load the HTML template
    const templatePath = path.join(
      __dirname,
      "..",
      "templates",
      `${templateName}.html`,
    );

    if (!fs.existsSync(templatePath)) {
      throw new Error(`Email template not found: ${templateName}`);
    }

    let htmlContent = fs.readFileSync(templatePath, "utf-8");

    // Replace all template variables
    Object.keys(variables).forEach((key) => {
      const placeholder = `{{${key}}}`;
      htmlContent = htmlContent.replace(
        new RegExp(placeholder, "g"),
        variables[key] || "",
      );
    });

    // Clean up any remaining unreplaced variables
    htmlContent = htmlContent.replace(/\{\{[^}]+\}\}/g, "");

    // Generate unique message ID
    const randomStr = generateRandomStrings(10);

    const mailOptions = {
      from: HOST_EMAIL,
      to: to,
      subject: subject,
      html: htmlContent,
      headers: {
        "X-Auto-Response-Suppress": "All",
        Precedence: "bulk",
        "Auto-Submitted": "auto-generated",
        "Message-ID": `<${randomStr}.freelancer>`,
      },
      replyTo: "support@primelogicsole.com",
    };

    const info = await transporter.sendMail(mailOptions);
    logger.info(`Templated email sent successfully to ${to}: ${info.response}`);
    return info;
  } catch (error) {
    if (error instanceof Error) {
      logger.error(`Error sending templated email: ${error.message}`);
      throw {
        status: INTERNALSERVERERRORCODE,
        message: INTERNALSERVERERRORMSG,
      };
    }
    logger.error(`Error sending templated email: ${error as string}`);
    throw { status: INTERNALSERVERERRORCODE, message: INTERNALSERVERERRORMSG };
  }
}

/**
 * Helper functions for freelancer emails
 */

// Send registration confirmation email
export async function sendFreelancerRegistrationEmail(
  to: string,
  freelancerName: string,
  primaryDomain: string,
) {
  const variables = {
    FREELANCER_NAME: freelancerName,
    FREELANCER_EMAIL: to,
    PRIMARY_DOMAIN: primaryDomain,
    REGISTRATION_DATE: new Date().toLocaleDateString(),
  };

  return sendTemplatedEmail(
    to,
    "Thank You for Registering - Application Under Review",
    "freelancerRegistrationConfirmation",
    variables,
  );
}

// Send acceptance email with credentials
export async function sendFreelancerAcceptanceEmail(
  to: string,
  freelancerName: string,
  username: string,
  tempPassword: string,
  loginUrl: string = "https://yourplatform.com/login",
) {
  const variables = {
    FREELANCER_NAME: freelancerName,
    USERNAME: username,
    TEMP_PASSWORD: tempPassword,
    EMAIL: to,
    LOGIN_URL: loginUrl,
  };

  return sendTemplatedEmail(
    to,
    "🎉 Congratulations! Your Application is Accepted",
    "freelancerAcceptanceWithCredentials",
    variables,
  );
}

// Send rejection email
export async function sendFreelancerRejectionEmail(
  to: string,
  freelancerName: string,
  rejectionReason?: string,
) {
  const variables = {
    FREELANCER_NAME: freelancerName,
    REJECTION_REASON: rejectionReason || "",
  };

  return sendTemplatedEmail(
    to,
    "Application Status Update",
    "freelancerRejection",
    variables,
  );
}

// ============================================
// MODERATOR EMAIL FUNCTIONS
// ============================================

/**
 * Send moderator account credentials
 */
export async function sendModeratorCredentials(
  to: string,
  moderatorName: string,
  username: string,
  tempPassword: string,
) {
  const loginUrl = process.env.FRONTEND_URL || "http://localhost:3000/login";

  const variables = {
    MODERATOR_NAME: moderatorName,
    USERNAME: username,
    TEMP_PASSWORD: tempPassword,
    EMAIL: to,
    LOGIN_URL: loginUrl,
  };

  return sendTemplatedEmail(
    to,
    "Your Moderator Account - Login Credentials",
    "moderatorAccountCreated",
    variables,
  );
}

/**
 * Send project assignment notification to moderator
 */
export async function sendProjectAssignmentNotification(
  to: string,
  moderatorName: string,
  companyName: string,
  projectUrl: string,
) {
  // Format the created date
  const projectCreatedDate = new Date().toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const variables = {
    MODERATOR_NAME: moderatorName,
    COMPANY_NAME: companyName,
    CLIENT_NAME: companyName, // Using company name as fallback
    CLIENT_EMAIL: "", // Will be filled from project details if available
    PROJECT_CREATED_DATE: projectCreatedDate,
    PROJECT_URL: projectUrl,
  };

  return sendTemplatedEmail(
    to,
    "New Project Assignment",
    "moderatorProjectAssigned",
    variables,
  );
}

export const globalMailService = {
  gloabalMailMessage,
  sendTemplatedEmail,
  sendFreelancerRegistrationEmail,
  sendFreelancerAcceptanceEmail,
  sendFreelancerRejectionEmail,
  sendModeratorCredentials,
  sendProjectAssignmentNotification,
};
