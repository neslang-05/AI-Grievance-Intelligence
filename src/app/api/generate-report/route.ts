import { NextRequest, NextResponse } from 'next/server'
import jsPDF from 'jspdf'
import QRCode from 'qrcode'

/**
 * POST /api/generate-report
 * Server-side PDF generation endpoint
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      referenceId,
      summary,
      department,
      priority,
      severity,
      location,
      estimatedResolution,
      submittedAt,
      isAnonymous,
      citizenName,
    } = body

    if (!referenceId || !summary || !department) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Generate PDF
    const doc = new jsPDF()
    const pageWidth = doc.internal.pageSize.getWidth()

    // Header
    doc.setFillColor(15, 76, 129)
    doc.rect(0, 0, pageWidth, 40, 'F')
    
    doc.setTextColor(255, 255, 255)
    doc.setFontSize(24)
    doc.setFont('helvetica', 'bold')
    doc.text('Grievance Report', pageWidth / 2, 20, { align: 'center' })
    
    doc.setFontSize(10)
    doc.setFont('helvetica', 'normal')
    doc.text('AI-Powered Civic Complaint System', pageWidth / 2, 30, {
      align: 'center',
    })

    // Generate QR Code
    const trackingUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/status?ref=${referenceId}`
    let qrCodeDataUrl = ''
    
    try {
      qrCodeDataUrl = await QRCode.toDataURL(trackingUrl, {
        width: 200,
        margin: 1,
        color: {
          dark: '#0F4C81',
          light: '#FFFFFF',
        },
      })
    } catch (error) {
      console.error('QR code generation failed:', error)
    }

    // Add QR Code
    if (qrCodeDataUrl) {
      doc.addImage(qrCodeDataUrl, 'PNG', pageWidth - 55, 50, 40, 40)
      doc.setFontSize(8)
      doc.setTextColor(100, 100, 100)
      doc.text('Scan to track', pageWidth - 35, 95, { align: 'center' })
    }

    // Reference ID
    doc.setFillColor(249, 250, 251)
    doc.roundedRect(20, 50, pageWidth - 75, 25, 3, 3, 'F')
    
    doc.setTextColor(100, 100, 100)
    doc.setFontSize(10)
    doc.text('Reference ID', 25, 60)
    
    doc.setTextColor(15, 76, 129)
    doc.setFontSize(18)
    doc.setFont('helvetica', 'bold')
    doc.text(referenceId, 25, 70)

    let yPos = 105

    // Department
    doc.setFillColor(239, 246, 255)
    doc.roundedRect(20, yPos, pageWidth - 40, 18, 2, 2, 'F')
    doc.setTextColor(55, 65, 81)
    doc.setFontSize(9)
    doc.setFont('helvetica', 'normal')
    doc.text('Department', 25, yPos + 7)
    doc.setFontSize(11)
    doc.setFont('helvetica', 'bold')
    doc.text(department, 25, yPos + 14)
    yPos += 23

    // Priority
    const colWidth = (pageWidth - 50) / 2
    doc.setFillColor(254, 243, 199)
    doc.roundedRect(20, yPos, colWidth, 18, 2, 2, 'F')
    doc.setTextColor(55, 65, 81)
    doc.setFontSize(9)
    doc.setFont('helvetica', 'normal')
    doc.text('Priority', 25, yPos + 7)
    doc.setTextColor(249, 115, 22)
    doc.setFontSize(11)
    doc.setFont('helvetica', 'bold')
    doc.text(priority.toUpperCase(), 25, yPos + 14)

    // Severity
    if (severity) {
      doc.setFillColor(254, 226, 226)
      doc.roundedRect(25 + colWidth, yPos, colWidth, 18, 2, 2, 'F')
      doc.setTextColor(55, 65, 81)
      doc.setFontSize(9)
      doc.setFont('helvetica', 'normal')
      doc.text('Severity', 30 + colWidth, yPos + 7)
      doc.setTextColor(239, 68, 68)
      doc.setFontSize(11)
      doc.setFont('helvetica', 'bold')
      doc.text(severity, 30 + colWidth, yPos + 14)
    }
    yPos += 23

    // Date
    doc.setTextColor(100, 100, 100)
    doc.setFontSize(9)
    doc.setFont('helvetica', 'normal')
    doc.text('Submitted On', 20, yPos)
    doc.setTextColor(55, 65, 81)
    doc.setFontSize(10)
    const date = submittedAt ? new Date(submittedAt) : new Date()
    doc.text(date.toLocaleString('en-IN', { dateStyle: 'long', timeStyle: 'short' }), 20, yPos + 6)
    yPos += 18

    // Summary
    doc.setTextColor(100, 100, 100)
    doc.setFontSize(10)
    doc.setFont('helvetica', 'bold')
    doc.text('Complaint Summary', 20, yPos)
    yPos += 8

    doc.setTextColor(55, 65, 81)
    doc.setFontSize(10)
    doc.setFont('helvetica', 'normal')
    const summaryLines = doc.splitTextToSize(summary, pageWidth - 40)
    doc.text(summaryLines, 20, yPos)
    yPos += summaryLines.length * 5 + 10

    // Location
    if (location) {
      doc.setTextColor(100, 100, 100)
      doc.setFontSize(10)
      doc.setFont('helvetica', 'bold')
      doc.text('Location', 20, yPos)
      yPos += 8

      doc.setTextColor(55, 65, 81)
      doc.setFontSize(9)
      doc.setFont('helvetica', 'normal')
      const locationLines = doc.splitTextToSize(location, pageWidth - 40)
      doc.text(locationLines, 20, yPos)
      yPos += locationLines.length * 5 + 10
    }

    // Estimated Resolution
    if (estimatedResolution) {
      doc.setFillColor(236, 253, 245)
      doc.roundedRect(20, yPos, pageWidth - 40, 15, 2, 2, 'F')
      doc.setTextColor(22, 163, 74)
      doc.setFontSize(9)
      doc.setFont('helvetica', 'bold')
      doc.text('Estimated Resolution Time', 25, yPos + 6)
      doc.setFontSize(10)
      doc.text(estimatedResolution, 25, yPos + 11)
    }

    // Convert PDF to base64
    const pdfBase64 = doc.output('datauristring')

    return NextResponse.json({
      success: true,
      pdf: pdfBase64,
      fileName: `grievance-${referenceId}.pdf`,
    })
  } catch (error) {
    console.error('PDF generation error:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to generate report',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
