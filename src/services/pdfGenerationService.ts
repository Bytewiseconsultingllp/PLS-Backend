import PDFDocument from "pdfkit";
import { db } from "../database/db";

interface VisitorQuoteData {
  visitor: any;
  details: any;
  services: any[];
  industries: any[];
  technologies: any[];
  features: any[];
  discount: any;
  timeline: any;
  estimate: any;
}

interface ClientDraftQuoteData {
  draft: any;
  details: any;
  services: any[];
  industries: any[];
  technologies: any[];
  features: any[];
  discount: any;
  timeline: any;
  estimate: any;
}

class PDFGenerationService {
  // Color palette matching the reference PDF
  private readonly colors = {
    navyBlue: "#1e3a8a", // Table headers
    darkBlue: "#1e40af", // Primary text accents
    textDark: "#1f2937",
    textGray: "#6b7280",
    lightGray: "#f3f4f6",
    border: "#d1d5db",
    white: "#ffffff",
    green: "#10b981",
    lightBlue: "#eff6ff",
  };

  /**
   * Fetch complete visitor data for quote
   */
  async fetchVisitorQuoteData(
    visitorId: string,
  ): Promise<VisitorQuoteData | null> {
    const visitor = await db.visitor.findUnique({
      where: { id: visitorId },
      include: {
        details: true,
        services: true,
        industries: true,
        technologies: true,
        features: true,
        discount: true,
        timeline: true,
        estimate: true,
        serviceAgreement: true,
      },
    });

    if (!visitor) {
      return null;
    }

    return visitor as any;
  }

  /**
   * Fetch complete client draft data for quote
   */
  async fetchClientDraftQuoteData(
    draftId: string,
  ): Promise<ClientDraftQuoteData | null> {
    const draft = await db.clientProjectDraft.findUnique({
      where: { id: draftId, deletedAt: null },
      include: {
        details: true,
        services: true,
        industries: true,
        technologies: true,
        features: true,
        discount: true,
        timeline: true,
        estimate: true,
        serviceAgreement: true,
      },
    });

    if (!draft) {
      return null;
    }

    return draft as any;
  }

  /**
   * Format text by replacing underscores with spaces and capitalizing
   */
  private formatText(text: string): string {
    if (!text) return "";
    return text
      .replace(/_/g, " ")
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(" ");
  }

  /**
   * Generate PDF from visitor data matching the reference format
   */
  async generateQuotePDF(visitorId: string): Promise<Buffer> {
    const data = await this.fetchVisitorQuoteData(visitorId);

    if (!data) {
      throw new Error("Visitor not found");
    }

    const { details, services, technologies, discount, timeline, estimate } =
      data;

    return this.generatePDFFromData(
      details,
      services,
      technologies,
      discount,
      timeline,
      estimate,
    );
  }

  /**
   * Generate PDF from client draft data
   */
  async generateClientDraftQuotePDF(draftId: string): Promise<Buffer> {
    const data = await this.fetchClientDraftQuoteData(draftId);

    if (!data) {
      throw new Error("Client draft not found");
    }

    const { details, services, technologies, discount, timeline, estimate } =
      data;

    return this.generatePDFFromData(
      details,
      services,
      technologies,
      discount,
      timeline,
      estimate,
    );
  }

