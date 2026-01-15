/**
 * PDF Generator Utility
 * Enhanced PDF generation with QR code for complaint reports
 */

import jsPDF from "jspdf"
import QRCode from "qrcode"

export interface ComplaintReportData {
  referenceId: string
  summary: string
  department: string
  priority: string
  severity?: string
  location?: string
  submittedAt: Date
  estimatedResolution?: string
  citizenName?: string
  isAnonymous?: boolean
}

/**
 * Generate QR code as data URL
 */
async function generateQRCode(text: string): Promise<string> {
  try {
    return await QRCode.toDataURL(text, {
      width: 200,
      margin: 1,
      color: {
        dark: "#0F4C81",
        light: "#FFFFFF",
      },
    })
  } catch (error) {
    console.error("QR code generation error:", error)
    return ""
  }
}

/**
 * Generate complaint report PDF
 */
export async function generateComplaintReport(
  data: ComplaintReportData
): Promise<void> {
  const doc = new jsPDF()
  const pageWidth = doc.internal.pageSize.getWidth()
  const pageHeight = doc.internal.pageSize.getHeight()

  // Colors
  const primaryColor = "#0F4C81"
  const secondaryColor = "#10B981"
  const textColor = "#374151"

  // Header Background
  doc.setFillColor(15, 76, 129) // #0F4C81
  doc.rect(0, 0, pageWidth, 40, "F")

  // Title
  doc.setTextColor(255, 255, 255)
  doc.setFontSize(24)
  doc.setFont("helvetica", "bold")
  doc.text("Grievance Report", pageWidth / 2, 20, { align: "center" })

  doc.setFontSize(10)
  doc.setFont("helvetica", "normal")
  doc.text("AI-Powered Civic Complaint System", pageWidth / 2, 30, {
    align: "center",
  })

  // Generate QR Code
  const trackingUrl = `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/status?ref=${data.referenceId}`
  const qrCodeDataUrl = await generateQRCode(trackingUrl)

  // QR Code (top right)
  if (qrCodeDataUrl) {
    doc.addImage(qrCodeDataUrl, "PNG", pageWidth - 55, 50, 40, 40)
    doc.setFontSize(8)
    doc.setTextColor(100, 100, 100)
    doc.text("Scan to track", pageWidth - 35, 95, { align: "center" })
  }

  // Reference ID (prominent)
  doc.setFillColor(249, 250, 251) // Light gray background
  doc.roundedRect(20, 50, pageWidth - 75, 25, 3, 3, "F")
  
  doc.setTextColor(100, 100, 100)
  doc.setFontSize(10)
  doc.text("Reference ID", 25, 60)
  
  doc.setTextColor(15, 76, 129)
  doc.setFontSize(18)
  doc.setFont("helvetica", "bold")
  doc.text(data.referenceId, 25, 70)

  // Submission Details
  let yPos = 105

  // Department
  doc.setFillColor(239, 246, 255) // Light blue
  doc.roundedRect(20, yPos, pageWidth - 40, 18, 2, 2, "F")
  doc.setTextColor(55, 65, 81)
  doc.setFontSize(9)
  doc.setFont("helvetica", "normal")
  doc.text("Department", 25, yPos + 7)
  doc.setFontSize(11)
  doc.setFont("helvetica", "bold")
  doc.text(data.department, 25, yPos + 14)
  yPos += 23

  // Priority & Severity (two columns)
  const colWidth = (pageWidth - 50) / 2

  // Priority
  const priorityColor: [number, number, number] =
    data.priority === "high"
      ? [239, 68, 68]
      : data.priority === "medium"
        ? [249, 115, 22]
        : [59, 130, 246]
  doc.setFillColor(priorityColor[0], priorityColor[1], priorityColor[2])
  doc.setFillColor(priorityColor[0], priorityColor[1], priorityColor[2], 0.1)
  doc.roundedRect(20, yPos, colWidth, 18, 2, 2, "F")
  doc.setTextColor(55, 65, 81)
  doc.setFontSize(9)
  doc.setFont("helvetica", "normal")
  doc.text("Priority", 25, yPos + 7)
  doc.setTextColor(priorityColor[0], priorityColor[1], priorityColor[2])
  doc.setFontSize(11)
  doc.setFont("helvetica", "bold")
  doc.text(data.priority.toUpperCase(), 25, yPos + 14)

  // Severity (if provided)
  if (data.severity) {
    doc.setFillColor(254, 243, 199) // Light yellow
    doc.roundedRect(25 + colWidth, yPos, colWidth, 18, 2, 2, "F")
    doc.setTextColor(55, 65, 81)
    doc.setFontSize(9)
    doc.setFont("helvetica", "normal")
    doc.text("Severity", 30 + colWidth, yPos + 7)
    doc.setFontSize(11)
    doc.setFont("helvetica", "bold")
    doc.text(data.severity, 30 + colWidth, yPos + 14)
  }
  yPos += 23

  // Date & Time
  doc.setTextColor(100, 100, 100)
  doc.setFontSize(9)
  doc.setFont("helvetica", "normal")
  doc.text("Submitted On", 20, yPos)
  doc.setTextColor(55, 65, 81)
  doc.setFontSize(10)
  doc.text(
    data.submittedAt.toLocaleString("en-IN", {
      dateStyle: "long",
      timeStyle: "short",
    }),
    20,
    yPos + 6
  )
  yPos += 18

  // Summary
  doc.setTextColor(100, 100, 100)
  doc.setFontSize(10)
  doc.setFont("helvetica", "bold")
  doc.text("Complaint Summary", 20, yPos)
  yPos += 8

  doc.setTextColor(55, 65, 81)
  doc.setFontSize(10)
  doc.setFont("helvetica", "normal")
  const summaryLines = doc.splitTextToSize(data.summary, pageWidth - 40)
  doc.text(summaryLines, 20, yPos)
  yPos += summaryLines.length * 5 + 10

  // Location (if provided)
  if (data.location) {
    doc.setTextColor(100, 100, 100)
    doc.setFontSize(10)
    doc.setFont("helvetica", "bold")
    doc.text("Location", 20, yPos)
    yPos += 8

    doc.setTextColor(55, 65, 81)
    doc.setFontSize(9)
    doc.setFont("helvetica", "normal")
    const locationLines = doc.splitTextToSize(data.location, pageWidth - 40)
    doc.text(locationLines, 20, yPos)
    yPos += locationLines.length * 5 + 10
  }

  // Estimated Resolution (if provided)
  if (data.estimatedResolution) {
    doc.setFillColor(236, 253, 245) // Light green
    doc.roundedRect(20, yPos, pageWidth - 40, 15, 2, 2, "F")
    doc.setTextColor(22, 163, 74)
    doc.setFontSize(9)
    doc.setFont("helvetica", "bold")
    doc.text("Estimated Resolution Time", 25, yPos + 6)
    doc.setFontSize(10)
    doc.text(data.estimatedResolution, 25, yPos + 11)
    yPos += 20
  }

  // Footer
  const footerY = pageHeight - 30
  doc.setDrawColor(200, 200, 200)
  doc.line(20, footerY, pageWidth - 20, footerY)

  doc.setTextColor(100, 100, 100)
  doc.setFontSize(8)
  doc.setFont("helvetica", "normal")
  doc.text(
    "This is a computer-generated report. For inquiries, visit:",
    pageWidth / 2,
    footerY + 5,
    { align: "center" }
  )
  doc.setTextColor(15, 76, 129)
  doc.text(
    process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
    pageWidth / 2,
    footerY + 10,
    { align: "center" }
  )

  if (!data.isAnonymous && data.citizenName) {
    doc.setTextColor(100, 100, 100)
    doc.setFontSize(7)
    doc.text(`Submitted by: ${data.citizenName}`, pageWidth / 2, footerY + 15, {
      align: "center",
    })
  }

  // Save PDF
  const fileName = `grievance-${data.referenceId}.pdf`
  doc.save(fileName)
}

/**
 * Generate and download PDF report
 */
export async function downloadComplaintReport(
  data: ComplaintReportData
): Promise<void> {
  try {
    await generateComplaintReport(data)
  } catch (error) {
    console.error("PDF generation error:", error)
    throw new Error("Failed to generate PDF report")
  }
}
