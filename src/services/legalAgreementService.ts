/* eslint-disable camelcase */
import PDFDocument from "pdfkit";
import { v2 as cloudinary } from "cloudinary";
import {
  CLOUDINARY_API_KEY,
  CLOUDINARY_API_SECRET,
  CLOUDINARY_NAME,
} from "../config/config";
import { INTERNALSERVERERRORCODE } from "../constants";
import { gloabalMailMessage } from "./globalMailService";
import logger from "../utils/loggerUtils";

// Configure Cloudinary
cloudinary.config({
  cloud_name: CLOUDINARY_NAME,
  api_key: CLOUDINARY_API_KEY,
  api_secret: CLOUDINARY_API_SECRET,
});

// Agreement version - update this when you change agreement terms
const CURRENT_AGREEMENT_VERSION = "1.0";

// Agreement types
// eslint-disable-next-line no-unused-vars
export enum AgreementType {
  // eslint-disable-next-line no-unused-vars
  CLIENT_SERVICE = "CLIENT_SERVICE_AGREEMENT",
  // eslint-disable-next-line no-unused-vars
  FREELANCER_PLATFORM = "FREELANCER_PLATFORM_AGREEMENT",
}

// Base interface for agreement data
interface BaseAgreementData {
  recipientName: string;
  recipientEmail: string;
  ipAddress: string;
  userAgent: string;
  acceptedAt: Date;
}

// Client-specific agreement data
export interface ClientServiceAgreementData extends BaseAgreementData {
  estimatedPriceMin: number;
  estimatedPriceMax: number;
}

// Freelancer-specific agreement data
export interface FreelancerPlatformAgreementData extends BaseAgreementData {
  country: string;
}

/**
 * Legal Agreement Service
 * Handles generation, storage, and distribution of legal agreements
 * Reusable for multiple agreement types (Client, Freelancer, etc.)
 */
class LegalAgreementService {
  /**
   * Main method to create and store agreement
   */
  async createAndStoreAgreement(
    agreementType: AgreementType,
    data: ClientServiceAgreementData | FreelancerPlatformAgreementData,
  ): Promise<{
    documentUrl: string;
    agreementVersion: string;
    documentHash: string;
    pdfBase64: string;
    fileName: string;
  }> {
    try {
      // 1. Generate PDF based on agreement type
      const pdfBuffer = await this.generateAgreementPDF(agreementType, data);

      // 2. Upload to Cloudinary and get back both URL and filename
      const { documentUrl, fileName } = await this.uploadToCloudinary(
        pdfBuffer,
        agreementType,
        data.recipientEmail,
      );

      // 3. Send email with copy
      await this.sendAgreementEmail(
        data.recipientEmail,
        data.recipientName,
        documentUrl,
        agreementType,
      );

      // 4. Generate document hash for tamper detection
      const documentHash = this.generateDocumentHash(pdfBuffer);

      // 5. Convert PDF to base64 for frontend download
      const pdfBase64 = pdfBuffer.toString("base64");

      return {
        documentUrl,
        agreementVersion: CURRENT_AGREEMENT_VERSION,
        documentHash,
        pdfBase64,
        fileName,
      };
    } catch (error) {
      logger.error("Error in createAndStoreAgreement:", error);
      throw {
        status: INTERNALSERVERERRORCODE,
        message: `Failed to create agreement: ${error instanceof Error ? error.message : "Unknown error"}`,
      };
    }
  }

