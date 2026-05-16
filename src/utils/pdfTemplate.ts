import PDFDocument from "pdfkit";
import { Readable } from "stream";

export interface PDFTemplateData {
  title: string;
  subtitle?: string;
  content: {
    section: string;
    text: string;
  }[];
  footer?: string;
  metadata?: {
    author?: string;
    subject?: string;
    creator?: string;
  };
}

/**
 * Generates a PDF document with dynamic content
 * Returns a readable stream for efficient memory usage
 */
export function generatePDFTemplate(data: PDFTemplateData): Readable {
  const doc = new PDFDocument({
    margin: 50,
    bufferPages: true,
  });

  // Set PDF metadata
  if (data.metadata) {
    if (data.metadata.author) doc.author(data.metadata.author);
    if (data.metadata.subject) doc.subject(data.metadata.subject);
    if (data.metadata.creator) doc.creator(data.metadata.creator);
  }

  // Title
  doc.fontSize(24).font("Helvetica-Bold").text(data.title, { align: "center" });

  // Subtitle (optional)
  if (data.subtitle) {
    doc
      .fontSize(14)
      .font("Helvetica")
      .fillColor("#666666")
      .text(data.subtitle, { align: "center" });
  }

  // Add some spacing
  doc.moveDown(1);

  // Horizontal line
  doc
    .strokeColor("#000000")
    .lineWidth(1)
    .moveTo(50, doc.y)
    .lineTo(550, doc.y)
    .stroke();

  doc.moveDown(0.5);

  // Content sections
  data.content.forEach((item) => {
    // Section header
    doc
      .fontSize(12)
      .font("Helvetica-Bold")
      .fillColor("#000000")
      .text(item.section);

    // Section content
    doc.fontSize(10).font("Helvetica").fillColor("#333333").text(item.text, {
      align: "left",
      width: 500,
    });

    doc.moveDown(0.5);
  });

  // Footer with page numbers
  const pages = doc.bufferedPageRange().count;
  for (let i = 0; i < pages; i++) {
    doc.switchToPage(i);

    doc
      .fontSize(8)
      .font("Helvetica")
      .fillColor("#999999")
      .text(
        data.footer || `Generated on ${new Date().toLocaleDateString()}`,
        50,
        doc.page.height - 30,
        { align: "center" },
      );

    // Page number
    doc.text(`Page ${i + 1} of ${pages}`, 500, doc.page.height - 30, {
      align: "right",
    });
  }

  // End the PDF
  doc.end();

  return doc;
}

/**
 * Generates a PDF and returns it as a Buffer
 * Use this when you need the complete PDF in memory
 */
export async function generatePDFBuffer(
  data: PDFTemplateData,
): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({
      margin: 50,
      bufferPages: true,
    });

    const chunks: Buffer[] = [];

    doc.on("data", (chunk: Buffer) => {
      chunks.push(chunk);
    });

    doc.on("end", () => {
      resolve(Buffer.concat(chunks));
    });

    doc.on("error", reject);

    // Set PDF metadata
    if (data.metadata) {
      if (data.metadata.author) doc.author(data.metadata.author);
      if (data.metadata.subject) doc.subject(data.metadata.subject);
      if (data.metadata.creator) doc.creator(data.metadata.creator);
    }

    // Title
    doc
      .fontSize(24)
      .font("Helvetica-Bold")
      .text(data.title, { align: "center" });

    // Subtitle (optional)
    if (data.subtitle) {
      doc
        .fontSize(14)
        .font("Helvetica")
        .fillColor("#666666")
        .text(data.subtitle, { align: "center" });
    }

    // Add some spacing
    doc.moveDown(1);

    // Horizontal line
    doc
      .strokeColor("#000000")
      .lineWidth(1)
      .moveTo(50, doc.y)
      .lineTo(550, doc.y)
      .stroke();

    doc.moveDown(0.5);

    // Content sections
    data.content.forEach((item) => {
      // Section header
      doc
        .fontSize(12)
        .font("Helvetica-Bold")
        .fillColor("#000000")
        .text(item.section);

      // Section content
      doc.fontSize(10).font("Helvetica").fillColor("#333333").text(item.text, {
        align: "left",
        width: 500,
      });

      doc.moveDown(0.5);
    });

    // Footer with page numbers
    const pages = doc.bufferedPageRange().count;
    for (let i = 0; i < pages; i++) {
      doc.switchToPage(i);

      doc
        .fontSize(8)
        .font("Helvetica")
        .fillColor("#999999")
        .text(
          data.footer || `Generated on ${new Date().toLocaleDateString()}`,
          50,
          doc.page.height - 30,
          { align: "center" },
        );

      // Page number
      doc.text(`Page ${i + 1} of ${pages}`, 500, doc.page.height - 30, {
        align: "right",
      });
    }

    doc.end();
  });
}