  /**
   * Core PDF generation logic (used by both visitor and client draft quotes)
   */
  private async generatePDFFromData(
    details: any,
    services: any[],
    technologies: any[],
    discount: any,
    timeline: any,
    estimate: any,
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

        const pageWidth = doc.page.width - 100; // Account for margins
        let yPos = 50;

        // ===== MAIN HEADER =====
        doc
          .fontSize(22)
          .fillColor(this.colors.darkBlue)
          .font("Helvetica-Bold")
          .text("PRIME LOGIC SOLUTIONS - Quotation", 50, yPos);

        yPos += 25;

        doc
          .fontSize(10)
          .fillColor(this.colors.textGray)
          .font("Helvetica")
          .text("United States of America", 50, yPos);

        yPos += 35;

        // ===== CLIENT INFO TABLE =====
        const tableTop = yPos;
        const tableHeight = 85;
        const col1Width = pageWidth / 2;

        // Table border
        doc
          .rect(50, tableTop, pageWidth, tableHeight)
          .strokeColor(this.colors.border)
          .lineWidth(1)
          .stroke();

        // Vertical divider
        doc
          .moveTo(50 + col1Width, tableTop)
          .lineTo(50 + col1Width, tableTop + tableHeight)
          .stroke();

        // Horizontal dividers
        for (let i = 1; i <= 2; i++) {
          const dividerY = tableTop + (tableHeight / 3) * i;
          doc
            .moveTo(50, dividerY)
            .lineTo(50 + pageWidth, dividerY)
            .stroke();
        }

        // Generate Quote ID and Date
        const quoteDate = new Date();
        const quoteId = `PLS-${quoteDate.getFullYear()}-${String(Date.now()).slice(-3)}`;
        const dateIssued = quoteDate.toLocaleDateString("en-US", {
          year: "numeric",
          month: "short",
          day: "numeric",
        });
        const validDate = new Date(quoteDate);
        validDate.setDate(validDate.getDate() + 30);
        const validUntil = validDate.toLocaleDateString("en-US", {
          year: "numeric",
          month: "short",
          day: "numeric",
        });

        // Row 1: Client/Company and Quote #
        let rowY = tableTop + 12;
        const labelWidth = 110;
        const leftColValueX = 60 + labelWidth;
        const leftColValueWidth = col1Width - labelWidth - 20;
        const rightColLabelX = 50 + col1Width + 10;
        const rightColValueX = rightColLabelX + 80;

        doc
          .fontSize(9)
          .fillColor(this.colors.textGray)
          .font("Helvetica")
          .text("Client / Company", 60, rowY);
        doc
          .fontSize(9)
          .fillColor(this.colors.textDark)
          .font("Helvetica")
          .text(
            details?.companyName || details?.businessName || "N/A",
            leftColValueX,
            rowY,
            {
              width: leftColValueWidth,
              lineBreak: true,
            },
          );

        doc
          .fontSize(9)
          .fillColor(this.colors.textGray)
          .font("Helvetica")
          .text("Quote #", rightColLabelX, rowY);
        doc
          .fontSize(9)
          .fillColor(this.colors.textDark)
          .font("Helvetica")
          .text(quoteId, rightColValueX, rowY);

        // Row 2: Contact and Date Issued
        rowY = tableTop + 12 + tableHeight / 3;
        doc
          .fontSize(9)
          .fillColor(this.colors.textGray)
          .font("Helvetica")
          .text("Contact", 60, rowY);
        doc
          .fontSize(9)
          .fillColor(this.colors.textDark)
          .font("Helvetica")
          .text(details?.fullName || "N/A", leftColValueX, rowY, {
            width: leftColValueWidth,
          });

        doc
          .fontSize(9)
          .fillColor(this.colors.textGray)
          .font("Helvetica")
          .text("Date Issued", rightColLabelX, rowY);
        doc
          .fontSize(9)
          .fillColor(this.colors.textDark)
          .font("Helvetica")
          .text(dateIssued, rightColValueX, rowY);

        // Row 3: Email/Phone and Valid Until
        rowY = tableTop + 12 + (tableHeight / 3) * 2;
        doc
          .fontSize(9)
          .fillColor(this.colors.textGray)
          .font("Helvetica")
          .text("Email / Phone", 60, rowY);

        // Split email and phone into two lines for better fit
        const emailText = details?.businessEmail || "N/A";
        const phoneText = details?.phoneNumber || "";

        doc
          .fontSize(9)
          .fillColor(this.colors.textDark)
          .font("Helvetica")
          .text(emailText, leftColValueX, rowY, {
            width: leftColValueWidth,
          });

        if (phoneText) {
          doc
            .fontSize(9)
            .fillColor(this.colors.textDark)
            .font("Helvetica")
            .text(`• ${phoneText}`, leftColValueX, rowY + 10, {
              width: leftColValueWidth,
            });
        }

        doc
          .fontSize(9)
          .fillColor(this.colors.textGray)
          .font("Helvetica")
          .text("Valid Until", rightColLabelX, rowY);
        doc
          .fontSize(9)
          .fillColor(this.colors.textDark)
          .font("Helvetica")
          .text(validUntil, rightColValueX, rowY);

        yPos = tableTop + tableHeight + 30;

        // ===== PROJECT OVERVIEW =====
        yPos = this.checkPageBreak(doc, yPos, 100);
        doc
          .fontSize(14)
          .fillColor(this.colors.darkBlue)
          .font("Helvetica-Bold")
          .text("Project Overview", 50, yPos);

        yPos += 20;

        // Generate project description from services
        const servicesList = services
          .map((s) => this.formatText(s.name))
          .join(", ");
        const projectDesc = `Prime Logic Solutions (PLS) proposes to design and develop a comprehensive software solution for ${details?.companyName || details?.businessName || "your organization"}, including ${servicesList}, with modern technology stack and best practices implementation.`;

        doc
          .fontSize(10)
          .fillColor(this.colors.textDark)
          .font("Helvetica")
          .text(projectDesc, 50, yPos, {
            width: pageWidth,
            align: "justify",
            lineGap: 3,
          });

        yPos += 60;

        // ===== PROPOSED TECHNOLOGY STACK =====
        yPos = this.checkPageBreak(doc, yPos, 150);
        doc
          .fontSize(14)
          .fillColor(this.colors.darkBlue)
          .font("Helvetica-Bold")
          .text("Proposed Technology Stack", 50, yPos);

        yPos += 20;

        // Technology Stack Table
        const techStackTable = this.buildTechnologyStackTable(technologies);
        yPos = this.drawTechnologyTable(doc, techStackTable, yPos, pageWidth);

        yPos += 30;

        // ===== SCOPE OF WORK =====
        yPos = this.checkPageBreak(doc, yPos, 200);
        doc
          .fontSize(14)
          .fillColor(this.colors.darkBlue)
          .font("Helvetica-Bold")
          .text("Scope of Work", 50, yPos);

        yPos += 20;

        // Scope of Work Table
        yPos = this.drawScopeOfWorkTable(
          doc,
          services,
          estimate,
          discount,
          yPos,
          pageWidth,
        );

        yPos += 30;

        // ===== TIMELINE =====
        yPos = this.checkPageBreak(doc, yPos, 180);
        doc
          .fontSize(14)
          .fillColor(this.colors.darkBlue)
          .font("Helvetica-Bold")
          .text("Timeline", 50, yPos);

        yPos += 20;

        yPos = this.drawTimelineTable(doc, timeline, yPos, pageWidth);

        yPos += 30;

        // ===== COMMERCIAL TERMS =====
        yPos = this.checkPageBreak(doc, yPos, 180);
        doc
          .fontSize(14)
          .fillColor(this.colors.darkBlue)
          .font("Helvetica-Bold")
          .text("Commercial Terms (Highlights)", 50, yPos);

        yPos += 20;

        const terms = [
          "Payment Schedule: 40% kickoff · 40% on milestone acceptance · 20% on final delivery.",
          "Quotation Validity: 30 days from issue date. Taxes and third party fees excluded unless stated.",
          "Support: 30 day postlaunch warranty for bug fixes (scope-limited).",
          "IP: Work-for-hire; full ownership transfers upon final payment.",
          "Confidentiality: Project specific NDA applies to all parties.",
        ];

        doc.fontSize(10).fillColor(this.colors.textDark).font("Helvetica");

        for (const term of terms) {
          yPos = this.checkPageBreak(doc, yPos, 25);
          doc.text(`• ${term}`, 50, yPos, {
            width: pageWidth,
            lineGap: 3,
          });
          yPos += 18;
        }

        yPos += 20;

        // ===== CLOSING MESSAGE =====
        yPos = this.checkPageBreak(doc, yPos, 40);
        doc
          .fontSize(10)
          .fillColor(this.colors.textGray)
          .font("Helvetica-Oblique")
          .text(
            "Thank you for considering Prime Logic Solutions. We look forward to building with you.",
            50,
            yPos,
            {
              width: pageWidth,
              align: "left",
            },
          );

        doc.end();
      } catch (error) {
        reject(error instanceof Error ? error : new Error(String(error)));
      }
    });
  }

  /**
   * Build technology stack table data
   */
  private buildTechnologyStackTable(
    technologies: any[],
  ): { label: string; value: string }[] {
    const techMap: { [key: string]: string[] } = {
      Frontend: [],
      Backend: [],
      Database: [],
      Mobile: [],
      "Cloud & DevOps": [],
      Security: [],
      "AI & Analytics": [],
    };

    // If no technologies provided, return empty array to show all categories
    if (!technologies || technologies.length === 0) {
      return Object.keys(techMap).map((key) => ({
        label: key,
        value: "Yet to be decided",
      }));
    }

    for (const tech of technologies) {
      const category = this.formatText(tech.category);
      const techs = tech.technologies.map((t: string) => this.formatText(t));

      if (category.includes("Frontend")) {
        techMap.Frontend?.push(...techs);
      } else if (category.includes("Backend")) {
        techMap.Backend?.push(...techs);
      } else if (category.includes("Database")) {
        techMap.Database?.push(...techs);
      } else if (category.includes("Mobile")) {
        techMap.Mobile?.push(...techs);
      } else if (
        category.includes("Devops") ||
        category.includes("Infrastructure")
      ) {
        techMap["Cloud & DevOps"]?.push(...techs);
      } else if (category.includes("Security")) {
        techMap.Security?.push(...techs);
      } else if (
        category.includes("Ai") ||
        category.includes("Analytics") ||
        category.includes("Data")
      ) {
        techMap["AI & Analytics"]?.push(...techs);
      }
    }

    // Return all categories, showing "Yet to be decided" for empty ones
    const result: { label: string; value: string }[] = [];
    for (const [key, values] of Object.entries(techMap)) {
      result.push({
        label: key,
        value: values.length > 0 ? values.join(", ") : "Yet to be decided",
      });
    }

    return result;
  }

  /**
   * Draw technology stack table
   */
  private drawTechnologyTable(
    doc: PDFKit.PDFDocument,
    techData: { label: string; value: string }[],
    startY: number,
    pageWidth: number,
  ): number {
    const rowHeight = 30;
    const labelWidth = 120;
    const valueWidth = pageWidth - labelWidth;
    let currentY = startY;

    // Draw header
    doc
      .rect(50, currentY, pageWidth, rowHeight)
      .fillColor(this.colors.lightBlue)
      .fill();

    doc
      .strokeColor(this.colors.border)
      .lineWidth(1)
      .rect(50, currentY, pageWidth, rowHeight)
      .stroke();

    doc
      .fontSize(10)
      .fillColor(this.colors.textDark)
      .font("Helvetica-Bold")
      .text("Category", 60, currentY + 10);

    doc.text("Technologies", 50 + labelWidth + 10, currentY + 10);

    currentY += rowHeight;

    // Draw rows
    for (let i = 0; i < techData.length; i++) {
      const item = techData[i];
      if (!item) continue;

      const isEven = i % 2 === 0;

      // Calculate row height based on text
      const textHeight = doc.heightOfString(item.value, {
        width: valueWidth - 20,
      });
      const actualRowHeight = Math.max(30, textHeight + 20);

      currentY = this.checkPageBreak(doc, currentY, actualRowHeight + 10);

      // Background
      if (isEven) {
        doc
          .rect(50, currentY, pageWidth, actualRowHeight)
          .fillColor(this.colors.lightGray)
          .fill();
      }

      // Borders
      doc
        .strokeColor(this.colors.border)
        .lineWidth(1)
        .rect(50, currentY, pageWidth, actualRowHeight)
        .stroke();

      // Vertical line
      doc
        .moveTo(50 + labelWidth, currentY)
        .lineTo(50 + labelWidth, currentY + actualRowHeight)
        .stroke();

      // Label
      doc
        .fontSize(9)
        .fillColor(this.colors.textDark)
        .font("Helvetica")
        .text(item.label, 60, currentY + 10, {
          width: labelWidth - 20,
        });

      // Value
      doc
        .fontSize(9)
        .fillColor(this.colors.textDark)
        .font("Helvetica")
        .text(item.value, 50 + labelWidth + 10, currentY + 10, {
          width: valueWidth - 20,
        });

      currentY += actualRowHeight;
    }

    return currentY;
  }

  /**
   * Draw Scope of Work pricing table
   */
  private drawScopeOfWorkTable(
    doc: PDFKit.PDFDocument,
    services: any[],
    estimate: any,
    discount: any,
    startY: number,
    pageWidth: number,
  ): number {
    let currentY = startY;
    const colWidths = [40, 150, pageWidth - 290, 100]; // #, Module, Description, Amount
    const rowHeight = 30;

    // Table header
    doc
      .rect(50, currentY, pageWidth, rowHeight)
      .fillColor(this.colors.navyBlue)
      .fill();

    doc
      .strokeColor(this.colors.border)
      .lineWidth(1)
      .rect(50, currentY, pageWidth, rowHeight)
      .stroke();

    let xPos = 50;
    const headers = ["#", "Module / Feature", "Description", "Amount (USD)"];

    doc.fontSize(10).fillColor(this.colors.white).font("Helvetica-Bold");

    for (let i = 0; i < headers.length; i++) {
      const header = headers[i];
      const colWidth = colWidths[i];
      if (header && colWidth) {
        doc.text(header, xPos + 10, currentY + 10, {
          width: colWidth - 20,
          align: i === 3 ? "right" : "left",
        });
        xPos += colWidth;
      }
    }

    currentY += rowHeight;

    // Build rows from services
    const rows: { module: string; description: string; amount: number }[] = [];
    const baseCost = Number(estimate?.baseCost || 0);
    const serviceCount = services.length;
    const avgPerService = serviceCount > 0 ? baseCost / serviceCount : baseCost;

    // If no services, show placeholder
    if (!services || services.length === 0) {
      rows.push({
        module: "Project Scope",
        description: "Yet to be decided - pending detailed requirements",
        amount: baseCost,
      });
    } else {
      for (const service of services) {
        const childServices = service.childServices || [];
        const description =
          childServices.length > 0
            ? childServices.map((c: string) => this.formatText(c)).join(", ")
            : "Yet to be decided";

        rows.push({
          module: this.formatText(service.name),
          description: description,
          amount: avgPerService,
        });
      }
    }

    // Draw data rows
    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      if (!row) continue;

      const isEven = i % 2 === 0;

      // Calculate row height based on description
      const descHeight = doc.heightOfString(row.description, {
        width: colWidths[2]! - 20,
      });
      const actualRowHeight = Math.max(30, descHeight + 20);

      currentY = this.checkPageBreak(doc, currentY, actualRowHeight + 10);

      // Background
      if (isEven) {
        doc
          .rect(50, currentY, pageWidth, actualRowHeight)
          .fillColor(this.colors.lightGray)
          .fill();
      }

      // Border
      doc
        .strokeColor(this.colors.border)
        .lineWidth(1)
        .rect(50, currentY, pageWidth, actualRowHeight)
        .stroke();

      // Vertical lines
      xPos = 50;
      for (let j = 0; j < colWidths.length - 1; j++) {
        xPos += colWidths[j]!;
        doc
          .moveTo(xPos, currentY)
          .lineTo(xPos, currentY + actualRowHeight)
          .stroke();
      }

      // Data
      doc.fontSize(9).fillColor(this.colors.textDark).font("Helvetica");

      // Number
      doc.text(`${i + 1}`, 60, currentY + 10, {
        width: colWidths[0]! - 20,
        align: "center",
      });

      // Module
      doc
        .font("Helvetica-Bold")
        .text(row.module, 50 + colWidths[0]! + 10, currentY + 10, {
          width: colWidths[1]! - 20,
        });

      // Description
      doc
        .font("Helvetica")
        .text(
          row.description,
          50 + colWidths[0]! + colWidths[1]! + 10,
          currentY + 10,
          {
            width: colWidths[2]! - 20,
          },
        );

      // Amount
      doc
        .font("Helvetica")
        .text(
          `$${Math.round(row.amount).toLocaleString()}`,
          50 + colWidths[0]! + colWidths[1]! + colWidths[2]! + 10,
          currentY + 10,
          {
            width: colWidths[3]! - 20,
            align: "right",
          },
        );

      currentY += actualRowHeight;
    }

    // Summary rows
    const hasEstimate = estimate && estimate.baseCost;
    const summaryRows = [
      {
        label: "Subtotal",
        value: hasEstimate
          ? `$${Number(estimate.baseCost).toLocaleString()}`
          : "Yet to be decided",
        bold: false,
      },
      {
        label: `Discount (${discount?.percent || 0}%)`,
        value: hasEstimate
          ? `-$${Number(estimate.discountAmount || 0).toLocaleString()}`
          : "Yet to be decided",
        bold: false,
        green: true,
      },
      {
        label: "Estimated Total",
        value: hasEstimate
          ? `$${Number(estimate.calculatedTotal).toLocaleString()}`
          : "Yet to be decided",
        bold: true,
        highlight: true,
      },
    ];

    for (const sumRow of summaryRows) {
      currentY = this.checkPageBreak(doc, currentY, rowHeight + 10);

      // Background for estimated total
      if (sumRow.highlight) {
        doc
          .rect(50, currentY, pageWidth, rowHeight)
          .fillColor("#ecfdf5")
          .fill();
      }

      // Border
      doc
        .strokeColor(this.colors.border)
        .lineWidth(1)
        .rect(50, currentY, pageWidth, rowHeight)
        .stroke();

      // Label
      const labelX = 50 + (colWidths[0] || 0) + (colWidths[1] || 0) + 10;
      doc
        .fontSize(sumRow.bold ? 11 : 10)
        .fillColor(sumRow.green ? this.colors.green : this.colors.textDark)
        .font(sumRow.bold ? "Helvetica-Bold" : "Helvetica")
        .text(sumRow.label, labelX, currentY + 10);

      // Value
      const valueX =
        50 +
        (colWidths[0] || 0) +
        (colWidths[1] || 0) +
        (colWidths[2] || 0) +
        10;
      doc
        .fontSize(sumRow.bold ? 12 : 10)
        .fillColor(sumRow.green ? this.colors.green : this.colors.textDark)
        .font(sumRow.bold ? "Helvetica-Bold" : "Helvetica")
        .text(sumRow.value, valueX, currentY + 10, {
          width: (colWidths[3] || 100) - 20,
          align: "right",
        });

      currentY += rowHeight;
    }

    return currentY;
  }

  /**
   * Draw timeline table
   */
  private drawTimelineTable(
    doc: PDFKit.PDFDocument,
    timeline: any,
    startY: number,
    pageWidth: number,
  ): number {
    let currentY = startY;
    const colWidths = [pageWidth * 0.3, pageWidth * 0.2, pageWidth * 0.5];
    const rowHeight = 30;

    // Header
    doc
      .rect(50, currentY, pageWidth, rowHeight)
      .fillColor(this.colors.navyBlue)
      .fill();

    doc
      .strokeColor(this.colors.border)
      .lineWidth(1)
      .rect(50, currentY, pageWidth, rowHeight)
      .stroke();

    const headers = ["Phase", "Duration", "Deliverables"];
    let xPos = 50;

    doc.fontSize(10).fillColor(this.colors.white).font("Helvetica-Bold");

    for (let i = 0; i < headers.length; i++) {
      const header = headers[i];
      const colWidth = colWidths[i];
      if (header && colWidth) {
        doc.text(header, xPos + 10, currentY + 10, {
          width: colWidth - 20,
        });
        xPos += colWidth;
      }
    }

    currentY += rowHeight;

    // Timeline data
    const estimatedDays = timeline?.estimatedDays;
    const hasTimeline = estimatedDays && estimatedDays > 0;

    const phases = hasTimeline
      ? [
          {
            phase: "Discovery & Planning",
            duration: `${Math.round(estimatedDays * 0.15)} days`,
            deliverables: "SOW, architecture, backlog",
          },
          {
            phase: "Design & Prototyping",
            duration: `${Math.round(estimatedDays * 0.2)} days`,
            deliverables: "Wireframes, UI kit, clickable prototype",
          },
          {
            phase: "Development & QA",
            duration: `${Math.round(estimatedDays * 0.5)} days`,
            deliverables: "Feature-complete build, test reports",
          },
          {
            phase: "Deployment & Handover",
            duration: `${Math.round(estimatedDays * 0.15)} days`,
            deliverables: "Production release, docs, training",
          },
        ]
      : [
          {
            phase: "Discovery & Planning",
            duration: "Yet to be decided",
            deliverables: "SOW, architecture, backlog",
          },
          {
            phase: "Design & Prototyping",
            duration: "Yet to be decided",
            deliverables: "Wireframes, UI kit, clickable prototype",
          },
          {
            phase: "Development & QA",
            duration: "Yet to be decided",
            deliverables: "Feature-complete build, test reports",
          },
          {
            phase: "Deployment & Handover",
            duration: "Yet to be decided",
            deliverables: "Production release, docs, training",
          },
        ];

    // Draw rows
    for (let i = 0; i < phases.length; i++) {
      const phase = phases[i];
      if (!phase) continue;

      const isEven = i % 2 === 0;

      currentY = this.checkPageBreak(doc, currentY, rowHeight + 10);

      // Background
      if (isEven) {
        doc
          .rect(50, currentY, pageWidth, rowHeight)
          .fillColor(this.colors.lightGray)
          .fill();
      }

      // Border
      doc
        .strokeColor(this.colors.border)
        .lineWidth(1)
        .rect(50, currentY, pageWidth, rowHeight)
        .stroke();

      // Vertical lines
      xPos = 50;
      for (let j = 0; j < colWidths.length - 1; j++) {
        xPos += colWidths[j]!;
        doc
          .moveTo(xPos, currentY)
          .lineTo(xPos, currentY + rowHeight)
          .stroke();
      }

      // Data
      doc.fontSize(9).fillColor(this.colors.textDark).font("Helvetica");

      xPos = 50;
      doc.text(phase.phase, xPos + 10, currentY + 10, {
        width: colWidths[0]! - 20,
      });

      xPos += colWidths[0]!;
      doc.text(phase.duration, xPos + 10, currentY + 10, {
        width: colWidths[1]! - 20,
      });

      xPos += colWidths[1]!;
      doc.text(phase.deliverables, xPos + 10, currentY + 10, {
        width: colWidths[2]! - 20,
      });

      currentY += rowHeight;
    }

    return currentY;
  }

  /**
   * Check if we need a page break and add new page if needed
   */
  private checkPageBreak(
    doc: PDFKit.PDFDocument,
    yPos: number,
    requiredSpace: number,
  ): number {
    if (yPos + requiredSpace > doc.page.height - 60) {
      doc.addPage();
      return 50;
    }
    return yPos;
  }
}

export const pdfGenerationService = new PDFGenerationService();