  /**
   * Generate PDF based on agreement type
   */
  private async generateAgreementPDF(
    agreementType: AgreementType,
    data: ClientServiceAgreementData | FreelancerPlatformAgreementData,
  ): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      try {
        const doc = new PDFDocument({
          size: "A4",
          margins: { top: 50, bottom: 50, left: 50, right: 50 },
        });

        const chunks: Buffer[] = [];

        doc.on("data", (chunk) => chunks.push(chunk));
        doc.on("end", () => resolve(Buffer.concat(chunks)));
        doc.on("error", reject);

        // Generate appropriate template
        if (agreementType === AgreementType.CLIENT_SERVICE) {
          this.generateClientServiceAgreement(
            doc,
            data as ClientServiceAgreementData,
          );
        } else if (agreementType === AgreementType.FREELANCER_PLATFORM) {
          this.generateFreelancerPlatformAgreement(
            doc,
            data as FreelancerPlatformAgreementData,
          );
        }

        doc.end();
      } catch (error) {
        // eslint-disable-next-line @typescript-eslint/prefer-promise-reject-errors
        reject(error);
      }
    });
  }

  /**
   * Generate Client Service Agreement PDF
   */
  private generateClientServiceAgreement(
    doc: PDFKit.PDFDocument,
    data: ClientServiceAgreementData,
  ): void {
    const primaryColor = "#007aff";
    const textColor = "#333333";
    const lightGray = "#666666";

    // Header
    doc
      .fontSize(24)
      .fillColor(primaryColor)
      .text("SERVICE AGREEMENT", { align: "center" });

    doc.moveDown(0.5);
    doc
      .fontSize(10)
      .fillColor(lightGray)
      .text(`Agreement Version ${CURRENT_AGREEMENT_VERSION}`, {
        align: "center",
      });

    doc.moveDown(1.5);

    // Introduction
    doc
      .fontSize(11)
      .fillColor(textColor)
      .text(
        `This Service Agreement ("Agreement") is entered into as of ${this.formatDate(data.acceptedAt)} between:`,
      );

    doc.moveDown(0.5);
    doc
      .fontSize(10)
      .text(`Client: ${data.recipientName} ("Client", "you", or "your")`, {
        indent: 20,
      });
    doc.text(
      `Service Provider: Prime Logic Solutions ("Company", "we", "us", or "our")`,
      {
        indent: 20,
      },
    );

    doc.moveDown(1);

    // Estimated Pricing
    doc
      .fontSize(12)
      .fillColor(primaryColor)
      .text("1. PROJECT ESTIMATE", { underline: true });
    doc.moveDown(0.5);
    doc
      .fontSize(10)
      .fillColor(textColor)
      .text(
        `The estimated cost for the services described in your project specifications is:`,
      );
    doc.moveDown(0.5);
    doc
      .fontSize(14)
      .fillColor(primaryColor)
      .text(
        `$${this.formatCurrency(data.estimatedPriceMin)} - $${this.formatCurrency(data.estimatedPriceMax)}`,
        { align: "center" },
      );
    doc.moveDown(0.5);
    doc
      .fontSize(9)
      .fillColor(lightGray)
      .text(
        "This is an estimate based on the project requirements you provided. Final pricing may vary based on actual scope.",
        { align: "center" },
      );

    doc.moveDown(1.5);

    // Services
    doc
      .fontSize(12)
      .fillColor(primaryColor)
      .text("2. SERVICES", { underline: true });
    doc.moveDown(0.5);
    doc
      .fontSize(10)
      .fillColor(textColor)
      .text(
        `Company agrees to provide software development and related services as outlined in the project specifications you submitted through our platform. Services will be performed in a professional manner consistent with industry standards.`,
      );

    doc.moveDown(1);

    // Payment Terms
    doc
      .fontSize(12)
      .fillColor(primaryColor)
      .text("3. PAYMENT TERMS", { underline: true });
    doc.moveDown(0.5);
    doc.fontSize(10).fillColor(textColor);
    doc.text("3.1. Payment is due in full upfront before work commences.");
    doc.text(
      "3.2. Payment must be made through our secure payment processor (Stripe).",
    );
    doc.text(
      "3.3. All payments are in United States Dollars (USD) unless otherwise specified.",
    );
    doc.text(
      "3.4. Client is responsible for any payment processing fees, taxes, or wire transfer charges.",
    );

    doc.moveDown(1);

    // Refund Policy
    doc
      .fontSize(12)
      .fillColor(primaryColor)
      .text("4. REFUND POLICY", { underline: true });
    doc.moveDown(0.5);
    doc
      .fontSize(10)
      .fillColor(textColor)
      .text(
        `All sales are final. No refunds will be provided once payment has been processed and work has commenced. By accepting this agreement, you acknowledge and agree to this no-refund policy.`,
      );

    doc.moveDown(1);

    // Timeline
    doc
      .fontSize(12)
      .fillColor(primaryColor)
      .text("5. TIMELINE & DELIVERABLES", { underline: true });
    doc.moveDown(0.5);
    doc.fontSize(10).fillColor(textColor);
    doc.text(
      "5.1. Project timeline will be established based on your selected delivery option (Standard, Priority, Accelerated, etc.).",
    );
    doc.text(
      "5.2. Company will make reasonable efforts to meet agreed-upon deadlines but timelines are estimates, not guarantees.",
    );
    doc.text(
      "5.3. Delays caused by Client (late feedback, requirement changes, etc.) may extend the timeline.",
    );
    doc.text(
      "5.4. Deliverables will be provided as outlined in the project specifications.",
    );

    doc.moveDown(1);

    // Add new page for remaining sections
    doc.addPage();

    // Intellectual Property
    doc
      .fontSize(12)
      .fillColor(primaryColor)
      .text("6. INTELLECTUAL PROPERTY OWNERSHIP", { underline: true });
    doc.moveDown(0.5);
    doc.fontSize(10).fillColor(textColor);
    doc.text(
      "6.1. Upon receipt of full payment, all intellectual property rights in the custom work product created specifically for Client shall transfer to Client.",
    );
    doc.text(
      "6.2. Company retains ownership of any pre-existing materials, frameworks, libraries, or tools used in the project.",
    );
    doc.text(
      "6.3. Company may use the project for portfolio purposes unless Client requests otherwise in writing.",
    );
    doc.text(
      "6.4. Client grants Company a license to use Client's trademarks solely for portfolio and promotional purposes.",
    );

    doc.moveDown(1);

    // Liability Limitations
    doc
      .fontSize(12)
      .fillColor(primaryColor)
      .text("7. LIMITATION OF LIABILITY", { underline: true });
    doc.moveDown(0.5);
    doc.fontSize(10).fillColor(textColor);
    doc.text(
      "7.1. Company's total liability for any claims arising from this agreement shall not exceed the amount paid by Client.",
    );
    doc.text(
      "7.2. Company shall not be liable for any indirect, incidental, consequential, or punitive damages.",
    );
    doc.text(
      "7.3. Company does not warrant that the software will be error-free or uninterrupted.",
    );
    doc.text(
      "7.4. Client is responsible for maintaining backups and testing software before deployment.",
    );

    doc.moveDown(1);

    // Warranties
    doc
      .fontSize(12)
      .fillColor(primaryColor)
      .text("8. WARRANTIES", { underline: true });
    doc.moveDown(0.5);
    doc.fontSize(10).fillColor(textColor);
    doc.text(
      "8.1. Company warrants that it has the right to enter into this agreement and provide the services.",
    );
    doc.text(
      "8.2. Company warrants that services will be performed in a professional manner.",
    );
    doc.text(
      `8.3. EXCEPT AS EXPRESSLY PROVIDED, SERVICES ARE PROVIDED "AS IS" WITHOUT WARRANTY OF ANY KIND.`,
    );
    doc.text(
      "8.4. Client warrants that all information provided is accurate and that Client has authority to enter this agreement.",
    );

    doc.moveDown(1);

    // Dispute Resolution
    doc
      .fontSize(12)
      .fillColor(primaryColor)
      .text("9. DISPUTE RESOLUTION & GOVERNING LAW", { underline: true });
    doc.moveDown(0.5);
    doc.fontSize(10).fillColor(textColor);
    doc.text(
      "9.1. This Agreement shall be governed by the laws of the United States and the state where Company is registered.",
    );
    doc.text(
      "9.2. Any disputes arising from this Agreement shall first be attempted to be resolved through good faith negotiation.",
    );
    doc.text(
      "9.3. If negotiation fails, disputes shall be resolved through binding arbitration in accordance with the American Arbitration Association rules.",
    );
    doc.text(
      "9.4. Each party shall bear its own costs and attorneys' fees unless otherwise awarded by the arbitrator.",
    );

    doc.moveDown(1);

    // Confidentiality
    doc
      .fontSize(12)
      .fillColor(primaryColor)
      .text("10. CONFIDENTIALITY", { underline: true });
    doc.moveDown(0.5);
    doc.fontSize(10).fillColor(textColor);
    doc.text(
      "10.1. Both parties agree to keep confidential any proprietary information disclosed during the course of this engagement.",
    );
    doc.text(
      "10.2. This obligation survives termination of this Agreement for a period of three (3) years.",
    );
    doc.text(
      "10.3. Confidential information does not include information that is publicly available or independently developed.",
    );

    doc.moveDown(1);

    // Termination
    doc
      .fontSize(12)
      .fillColor(primaryColor)
      .text("11. TERMINATION", { underline: true });
    doc.moveDown(0.5);
    doc.fontSize(10).fillColor(textColor);
    doc.text(
      "11.1. Either party may terminate this agreement for material breach with 15 days written notice.",
    );
    doc.text(
      "11.2. Upon termination, Client shall pay for all work completed up to the termination date.",
    );
    doc.text(
      "11.3. Company will deliver all completed work product upon receipt of payment.",
    );

    doc.moveDown(1);

    // Platform Terms
    doc
      .fontSize(12)
      .fillColor(primaryColor)
      .text("12. PLATFORM TERMS & CONDITIONS", { underline: true });
    doc.moveDown(0.5);
    doc.fontSize(10).fillColor(textColor);
    doc.text(
      "12.1. Client agrees to comply with all platform rules, guidelines, and policies.",
    );
    doc.text(
      "12.2. Client agrees not to circumvent the platform to avoid fees or obligations.",
    );
    doc.text(
      "12.3. Company reserves the right to update platform terms with notice to users.",
    );
    doc.text(
      "12.4. Client account may be suspended or terminated for violation of platform terms.",
    );

    doc.moveDown(1.5);

    // Entire Agreement
    doc
      .fontSize(12)
      .fillColor(primaryColor)
      .text("13. ENTIRE AGREEMENT", { underline: true });
    doc.moveDown(0.5);
    doc
      .fontSize(10)
      .fillColor(textColor)
      .text(
        "This Agreement constitutes the entire agreement between the parties and supersedes all prior negotiations, representations, or agreements. This Agreement may only be amended in writing signed by both parties.",
      );

    doc.moveDown(2);

    // Acceptance Footer
    doc
      .rect(50, doc.y, doc.page.width - 100, 100)
      .fillAndStroke("#f0f8ff", primaryColor);

    doc
      .fontSize(11)
      .fillColor(primaryColor)
      .text("ELECTRONIC ACCEPTANCE", 50, doc.y + 15, {
        align: "center",
        width: doc.page.width - 100,
      });

    doc.moveDown(0.5);
    doc
      .fontSize(9)
      .fillColor(textColor)
      .text(
        `Accepted by: ${data.recipientName}
Email: ${data.recipientEmail}
Date & Time: ${this.formatDateTime(data.acceptedAt)}
IP Address: ${data.ipAddress}
User Agent: ${data.userAgent.substring(0, 80)}...`,
        { align: "center", width: doc.page.width - 100 },
      );

    doc.moveDown(1);

    // Footer
    doc
      .fontSize(8)
      .fillColor(lightGray)
      .text(
        "Prime Logic Solutions | support@primelogicsol.com",
        50,
        doc.page.height - 50,
        {
          align: "center",
          width: doc.page.width - 100,
        },
      );
  }

  /**
   * Generate Freelancer Platform Agreement PDF
   */
  private generateFreelancerPlatformAgreement(
    doc: PDFKit.PDFDocument,
    data: FreelancerPlatformAgreementData,
  ): void {
    const primaryColor = "#007aff";
    const textColor = "#333333";
    const lightGray = "#666666";

    // Header
    doc
      .fontSize(24)
      .fillColor(primaryColor)
      .text("FREELANCER PLATFORM AGREEMENT", { align: "center" });

    doc.moveDown(0.5);
    doc
      .fontSize(10)
      .fillColor(lightGray)
      .text(`Agreement Version ${CURRENT_AGREEMENT_VERSION}`, {
        align: "center",
      });

    doc.moveDown(1.5);

    // Introduction
    doc
      .fontSize(11)
      .fillColor(textColor)
      .text(
        `This Freelancer Platform Agreement ("Agreement") is entered into as of ${this.formatDate(data.acceptedAt)} between:`,
      );

    doc.moveDown(0.5);
    doc
      .fontSize(10)
      .text(
        `Freelancer: ${data.recipientName} ("Freelancer", "you", or "your")`,
        { indent: 20 },
      );
    doc.text(
      `Platform: Prime Logic Solutions ("Platform", "we", "us", or "our")`,
      {
        indent: 20,
      },
    );
    doc.text(`Country: ${data.country}`, { indent: 20 });

    doc.moveDown(1);

    // Platform Access
    doc
      .fontSize(12)
      .fillColor(primaryColor)
      .text("1. PLATFORM ACCESS & SERVICES", { underline: true });
    doc.moveDown(0.5);
    doc.fontSize(10).fillColor(textColor);
    doc.text(
      "1.1. Platform provides a marketplace connecting freelancers with clients for software development projects.",
    );
    doc.text(
      "1.2. Your application to join the platform is subject to review and approval by Platform.",
    );
    doc.text(
      "1.3. Platform reserves the right to accept or reject any application at its sole discretion.",
    );
    doc.text(
      "1.4. Upon acceptance, you gain access to bid on projects and collaborate with clients.",
    );

    doc.moveDown(1);

    // Independent Contractor
    doc
      .fontSize(12)
      .fillColor(primaryColor)
      .text("2. INDEPENDENT CONTRACTOR STATUS", { underline: true });
    doc.moveDown(0.5);
    doc.fontSize(10).fillColor(textColor);
    doc.text(
      "2.1. You are an independent contractor, not an employee, agent, or partner of Platform.",
    );
    doc.text(
      "2.2. You are responsible for your own taxes, insurance, and benefits.",
    );
    doc.text(
      "2.3. You have the freedom to accept or decline any project opportunity.",
    );
    doc.text(
      "2.4. You control your own work methods, schedule, and location (subject to project requirements).",
    );

    doc.moveDown(1);

    // Payment Terms
    doc
      .fontSize(12)
      .fillColor(primaryColor)
      .text("3. PAYMENT TERMS", { underline: true });
    doc.moveDown(0.5);
    doc.fontSize(10).fillColor(textColor);
    doc.text(
      "3.1. You will be paid according to milestone agreements or project-specific payment terms.",
    );
    doc.text(
      "3.2. Platform facilitates payments but is not responsible for client payment obligations.",
    );
    doc.text(
      "3.3. Platform may charge service fees or commissions as separately disclosed.",
    );
    doc.text(
      "3.4. You are responsible for providing accurate payment information (bank details, tax forms, etc.).",
    );
    doc.text(
      "3.5. Payment timing and methods will be specified in individual project agreements.",
    );

    doc.moveDown(1);

    // Professional Conduct
    doc
      .fontSize(12)
      .fillColor(primaryColor)
      .text("4. PROFESSIONAL CONDUCT & CODE OF CONDUCT", { underline: true });
    doc.moveDown(0.5);
    doc.fontSize(10).fillColor(textColor);
    doc.text(
      "4.1. You agree to conduct yourself professionally in all interactions with clients and Platform staff.",
    );
    doc.text(
      "4.2. You will provide high-quality work that meets industry standards.",
    );
    doc.text(
      "4.3. You will communicate promptly and honestly with clients and Platform.",
    );
    doc.text(
      "4.4. You will not engage in fraudulent, abusive, or unethical behavior.",
    );
    doc.text(
      "4.5. Violations may result in suspension or permanent removal from the platform.",
    );

    doc.moveDown(1);

    // Add new page
    doc.addPage();

    // Intellectual Property
    doc
      .fontSize(12)
      .fillColor(primaryColor)
      .text("5. INTELLECTUAL PROPERTY", { underline: true });
    doc.moveDown(0.5);
    doc.fontSize(10).fillColor(textColor);
    doc.text(
      "5.1. All work product created for clients becomes the property of the client upon full payment (unless otherwise specified in project-specific agreements).",
    );
    doc.text(
      "5.2. You represent and warrant that your work does not infringe on any third-party intellectual property rights.",
    );
    doc.text(
      "5.3. You retain ownership of your pre-existing tools, frameworks, and general knowledge.",
    );
    doc.text(
      "5.4. You grant Platform the right to showcase completed projects for marketing purposes (subject to client approval).",
    );

    doc.moveDown(1);

    // Confidentiality & NDA
    doc
      .fontSize(12)
      .fillColor(primaryColor)
      .text("6. CONFIDENTIALITY & NON-DISCLOSURE", { underline: true });
    doc.moveDown(0.5);
    doc.fontSize(10).fillColor(textColor);
    doc.text(
      "6.1. You agree to keep all client information, project details, and proprietary information confidential.",
    );
    doc.text(
      "6.2. Confidentiality obligations survive termination of this agreement for three (3) years.",
    );
    doc.text(
      "6.3. You may be required to sign project-specific NDAs for certain engagements.",
    );
    doc.text(
      "6.4. Breach of confidentiality may result in legal action and platform removal.",
    );

    doc.moveDown(1);

    // Non-Solicitation
    doc
      .fontSize(12)
      .fillColor(primaryColor)
      .text("7. NON-SOLICITATION & NON-CIRCUMVENTION", { underline: true });
    doc.moveDown(0.5);
    doc.fontSize(10).fillColor(textColor);
    doc.text(
      "7.1. You agree not to circumvent the Platform to avoid fees by working directly with clients you met through Platform.",
    );
    doc.text(
      "7.2. This restriction applies during your time on Platform and for twelve (12) months after termination.",
    );
    doc.text(
      "7.3. You may not solicit Platform employees, contractors, or other freelancers for competing opportunities.",
    );
    doc.text(
      "7.4. Violations may result in financial penalties and legal action.",
    );

    doc.moveDown(1);

    // Work Authorization
    doc
      .fontSize(12)
      .fillColor(primaryColor)
      .text("8. WORK AUTHORIZATION & COMPLIANCE", { underline: true });
    doc.moveDown(0.5);
    doc.fontSize(10).fillColor(textColor);
    doc.text(
      "8.1. You represent that you are legally authorized to work in your country of residence.",
    );
    doc.text(
      "8.2. You are responsible for complying with all local laws, regulations, and tax obligations.",
    );
    doc.text(
      "8.3. You will provide accurate identity verification and tax documentation as required.",
    );
    doc.text(
      "8.4. Platform may request additional documentation for compliance purposes.",
    );

    doc.moveDown(1);

    // Liability Limitations
    doc
      .fontSize(12)
      .fillColor(primaryColor)
      .text("9. LIMITATION OF LIABILITY", { underline: true });
    doc.moveDown(0.5);
    doc.fontSize(10).fillColor(textColor);
    doc.text(
      "9.1. Platform is a marketplace facilitator and is not responsible for client conduct or payment obligations.",
    );
    doc.text(
      `9.2. Platform is provided "AS IS" without warranties of any kind.`,
    );
    doc.text(
      "9.3. Platform's total liability shall not exceed fees paid by you to Platform in the past 12 months.",
    );
    doc.text(
      "9.4. Platform is not liable for indirect, consequential, or punitive damages.",
    );

    doc.moveDown(1);

    // Dispute Resolution
    doc
      .fontSize(12)
      .fillColor(primaryColor)
      .text("10. DISPUTE RESOLUTION", { underline: true });
    doc.moveDown(0.5);
    doc.fontSize(10).fillColor(textColor);
    doc.text(
      "10.1. This Agreement is governed by the laws of the United States.",
    );
    doc.text(
      "10.2. Disputes shall first be attempted to be resolved through good faith negotiation.",
    );
    doc.text(
      "10.3. If negotiation fails, disputes shall be resolved through binding arbitration.",
    );
    doc.text(
      "10.4. You agree to arbitration on an individual basis (no class actions).",
    );

    doc.moveDown(1);

    // Account Termination
    doc
      .fontSize(12)
      .fillColor(primaryColor)
      .text("11. ACCOUNT SUSPENSION & TERMINATION", { underline: true });
    doc.moveDown(0.5);
    doc.fontSize(10).fillColor(textColor);
    doc.text(
      "11.1. Platform may suspend or terminate your account for violation of this agreement.",
    );
    doc.text(
      "11.2. You may terminate your account at any time with written notice.",
    );
    doc.text(
      "11.3. Upon termination, you must complete any ongoing projects or arrange transition.",
    );
    doc.text(
      "11.4. Certain provisions (confidentiality, non-solicitation, IP) survive termination.",
    );

    doc.moveDown(1);

    // Updates to Agreement
    doc
      .fontSize(12)
      .fillColor(primaryColor)
      .text("12. UPDATES TO THIS AGREEMENT", { underline: true });
    doc.moveDown(0.5);
    doc.fontSize(10).fillColor(textColor);
    doc.text(
      "12.1. Platform may update this agreement from time to time with notice to freelancers.",
    );
    doc.text(
      "12.2. Continued use of the platform after updates constitutes acceptance.",
    );
    doc.text(
      "12.3. Material changes will require explicit re-acceptance of the agreement.",
    );

    doc.moveDown(1.5);

    // Entire Agreement
    doc
      .fontSize(12)
      .fillColor(primaryColor)
      .text("13. ENTIRE AGREEMENT", { underline: true });
    doc.moveDown(0.5);
    doc
      .fontSize(10)
      .fillColor(textColor)
      .text(
        "This Agreement constitutes the entire agreement between Freelancer and Platform and supersedes all prior agreements. Project-specific terms will supplement but not replace this agreement.",
      );

    doc.moveDown(2);

    // Acceptance Footer
    doc
      .rect(50, doc.y, doc.page.width - 100, 100)
      .fillAndStroke("#f0f8ff", primaryColor);

    doc
      .fontSize(11)
      .fillColor(primaryColor)
      .text("ELECTRONIC ACCEPTANCE", 50, doc.y + 15, {
        align: "center",
        width: doc.page.width - 100,
      });

    doc.moveDown(0.5);
    doc
      .fontSize(9)
      .fillColor(textColor)
      .text(
        `Accepted by: ${data.recipientName}
Email: ${data.recipientEmail}
Country: ${data.country}
Date & Time: ${this.formatDateTime(data.acceptedAt)}
IP Address: ${data.ipAddress}
User Agent: ${data.userAgent.substring(0, 80)}...`,
        { align: "center", width: doc.page.width - 100 },
      );

    doc.moveDown(1);

    // Footer
    doc
      .fontSize(8)
      .fillColor(lightGray)
      .text(
        "Prime Logic Solutions | support@primelogicsol.com",
        50,
        doc.page.height - 50,
        {
          align: "center",
          width: doc.page.width - 100,
        },
      );
  }

  /**
   * Upload PDF to Cloudinary
   */
  private async uploadToCloudinary(
    pdfBuffer: Buffer,
    agreementType: AgreementType,
    email: string,
  ): Promise<{ documentUrl: string; fileName: string }> {
    try {
      const timestamp = Date.now();
      const sanitizedEmail = email.replace(/[^a-zA-Z0-9]/g, "_");
      const publicId = `${agreementType}_${sanitizedEmail}_${timestamp}`;

      const uploadResult = await new Promise<any>((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          {
            resource_type: "raw",
            public_id: publicId,
            folder: "legal_agreements",
            format: "pdf",
            // Don't specify type - defaults to "upload" (publicly accessible)
          },
          (error, result) => {
            // eslint-disable-next-line @typescript-eslint/prefer-promise-reject-errors
            if (error) reject(error);
            else resolve(result);
          },
        );

        uploadStream.end(pdfBuffer);
      });

      // Generate filename with dashes (more readable for downloads)
      const typeName = agreementType.replace(/_/g, "-");
      const fileName = `${typeName}_${sanitizedEmail}_${timestamp}.pdf`;

      return {
        documentUrl: uploadResult.secure_url,
        fileName,
      };
    } catch (error) {
      logger.error("Error uploading to Cloudinary:", error);
      throw new Error(
        `Failed to upload agreement: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
    }
  }

  /**
   * Send agreement copy via email
   */
  private async sendAgreementEmail(
    email: string,
    name: string,
    documentUrl: string,
    agreementType: AgreementType,
  ): Promise<void> {
    try {
      const agreementName =
        agreementType === AgreementType.CLIENT_SERVICE
          ? "Service Agreement"
          : "Freelancer Platform Agreement";

      const message = `
       <p>Dear ${name},</p>
      
       <p>Thank you for accepting our ${agreementName}. This email confirms your acceptance and provides you with a copy of the agreement for your records.</p>
      
       <p><strong>Agreement Details:</strong></p>
       <ul>
         <li>Agreement Type: ${agreementName}</li>
         <li>Version: ${CURRENT_AGREEMENT_VERSION}</li>
         <li>Accepted: ${this.formatDateTime(new Date())}</li>
       </ul>
      
       <p><strong>Your Agreement Document:</strong><br/>
       <a href="${documentUrl}" style="color: #007aff; text-decoration: none;">Click here to download your agreement (PDF)</a></p>
      
       <p>Please save this document for your records. If you have any questions about the agreement, please don't hesitate to contact us.</p>
      
       <p>Best regards,<br/>
       Prime Logic Solutions Team</p>
     `;

      await gloabalMailMessage(
        email,
        message,
        `Your ${agreementName} - Prime Logic Solutions`,
        `${agreementName} Confirmation`,
        "",
        "Thank you for partnering with us!",
      );
    } catch (error) {
      // Log error but don't fail the whole process if email fails
      logger.error("Error sending agreement email:", error);
    }
  }

  /**
   * Generate document hash for tamper detection
   */
  private generateDocumentHash(pdfBuffer: Buffer): string {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const crypto = require("crypto");
    return crypto.createHash("sha256").update(pdfBuffer).digest("hex");
  }

  /**
   * Format currency
   */
  private formatCurrency(amount: number): string {
    return new Intl.NumberFormat("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  }

  /**
   * Format date
   */
  private formatDate(date: Date): string {
    return new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    }).format(date);
  }

  /**
   * Format date and time
   */
  private formatDateTime(date: Date): string {
    return new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      timeZoneName: "short",
    }).format(date);
  }
}

// Export singleton instance
export const legalAgreementService = new LegalAgreementService();
