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

class PDFGenerationService {
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
   * Format text by replacing underscores with spaces and capitalizing
   */
  private formatText(text: string): string {
    return text
      .replace(/_/g, " ")
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(" ");
  }

  /**
   * Generate PDF from visitor data using PDFKit
   */
  async generateQuotePDF(visitorId: string): Promise<Buffer> {
    const data = await this.fetchVisitorQuoteData(visitorId);

    if (!data) {
      throw new Error("Visitor not found");
    }

    const {
      details,
      services,
      industries,
      technologies,
      features,
      discount,
      timeline,
      estimate,
    } = data;

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

        const primaryBlue = "#007aff";
        const darkGray = "#1d1d1f";
        const lightGray = "#86868b";
        const pageWidth = doc.page.width - 100; // Account for margins

        let yPos = 50;

        // ===== HEADER =====
        doc
          .fontSize(24)
          .fillColor(primaryBlue)
          .font("Helvetica-Bold")
          .text("Prime Logic Solutions", 50, yPos, { width: pageWidth / 2 });

        doc
          .fontSize(20)
          .fillColor(darkGray)
          .font("Helvetica-Bold")
          .text("Project Proposal", pageWidth / 2 + 50, yPos, {
            width: pageWidth / 2,
            align: "right",
          });

        yPos += 30;

        doc
          .fontSize(10)
          .fillColor(lightGray)
          .font("Helvetica")
          .text(
            new Date().toLocaleDateString("en-US", {
              year: "numeric",
              month: "long",
              day: "numeric",
            }),
            pageWidth / 2 + 50,
            yPos,
            { width: pageWidth / 2, align: "right" },
          );

        yPos += 10;

        // Header line
        // doc
        //   .strokeColor(primaryBlue)
        //   .lineWidth(3)
        //   .moveTo(50, yPos)
        //   .lineTo(doc.page.width - 50, yPos)
        //   .stroke();

        yPos += 30;

        // ===== PROJECT OVERVIEW =====
        // doc.roundedRect(50, yPos, pageWidth, 80, 20).fillColor("#f5f5f7").fill();

        yPos += 15;

        // doc
        //   .fontSize(18)
        //   .fillColor(darkGray)
        //   .font("Helvetica-Bold")
        //   .text(details?.projectName || "Untitled Project", 65, yPos, {
        //     width: pageWidth - 30,
        //   });

        // yPos += 25;

        // doc
        //   .fontSize(11)
        //   .fillColor("#6e6e73")
        //   .font("Helvetica")
        //   .text(details?.description || "No description provided", 65, yPos, {
        //     width: pageWidth - 30,
        //     lineGap: 3,
        //   });

        // yPos += 90;

        // ===== CLIENT INFORMATION =====
        this.addSectionTitle(doc, "Client Information", yPos);
        yPos += 35;

        const clientInfo = [
          ["Business Name:", details?.businessName || "N/A"],
          ["Contact Name:", details?.fullName || "N/A"],
          ["Email:", details?.businessEmail || "N/A"],
          ["Phone:", details?.phoneNumber || "N/A"],
        ];

        for (let i = 0; i < clientInfo.length; i++) {
          const [label, value] = clientInfo[i]!;
          const xPos = i % 2 === 0 ? 50 : pageWidth / 2 + 50;
          const currentY = yPos + Math.floor(i / 2) * 30;

          doc
            .fontSize(10)
            .fillColor(lightGray)
            .font("Helvetica")
            .text(label, xPos, currentY, { continued: false });

          doc
            .fontSize(10)
            .fillColor(darkGray)
            .font("Helvetica-Bold")
            .text(value, xPos + 100, currentY, { continued: false });
        }

        yPos += Math.ceil(clientInfo.length / 2) * 30 + 20;

        // ===== SERVICES =====
        if (services && services.length > 0) {
          yPos = this.checkPageBreak(doc, yPos, 100);
          this.addSectionTitle(doc, "Services Requested", yPos);
          yPos += 35;

          for (const service of services) {
            yPos = this.checkPageBreak(doc, yPos, 50);

            doc
              .fontSize(12)
              .fillColor(darkGray)
              .font("Helvetica-Bold")
              .text(this.formatText(service.name), 50, yPos);

            yPos += 18;

            const childServices = service.childServices || [];
            const tagsPerRow = 3;
            let tagCount = 0;

            for (const child of childServices) {
              const tagX = 50 + (tagCount % tagsPerRow) * 180;
              const tagY = yPos + Math.floor(tagCount / tagsPerRow) * 22;

              yPos = this.checkPageBreak(doc, tagY, 30);

              doc
                .roundedRect(tagX, tagY, 170, 18, 9)
                .fillColor(primaryBlue)
                .fill();

              doc
                .fontSize(9)
                .fillColor("#ffffff")
                .font("Helvetica-Bold")
                .text(this.formatText(child), tagX + 10, tagY + 4, {
                  width: 150,
                });

              tagCount++;
            }

            yPos += Math.ceil(childServices.length / tagsPerRow) * 22 + 15;
          }

          yPos += 10;
        }

        // ===== INDUSTRIES =====
        if (industries && industries.length > 0) {
          yPos = this.checkPageBreak(doc, yPos, 100);
          this.addSectionTitle(doc, "Target Industries", yPos);
          yPos += 35;

          for (const industry of industries) {
            yPos = this.checkPageBreak(doc, yPos, 50);

            doc
              .fontSize(12)
              .fillColor(darkGray)
              .font("Helvetica-Bold")
              .text(this.formatText(industry.category), 50, yPos);

            yPos += 18;

            const subIndustries = industry.subIndustries || [];
            const tagsPerRow = 3;
            let tagCount = 0;

            for (const sub of subIndustries) {
              const tagX = 50 + (tagCount % tagsPerRow) * 180;
              const tagY = yPos + Math.floor(tagCount / tagsPerRow) * 22;

              yPos = this.checkPageBreak(doc, tagY, 30);

              doc
                .roundedRect(tagX, tagY, 170, 18, 9)
                .fillColor(primaryBlue)
                .fill();

              doc
                .fontSize(9)
                .fillColor("#ffffff")
                .font("Helvetica-Bold")
                .text(this.formatText(sub), tagX + 10, tagY + 4, {
                  width: 150,
                });

              tagCount++;
            }

            yPos += Math.ceil(subIndustries.length / tagsPerRow) * 22 + 15;
          }

          yPos += 10;
        }

        // ===== TECHNOLOGIES =====
        if (technologies && technologies.length > 0) {
          yPos = this.checkPageBreak(doc, yPos, 100);
          this.addSectionTitle(doc, "Technologies", yPos);
          yPos += 35;

          const allTech = technologies.flatMap((t) => t.technologies || []);
          const tagsPerRow = 3;

          for (let i = 0; i < allTech.length; i++) {
            const tagX = 50 + (i % tagsPerRow) * 180;
            const tagY = yPos + Math.floor(i / tagsPerRow) * 22;

            yPos = this.checkPageBreak(doc, tagY, 30);

            doc
              .roundedRect(tagX, tagY, 170, 18, 9)
              .fillColor(primaryBlue)
              .fill();

            doc
              .fontSize(9)
              .fillColor("#ffffff")
              .font("Helvetica-Bold")
              .text(this.formatText(allTech[i]), tagX + 10, tagY + 4, {
                width: 150,
              });
          }

          yPos += Math.ceil(allTech.length / tagsPerRow) * 22 + 20;
        }

        // ===== FEATURES =====
        if (features && features.length > 0) {
          yPos = this.checkPageBreak(doc, yPos, 100);
          this.addSectionTitle(doc, "Features & Functionality", yPos);
          yPos += 35;

          const allFeatures = features.flatMap((f) => f.features || []);
          const tagsPerRow = 3;

          for (let i = 0; i < allFeatures.length; i++) {
            const tagX = 50 + (i % tagsPerRow) * 180;
            const tagY = yPos + Math.floor(i / tagsPerRow) * 22;

            yPos = this.checkPageBreak(doc, tagY, 30);

            doc
              .roundedRect(tagX, tagY, 170, 18, 9)
              .fillColor(primaryBlue)
              .fill();

            doc
              .fontSize(9)
              .fillColor("#ffffff")
              .font("Helvetica-Bold")
              .text(this.formatText(allFeatures[i]), tagX + 10, tagY + 4, {
                width: 150,
              });
          }

          yPos += Math.ceil(allFeatures.length / tagsPerRow) * 22 + 20;
        }

        // ===== TIMELINE & TERMS =====
        yPos = this.checkPageBreak(doc, yPos, 150);
        this.addSectionTitle(doc, "Project Timeline & Terms", yPos);
        yPos += 35;

        if (timeline) {
          this.addInfoRow(
            doc,
            "Timeline Option:",
            this.formatText(timeline.option),
            yPos,
          );
          yPos += 25;
          this.addInfoRow(
            doc,
            "Estimated Duration:",
            `${timeline.estimatedDays} days`,
            yPos,
          );
          yPos += 25;
          this.addInfoRow(
            doc,
            "Rush Fee:",
            `${timeline.rushFeePercent}%`,
            yPos,
          );
          yPos += 25;
        }

        if (discount) {
          this.addInfoRow(
            doc,
            "Discount Type:",
            this.formatText(discount.type),
            yPos,
          );
          yPos += 25;
          this.addInfoRow(doc, "Discount:", `${discount.percent}%`, yPos);
          yPos += 25;
        }

        yPos += 20;

        // ===== PRICING =====
        yPos = this.checkPageBreak(doc, yPos, 250);

        // Blue gradient box for pricing
        doc
          .roundedRect(50, yPos, pageWidth, 220, 12)
          .fillColor("#007aff")
          .fill();

        yPos += 20;

        doc
          .fontSize(16)
          .fillColor("#ffffff")
          .font("Helvetica-Bold")
          .text("Investment Breakdown", 70, yPos);

        yPos += 35;

        if (estimate) {
          // Base Cost
          this.addPricingRow(
            doc,
            "Base Cost:",
            `$${Number(estimate.baseCost).toLocaleString()}`,
            yPos,
            false,
          );
          yPos += 25;

          // Discount
          doc
            .fontSize(11)
            .fillColor("#4ade80")
            .font("Helvetica")
            .text(`Discount (${discount?.percent || 0}%):`, 70, yPos, {
              width: pageWidth - 40,
              continued: true,
            })
            .text(`-$${Number(estimate.discountAmount).toLocaleString()}`, {
              align: "right",
            });
          yPos += 25;

          // Rush Fee
          this.addPricingRow(
            doc,
            `Rush Fee (${timeline?.rushFeePercent || 0}%):`,
            `+$${Number(estimate.rushFeeAmount).toLocaleString()}`,
            yPos,
            false,
          );
          yPos += 25;

          // Divider line
          doc
            .strokeColor("rgba(255, 255, 255, 0.3)")
            .lineWidth(2)
            .moveTo(70, yPos)
            .lineTo(doc.page.width - 70, yPos)
            .stroke();

          yPos += 20;

          // Calculated Total
          this.addPricingRow(
            doc,
            "Calculated Total:",
            `$${Number(estimate.calculatedTotal).toLocaleString()}`,
            yPos,
            true,
          );
          yPos += 30;

          // Divider line
          doc
            .strokeColor("rgba(255, 255, 255, 0.4)")
            .lineWidth(3)
            .moveTo(70, yPos)
            .lineTo(doc.page.width - 70, yPos)
            .stroke();

          yPos += 20;

          // Final Price Range
          doc
            .fontSize(14)
            .fillColor("#ffffff")
            .font("Helvetica-Bold")
            .text("Estimated Price Range:", 70, yPos, {
              width: pageWidth - 40,
              continued: true,
            })
            .text(
              `$${Number(estimate.estimateFinalPriceMin).toLocaleString()} - $${Number(estimate.estimateFinalPriceMax).toLocaleString()}`,
              { align: "right" },
            );
        }

        yPos += 50;

        // ===== FOOTER =====
        yPos = this.checkPageBreak(doc, yPos, 100);
        yPos += 20;

        doc
          .strokeColor("#f5f5f7")
          .lineWidth(2)
          .moveTo(50, yPos)
          .lineTo(doc.page.width - 50, yPos)
          .stroke();

        yPos += 30;

        doc
          .fontSize(12)
          .fillColor(primaryBlue)
          .font("Helvetica-Bold")
          .text("Prime Logic Solutions", 50, yPos, {
            width: pageWidth,
            align: "center",
          });

        yPos += 18;

        doc
          .fontSize(9)
          .fillColor(lightGray)
          .font("Helvetica")
          .text(
            "A non-commercial platform empowering independent professionals",
            50,
            yPos,
            { width: pageWidth, align: "center" },
          );

        yPos += 14;

        doc.text(
          `© ${new Date().getFullYear()} PrimeLogic. All rights reserved.`,
          50,
          yPos,
          { width: pageWidth, align: "center" },
        );

        yPos += 14;

        doc.fillColor(primaryBlue).text("primelogicsol.com", 50, yPos, {
          width: pageWidth,
          align: "center",
          link: "https://primelogicsol.com",
        });

        doc.end();
      } catch (error) {
        reject(error instanceof Error ? error : new Error(String(error)));
      }
    });
  }

  /**
   * Add section title
   */
  private addSectionTitle(
    doc: PDFKit.PDFDocument,
    title: string,
    yPos: number,
  ) {
    doc
      .fontSize(14)
      .fillColor("#1d1d1f")
      .font("Helvetica-Bold")
      .text(title, 50, yPos);

    doc
      .strokeColor("#f5f5f7")
      .lineWidth(2)
      .moveTo(50, yPos + 20)
      .lineTo(doc.page.width - 50, yPos + 20)
      .stroke();
  }

  /**
   * Add info row (label + value)
   */
  private addInfoRow(
    doc: PDFKit.PDFDocument,
    label: string,
    value: string,
    yPos: number,
  ) {
    doc
      .fontSize(10)
      .fillColor("#86868b")
      .font("Helvetica")
      .text(label, 50, yPos, { width: 250, continued: false });

    doc
      .fontSize(10)
      .fillColor("#1d1d1f")
      .font("Helvetica-Bold")
      .text(value, 300, yPos, { align: "right" });
  }

  /**
   * Add pricing row (for the blue pricing box)
   */
  private addPricingRow(
    doc: PDFKit.PDFDocument,
    label: string,
    value: string,
    yPos: number,
    bold: boolean = false,
  ) {
    const fontSize = bold ? 12 : 11;
    const font = bold ? "Helvetica-Bold" : "Helvetica";

    doc
      .fontSize(fontSize)
      .fillColor("#ffffff")
      .font(font)
      .text(label, 70, yPos, {
        width: doc.page.width - 140,
        continued: true,
      })
      .text(value, { align: "right" });
  }

  /**
   * Check if we need a page break and add new page if needed
   */
  private checkPageBreak(
    doc: PDFKit.PDFDocument,
    yPos: number,
    requiredSpace: number,
  ): number {
    if (yPos + requiredSpace > doc.page.height - 50) {
      doc.addPage();
      return 50; // Reset to top margin
    }
    return yPos;
  }
}

export const pdfGenerationService = new PDFGenerationService();
