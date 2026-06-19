import PDFDocument from "pdfkit";
import fs from "fs";
import path from "path";

import { env } from "../../config/env.js";
import { IOrder } from "../order/order.interface.js";

const formatCurrency = (amount: number) => {
  return `BDT ${amount.toFixed(2)}`;
};

const ensureDirectoryExists = (filePath: string) => {
  const dir = path.dirname(filePath);

  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, {
      recursive: true,
    });
  }
};

export const generateInvoicePdf = async (
  order: IOrder,
  outputPath: string,
): Promise<string> => {
  ensureDirectoryExists(outputPath);

  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({
      size: "A4",
      margin: 50,
    });

    const stream = fs.createWriteStream(outputPath);

    doc.pipe(stream);

    // Header
    doc.fontSize(22).text(env.invoice.companyName, {
      align: "left",
    });

    doc
      .fontSize(9)
      .text(env.invoice.companyAddress)
      .text(`Phone: ${env.invoice.companyPhone}`)
      .text(`Email: ${env.invoice.companyEmail}`);

    doc.moveDown();

    doc.fontSize(18).text("INVOICE", {
      align: "right",
    });

    doc
      .fontSize(10)
      .text(`Invoice No: ${order.invoiceNumber}`, {
        align: "right",
      })
      .text(`Order No: ${order.orderNumber}`, {
        align: "right",
      })
      .text(`Date: ${new Date().toLocaleDateString("en-GB")}`, {
        align: "right",
      });

    doc.moveDown(2);

    // Customer
    doc.fontSize(12).text("Bill To:", {
      underline: true,
    });

    doc
      .fontSize(10)
      .text(order.shippingAddress.fullName)
      .text(order.shippingAddress.mobile)
      .text(order.shippingAddress.addressLine)
      .text(
        `${order.shippingAddress.area || ""} ${order.shippingAddress.city || ""}`,
      )
      .text(order.shippingAddress.district);

    doc.moveDown(1);

    // Payment info
    doc
      .fontSize(10)
      .text(`Payment Method: ${order.paymentMethod}`)
      .text(`Payment Status: ${order.paymentStatus}`)
      .text(`Order Status: ${order.orderStatus}`);

    doc.moveDown(1.5);

    // Table Header
    const tableTop = doc.y;
    const itemX = 50;
    const qtyX = 300;
    const priceX = 360;
    const totalX = 450;

    doc
      .fontSize(10)
      .text("Item", itemX, tableTop)
      .text("Qty", qtyX, tableTop)
      .text("Price", priceX, tableTop)
      .text("Total", totalX, tableTop);

    doc
      .moveTo(50, tableTop + 15)
      .lineTo(550, tableTop + 15)
      .stroke();

    let y = tableTop + 25;

    order.items.forEach((item, index) => {
      const itemName =
        `${index + 1}. ${item.name}` +
        `${item.size ? ` / Size: ${item.size}` : ""}` +
        `${item.color ? ` / Color: ${item.color}` : ""}`;

      doc
        .fontSize(9)
        .text(itemName, itemX, y, {
          width: 240,
        })
        .text(String(item.quantity), qtyX, y)
        .text(formatCurrency(item.unitPrice), priceX, y)
        .text(formatCurrency(item.itemTotal), totalX, y);

      y += 35;

      if (y > 720) {
        doc.addPage();
        y = 50;
      }
    });

    doc.moveTo(50, y).lineTo(550, y).stroke();

    y += 20;

    // Totals
    doc
      .fontSize(10)
      .text("Subtotal:", 350, y)
      .text(formatCurrency(order.subtotal), 450, y);

    y += 18;

    doc
      .text("Shipping:", 350, y)
      .text(formatCurrency(order.shippingCharge), 450, y);

    y += 18;

    doc.text("Discount:", 350, y).text(formatCurrency(order.discount), 450, y);

    y += 18;

    doc
      .fontSize(12)
      .text("Total Payable:", 350, y)
      .text(formatCurrency(order.totalPayable), 450, y);

    doc.moveDown(3);

    doc
      .fontSize(9)
      .text("Thank you for shopping with us.", 50, y + 60)
      .text("This is a system generated invoice.", 50, y + 75);

    doc.end();

    stream.on("finish", () => {
      resolve(outputPath);
    });

    stream.on("error", reject);
  });
};
